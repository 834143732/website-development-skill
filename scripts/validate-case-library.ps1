[CmdletBinding()]
param(
    [string]$CasesPath,
    [string]$SchemaPath,
    [string]$IndexPath
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($CasesPath)) {
    $CasesPath = Join-Path $repositoryRoot 'cases'
}
if ([string]::IsNullOrWhiteSpace($SchemaPath)) {
    $SchemaPath = Join-Path $repositoryRoot 'cases/case.schema.json'
}
if ([string]::IsNullOrWhiteSpace($IndexPath)) {
    $IndexPath = Join-Path $repositoryRoot 'cases/README.md'
}
$script:ValidationErrors = New-Object 'System.Collections.Generic.List[string]'

function Add-ValidationError {
    param(
        [Parameter(Mandatory = $true)][string]$CaseName,
        [Parameter(Mandatory = $true)][string]$Field,
        [Parameter(Mandatory = $true)][string]$Message
    )

    $script:ValidationErrors.Add(("[{0}] {1}: {2}" -f $CaseName, $Field, $Message)) | Out-Null
}

function Test-IsJsonObject {
    param([AllowNull()][object]$Value)
    return $null -ne $Value -and $Value -is [pscustomobject] -and -not ($Value -is [System.Array])
}

function Get-ExactProperty {
    param(
        [AllowNull()][object]$Object,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if (-not (Test-IsJsonObject $Object)) {
        return $null
    }
    $matches = @($Object.PSObject.Properties | Where-Object { $_.Name -ceq $Name })
    if ($matches.Count -eq 0) {
        return $null
    }
    return $matches[0]
}

function Test-NonEmptyString {
    param([AllowNull()][object]$Value)
    return $Value -is [string] -and -not [string]::IsNullOrWhiteSpace($Value)
}

function Test-ExactDate {
    param([AllowNull()][object]$Value)

    if ($Value -isnot [string]) {
        return $false
    }
    $parsed = [datetime]::MinValue
    return [datetime]::TryParseExact(
        $Value,
        'yyyy-MM-dd',
        [System.Globalization.CultureInfo]::InvariantCulture,
        [System.Globalization.DateTimeStyles]::None,
        [ref]$parsed
    )
}

function Test-StringArray {
    param(
        [Parameter(Mandatory = $true)][string]$CaseName,
        [Parameter(Mandatory = $true)][string]$Field,
        [AllowNull()][object]$Value,
        [bool]$RequireItems = $false,
        [bool]$RequireNonEmptyItems = $false,
        [bool]$RequireUnique = $false
    )

    if ($Value -isnot [System.Array]) {
        Add-ValidationError $CaseName $Field 'must be an array'
        return $false
    }
    if ($RequireItems -and $Value.Count -eq 0) {
        Add-ValidationError $CaseName $Field 'must contain at least one item'
    }

    $seen = @()
    for ($index = 0; $index -lt $Value.Count; $index++) {
        $item = $Value[$index]
        if ($item -isnot [string]) {
            Add-ValidationError $CaseName ("{0}[{1}]" -f $Field, $index) 'must be a string'
            continue
        }
        if ($RequireNonEmptyItems -and [string]::IsNullOrWhiteSpace($item)) {
            Add-ValidationError $CaseName ("{0}[{1}]" -f $Field, $index) 'must be a nonempty string'
        }
        if ($RequireUnique -and $seen -ccontains $item) {
            Add-ValidationError $CaseName $Field ("must contain unique items; duplicate: {0}" -f $item)
        }
        else {
            $seen += $item
        }
    }
    return $true
}

function Resolve-InputItem {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Field,
        [Parameter(Mandatory = $true)][ValidateSet('Leaf', 'Container')][string]$ExpectedType
    )

    try {
        $item = Get-Item -LiteralPath $Path -Force -ErrorAction Stop
    }
    catch {
        Add-ValidationError 'library' $Field ("could not resolve path: {0}" -f $Path)
        return $null
    }

    if ($ExpectedType -eq 'Container' -and -not $item.PSIsContainer) {
        Add-ValidationError 'library' $Field 'must resolve to a directory'
        return $null
    }
    if ($ExpectedType -eq 'Leaf' -and $item.PSIsContainer) {
        Add-ValidationError 'library' $Field 'must resolve to a file'
        return $null
    }
    return $item
}

function Test-NoReparsePointComponents {
    param(
        [Parameter(Mandatory = $true)][string]$CaseName,
        [Parameter(Mandatory = $true)][string]$Field,
        [Parameter(Mandatory = $true)][string]$CaseRoot,
        [Parameter(Mandatory = $true)][string]$Candidate
    )

    try {
        $rootFull = [System.IO.Path]::GetFullPath($CaseRoot).TrimEnd('\', '/')
        $relative = $Candidate.Substring($rootFull.Length).TrimStart('\', '/')
        $components = @($relative -split '[\\/]' | Where-Object { $_.Length -gt 0 })
        $current = $rootFull
        $rootItem = Get-Item -LiteralPath $current -Force -ErrorAction Stop
        if (($rootItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            Add-ValidationError $CaseName $Field 'must not traverse a reparse point: .'
            return $false
        }

        foreach ($component in $components) {
            $current = Join-Path $current $component
            if (-not (Test-Path -LiteralPath $current)) {
                break
            }
            $item = Get-Item -LiteralPath $current -Force -ErrorAction Stop
            if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
                $displayPath = $current.Substring($rootFull.Length).TrimStart('\', '/').Replace('\', '/')
                Add-ValidationError $CaseName $Field ("must not traverse a reparse point: {0}" -f $displayPath)
                return $false
            }
        }
        return $true
    }
    catch {
        Add-ValidationError $CaseName $Field ("could not inspect path components for reparse points: {0}" -f $_.Exception.Message)
        return $false
    }
}

function Test-SafeCasePath {
    param(
        [Parameter(Mandatory = $true)][string]$CaseName,
        [Parameter(Mandatory = $true)][string]$Field,
        [AllowNull()][object]$Value,
        [Parameter(Mandatory = $true)][string]$CaseRoot,
        [Parameter(Mandatory = $true)][ref]$ResolvedPath
    )

    $ResolvedPath.Value = $null
    if (-not (Test-NonEmptyString $Value)) {
        Add-ValidationError $CaseName $Field 'must be a nonempty relative path string'
        return $false
    }
    if ($Value.Contains('\')) {
        Add-ValidationError $CaseName $Field 'must be a forward-slash relative path'
        return $false
    }
    $segments = $Value.Split('/')
    if ([System.IO.Path]::IsPathRooted($Value) -or $Value -match '^[A-Za-z]:' -or $segments -contains '..') {
        Add-ValidationError $CaseName $Field 'must be a safe relative path without rooted, drive, or .. segments'
        return $false
    }

    try {
        $rootFull = [System.IO.Path]::GetFullPath($CaseRoot).TrimEnd('\', '/')
        $nativeRelative = $Value.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $candidate = [System.IO.Path]::GetFullPath((Join-Path $rootFull $nativeRelative))
        $rootBoundary = $rootFull + [System.IO.Path]::DirectorySeparatorChar
        if (-not $candidate.StartsWith($rootBoundary, [System.StringComparison]::OrdinalIgnoreCase)) {
            Add-ValidationError $CaseName $Field 'must resolve inside the case directory'
            return $false
        }
        if (-not (Test-NoReparsePointComponents $CaseName $Field $rootFull $candidate)) {
            return $false
        }
        $ResolvedPath.Value = $candidate
        return $true
    }
    catch {
        Add-ValidationError $CaseName $Field ("could not resolve relative path: {0}" -f $Value)
        return $false
    }
}

function Test-DeclaredPath {
    param(
        [Parameter(Mandatory = $true)][string]$CaseName,
        [Parameter(Mandatory = $true)][string]$Field,
        [AllowNull()][object]$Value,
        [Parameter(Mandatory = $true)][string]$CaseRoot,
        [Parameter(Mandatory = $true)][ValidateSet('Leaf', 'Container')][string]$ExpectedType
    )

    $resolved = $null
    if (-not (Test-SafeCasePath $CaseName $Field $Value $CaseRoot ([ref]$resolved))) {
        return $null
    }
    try {
        if (-not (Test-Path -LiteralPath $resolved)) {
            Add-ValidationError $CaseName $Field ("{0} is missing" -f $Value)
            return $null
        }
        $item = Get-Item -LiteralPath $resolved -Force -ErrorAction Stop
    }
    catch {
        Add-ValidationError $CaseName $Field ("could not inspect declared path {0}: {1}" -f $Value, $_.Exception.Message)
        return $null
    }
    if ($ExpectedType -eq 'Leaf' -and $item.PSIsContainer) {
        Add-ValidationError $CaseName $Field ("must resolve to a file: {0}" -f $Value)
        return $null
    }
    if ($ExpectedType -eq 'Container' -and -not $item.PSIsContainer) {
        Add-ValidationError $CaseName $Field ("must resolve to a directory: {0}" -f $Value)
        return $null
    }
    return $item
}

function Validate-RequiredNonEmptyString {
    param(
        [Parameter(Mandatory = $true)][string]$CaseName,
        [Parameter(Mandatory = $true)][string]$Field,
        [Parameter(Mandatory = $true)][object]$Object
    )

    $property = Get-ExactProperty $Object $Field
    if ($null -eq $property) {
        return
    }
    if ($property.Value -isnot [string]) {
        Add-ValidationError $CaseName $Field 'must be a string'
    }
    elseif ([string]::IsNullOrWhiteSpace($property.Value)) {
        Add-ValidationError $CaseName $Field 'must be a nonempty string'
    }
}

function Validate-Evidence {
    param(
        [Parameter(Mandatory = $true)][string]$CaseName,
        [AllowNull()][object]$Evidence,
        [AllowNull()][object]$TopObservedAt
    )

    if (-not (Test-IsJsonObject $Evidence)) {
        Add-ValidationError $CaseName 'evidence' 'must be an object'
        return
    }
    foreach ($name in @('status', 'observations')) {
        if ($null -eq (Get-ExactProperty $Evidence $name)) {
            Add-ValidationError $CaseName ("evidence.{0}" -f $name) 'required property is missing'
        }
    }

    $status = Get-ExactProperty $Evidence 'status'
    if ($null -ne $status -and -not (Test-NonEmptyString $status.Value)) {
        Add-ValidationError $CaseName 'evidence.status' 'must be a nonempty string'
    }

    $observations = Get-ExactProperty $Evidence 'observations'
    if ($null -eq $observations) {
        return
    }
    if ($observations.Value -isnot [System.Array]) {
        Add-ValidationError $CaseName 'evidence.observations' 'must be an array'
        return
    }
    if ($observations.Value.Count -eq 0) {
        Add-ValidationError $CaseName 'evidence.observations' 'must contain at least one observation'
    }

    $allObservationDatesValid = $true
    $validObservationDates = New-Object 'System.Collections.Generic.List[string]'
    for ($index = 0; $index -lt $observations.Value.Count; $index++) {
        $observation = $observations.Value[$index]
        $prefix = "evidence.observations[$index]"
        if (-not (Test-IsJsonObject $observation)) {
            Add-ValidationError $CaseName $prefix 'must be an object'
            $allObservationDatesValid = $false
            continue
        }
        foreach ($name in @('observed_at', 'scope', 'checked', 'not_checked', 'notes')) {
            if ($null -eq (Get-ExactProperty $observation $name)) {
                Add-ValidationError $CaseName ("{0}.{1}" -f $prefix, $name) 'required property is missing'
            }
        }

        $date = Get-ExactProperty $observation 'observed_at'
        if ($null -eq $date) {
            $allObservationDatesValid = $false
        }
        elseif (-not (Test-ExactDate $date.Value)) {
            Add-ValidationError $CaseName ("{0}.observed_at" -f $prefix) 'must be an ISO date in yyyy-MM-dd format'
            $allObservationDatesValid = $false
        }
        else {
            $validObservationDates.Add($date.Value) | Out-Null
        }
        foreach ($arrayName in @('scope', 'checked', 'not_checked', 'notes')) {
            $arrayProperty = Get-ExactProperty $observation $arrayName
            if ($null -ne $arrayProperty) {
                $requiresItems = $arrayName -ceq 'scope'
                $null = Test-StringArray $CaseName ("{0}.{1}" -f $prefix, $arrayName) $arrayProperty.Value $requiresItems $true $false
            }
        }
    }

    if ($observations.Value.Count -gt 0 -and $allObservationDatesValid -and
        $validObservationDates.Count -eq $observations.Value.Count -and (Test-ExactDate $TopObservedAt)) {
        $latestObservationDate = @($validObservationDates | Sort-Object -Descending)[0]
        if ($TopObservedAt -cne $latestObservationDate) {
            Add-ValidationError $CaseName 'observed_at' ("must equal latest observation date {0}" -f $latestObservationDate)
        }
    }
}

function Validate-ObjectArray {
    param(
        [Parameter(Mandatory = $true)][string]$CaseName,
        [Parameter(Mandatory = $true)][string]$Field,
        [AllowNull()][object]$Value,
        [Parameter(Mandatory = $true)][string[]]$RequiredStrings
    )

    if ($Value -isnot [System.Array]) {
        Add-ValidationError $CaseName $Field 'must be an array'
        return
    }
    for ($index = 0; $index -lt $Value.Count; $index++) {
        $item = $Value[$index]
        $prefix = "${Field}[$index]"
        if (-not (Test-IsJsonObject $item)) {
            Add-ValidationError $CaseName $prefix 'must be an object'
            continue
        }
        foreach ($name in $RequiredStrings) {
            $property = Get-ExactProperty $item $name
            if ($null -eq $property) {
                Add-ValidationError $CaseName ("{0}.{1}" -f $prefix, $name) 'required property is missing'
            }
            elseif (-not (Test-NonEmptyString $property.Value)) {
                Add-ValidationError $CaseName ("{0}.{1}" -f $prefix, $name) 'must be a nonempty string'
            }
        }
    }
}

function Validate-SourceAssets {
    param(
        [Parameter(Mandatory = $true)][string]$CaseName,
        [AllowNull()][object]$Value,
        [Parameter(Mandatory = $true)][string]$CaseRoot,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$ArtifactLevel
    )

    if ($Value -isnot [System.Array]) {
        Add-ValidationError $CaseName 'source_assets' 'must be an array'
        return
    }
    if ($ArtifactLevel -ceq 'snapshot' -and $Value.Count -eq 0) {
        Add-ValidationError $CaseName 'source_assets' 'snapshot cases must select at least one source asset'
    }
    for ($index = 0; $index -lt $Value.Count; $index++) {
        $asset = $Value[$index]
        $prefix = "source_assets[$index]"
        if (-not (Test-IsJsonObject $asset)) {
            Add-ValidationError $CaseName $prefix 'must be an object'
            continue
        }
        foreach ($name in @('file', 'kind', 'role')) {
            $property = Get-ExactProperty $asset $name
            if ($null -eq $property) {
                Add-ValidationError $CaseName ("{0}.{1}" -f $prefix, $name) 'required property is missing'
            }
            elseif (-not (Test-NonEmptyString $property.Value)) {
                Add-ValidationError $CaseName ("{0}.{1}" -f $prefix, $name) 'must be a nonempty string'
            }
        }
        $file = Get-ExactProperty $asset 'file'
        if ($null -ne $file -and $file.Value -is [string]) {
            $null = Test-DeclaredPath $CaseName ("{0}.file" -f $prefix) $file.Value $CaseRoot 'Leaf'
        }
    }
}

function Validate-CaseFiles {
    param(
        [Parameter(Mandatory = $true)][string]$CaseName,
        [AllowNull()][object]$CaseFiles,
        [Parameter(Mandatory = $true)][string]$CaseRoot,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$ArtifactLevel
    )

    if (-not (Test-IsJsonObject $CaseFiles)) {
        Add-ValidationError $CaseName 'case_files' 'must be an object'
        return
    }

    $allowed = @('readme', 'metadata', 'review_page', 'source_root', 'supporting_files')
    foreach ($property in $CaseFiles.PSObject.Properties) {
        if ($allowed -cnotcontains $property.Name) {
            Add-ValidationError $CaseName ("case_files.{0}" -f $property.Name) 'field is not allowed'
        }
    }
    foreach ($name in @('readme', 'metadata')) {
        if ($null -eq (Get-ExactProperty $CaseFiles $name)) {
            Add-ValidationError $CaseName ("case_files.{0}" -f $name) 'required property is missing'
        }
    }
    if ($ArtifactLevel -ceq 'snapshot') {
        foreach ($name in @('review_page', 'source_root')) {
            if ($null -eq (Get-ExactProperty $CaseFiles $name)) {
                Add-ValidationError $CaseName ("case_files.{0}" -f $name) 'snapshot cases must declare this field'
            }
        }
    }

    $fixedFiles = [ordered]@{
        readme = 'README.md'
        metadata = 'case.json'
        review_page = 'index.html'
    }
    foreach ($name in $fixedFiles.Keys) {
        $property = Get-ExactProperty $CaseFiles $name
        if ($null -eq $property) {
            continue
        }
        if ($property.Value -isnot [string]) {
            Add-ValidationError $CaseName ("case_files.{0}" -f $name) 'must be a string'
            continue
        }
        if ($property.Value -cne $fixedFiles[$name]) {
            Add-ValidationError $CaseName ("case_files.{0}" -f $name) ("must equal {0}" -f $fixedFiles[$name])
        }
        $null = Test-DeclaredPath $CaseName ("case_files.{0}" -f $name) $property.Value $CaseRoot 'Leaf'
    }

    $sourceRoot = Get-ExactProperty $CaseFiles 'source_root'
    if ($null -ne $sourceRoot) {
        if ($sourceRoot.Value -isnot [string]) {
            Add-ValidationError $CaseName 'case_files.source_root' 'must be a string'
        }
        else {
            if ($sourceRoot.Value -cne 'assets/source') {
                Add-ValidationError $CaseName 'case_files.source_root' 'must equal assets/source'
            }
            $sourceItem = Test-DeclaredPath $CaseName 'case_files.source_root' $sourceRoot.Value $CaseRoot 'Container'
            if ($null -ne $sourceItem -and $ArtifactLevel -ceq 'snapshot') {
                try {
                    $firstFile = Get-ChildItem -LiteralPath $sourceItem.FullName -Recurse -Force -File -ErrorAction Stop | Select-Object -First 1
                    if ($null -eq $firstFile) {
                        Add-ValidationError $CaseName 'case_files.source_root' 'snapshot source_root must not be empty'
                    }
                }
                catch {
                    Add-ValidationError $CaseName 'case_files.source_root' ("could not inspect source_root: {0}" -f $_.Exception.Message)
                }
            }
        }
    }

    $supporting = Get-ExactProperty $CaseFiles 'supporting_files'
    if ($null -ne $supporting) {
        if (Test-StringArray $CaseName 'case_files.supporting_files' $supporting.Value $false $true $true) {
            for ($index = 0; $index -lt $supporting.Value.Count; $index++) {
                if ($supporting.Value[$index] -is [string]) {
                    $null = Test-DeclaredPath $CaseName ("case_files.supporting_files[{0}]" -f $index) $supporting.Value[$index] $CaseRoot 'Leaf'
                }
            }
        }
    }

    $physicalReviewPage = Join-Path $CaseRoot 'index.html'
    if ((Test-Path -LiteralPath $physicalReviewPage -PathType Leaf) -and $null -eq (Get-ExactProperty $CaseFiles 'review_page')) {
        Add-ValidationError $CaseName 'index.html' 'exists but case_files.review_page is not declared'
    }
    $physicalSourceRoot = Join-Path $CaseRoot 'assets/source'
    if ((Test-Path -LiteralPath $physicalSourceRoot -PathType Container) -and $null -eq (Get-ExactProperty $CaseFiles 'source_root')) {
        Add-ValidationError $CaseName 'assets/source' 'exists but case_files.source_root is not declared'
    }
}

function Validate-Case {
    param([Parameter(Mandatory = $true)][System.IO.DirectoryInfo]$CaseDirectory)

    $caseName = $CaseDirectory.Name
    $metadataPath = Join-Path $CaseDirectory.FullName 'case.json'
    if (-not (Test-Path -LiteralPath $metadataPath -PathType Leaf)) {
        Add-ValidationError $caseName 'case.json' 'required metadata file is missing'
        return
    }

    try {
        $raw = Get-Content -LiteralPath $metadataPath -Raw
        $trimmed = $raw.TrimStart()
        if ($trimmed.StartsWith('[')) {
            Add-ValidationError $caseName 'case.json' 'must contain a JSON object, not an array'
            return
        }
        $metadata = $raw | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        Add-ValidationError $caseName 'case.json JSON' ("could not parse JSON: {0}" -f $_.Exception.Message)
        return
    }
    if (-not (Test-IsJsonObject $metadata)) {
        Add-ValidationError $caseName 'case.json' 'must contain a JSON object'
        return
    }

    $required = @(
        'schema_version', 'slug', 'artifact_level', 'title', 'source', 'observed_at',
        'language', 'industry', 'page_type', 'evidence', 'site_facts',
        'transferable_patterns', 'do_not_copy', 'source_assets', 'case_files'
    )
    foreach ($name in $required) {
        if ($null -eq (Get-ExactProperty $metadata $name)) {
            Add-ValidationError $caseName $name 'required property is missing'
        }
    }

    $schemaVersion = Get-ExactProperty $metadata 'schema_version'
    if ($null -ne $schemaVersion) {
        if ($schemaVersion.Value -isnot [string]) {
            Add-ValidationError $caseName 'schema_version' 'must be a string'
        }
        elseif ($schemaVersion.Value -cne '1.0.0') {
            Add-ValidationError $caseName 'schema_version' 'must equal 1.0.0'
        }
    }

    $slug = Get-ExactProperty $metadata 'slug'
    if ($null -ne $slug) {
        if ($slug.Value -isnot [string]) {
            Add-ValidationError $caseName 'slug' 'must be a string'
        }
        else {
            if ($slug.Value -cnotmatch '^[a-z0-9]+(?:[-_][a-z0-9]+)*$') {
                Add-ValidationError $caseName 'slug' 'must use lowercase alphanumeric segments separated by - or _'
            }
            if ($slug.Value -cne $caseName) {
                Add-ValidationError $caseName 'slug' ("must exactly match directory name {0}" -f $caseName)
            }
        }
    }

    $artifactLevelValue = ''
    $artifactLevel = Get-ExactProperty $metadata 'artifact_level'
    if ($null -ne $artifactLevel) {
        if ($artifactLevel.Value -isnot [string]) {
            Add-ValidationError $caseName 'artifact_level' 'must be a string'
        }
        else {
            $artifactLevelValue = $artifactLevel.Value
            if (@('review', 'snapshot') -cnotcontains $artifactLevelValue) {
                Add-ValidationError $caseName 'artifact_level' 'must be review or snapshot'
            }
        }
    }

    Validate-RequiredNonEmptyString $caseName 'title' $metadata
    Validate-RequiredNonEmptyString $caseName 'page_type' $metadata

    $source = Get-ExactProperty $metadata 'source'
    if ($null -ne $source) {
        if ($source.Value -isnot [string]) {
            Add-ValidationError $caseName 'source' 'must be a string containing an HTTP(S) URI'
        }
        elseif ([regex]::IsMatch($source.Value, '\s')) {
            Add-ValidationError $caseName 'source' 'must not contain leading, trailing, or embedded whitespace'
        }
        else {
            [uri]$uri = $null
            if (-not [uri]::TryCreate($source.Value, [System.UriKind]::Absolute, [ref]$uri) -or @('http', 'https') -cnotcontains $uri.Scheme) {
                Add-ValidationError $caseName 'source' 'must be an absolute HTTP(S) URI'
            }
        }
    }

    $observedAt = Get-ExactProperty $metadata 'observed_at'
    if ($null -ne $observedAt -and -not (Test-ExactDate $observedAt.Value)) {
        Add-ValidationError $caseName 'observed_at' 'must be an ISO date in yyyy-MM-dd format'
    }

    $language = Get-ExactProperty $metadata 'language'
    if ($null -ne $language) {
        if ($language.Value -isnot [string]) {
            Add-ValidationError $caseName 'language' 'must be a string'
        }
        elseif ($language.Value -cnotmatch '^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$') {
            Add-ValidationError $caseName 'language' 'must be a BCP 47 language tag'
        }
    }
    $languages = Get-ExactProperty $metadata 'languages'
    if ($null -ne $languages) {
        if (Test-StringArray $caseName 'languages' $languages.Value $false $true $true) {
            for ($index = 0; $index -lt $languages.Value.Count; $index++) {
                if ($languages.Value[$index] -is [string] -and $languages.Value[$index] -cnotmatch '^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$') {
                    Add-ValidationError $caseName ("languages[{0}]" -f $index) 'must be a BCP 47 language tag'
                }
            }
        }
    }

    $industry = Get-ExactProperty $metadata 'industry'
    if ($null -ne $industry) {
        $null = Test-StringArray $caseName 'industry' $industry.Value $true $true $false
    }

    $evidence = Get-ExactProperty $metadata 'evidence'
    if ($null -ne $evidence) {
        $topObservedAtValue = if ($null -ne $observedAt) { $observedAt.Value } else { $null }
        Validate-Evidence $caseName $evidence.Value $topObservedAtValue
    }

    $siteFacts = Get-ExactProperty $metadata 'site_facts'
    if ($null -ne $siteFacts) {
        $null = Test-StringArray $caseName 'site_facts' $siteFacts.Value $false $true $false
    }

    $sourceClaims = Get-ExactProperty $metadata 'source_claims'
    if ($null -ne $sourceClaims) {
        Validate-ObjectArray $caseName 'source_claims' $sourceClaims.Value @('claim', 'location', 'verification')
    }

    $patterns = Get-ExactProperty $metadata 'transferable_patterns'
    if ($null -ne $patterns) {
        Validate-ObjectArray $caseName 'transferable_patterns' $patterns.Value @('name', 'when', 'use', 'guardrail')
    }

    $doNotCopy = Get-ExactProperty $metadata 'do_not_copy'
    if ($null -ne $doNotCopy) {
        $null = Test-StringArray $caseName 'do_not_copy' $doNotCopy.Value $true $true $false
    }

    $sourceAssets = Get-ExactProperty $metadata 'source_assets'
    if ($null -ne $sourceAssets) {
        Validate-SourceAssets $caseName $sourceAssets.Value $CaseDirectory.FullName $artifactLevelValue
    }

    $caseFiles = Get-ExactProperty $metadata 'case_files'
    if ($null -ne $caseFiles) {
        Validate-CaseFiles $caseName $caseFiles.Value $CaseDirectory.FullName $artifactLevelValue
    }
}

$casesItem = Resolve-InputItem $CasesPath 'CasesPath' 'Container'
$schemaItem = Resolve-InputItem $SchemaPath 'SchemaPath' 'Leaf'
$indexItem = Resolve-InputItem $IndexPath 'IndexPath' 'Leaf'

if ($null -ne $schemaItem) {
    try {
        $schemaRaw = Get-Content -LiteralPath $schemaItem.FullName -Raw
        $schemaTrimmed = $schemaRaw.TrimStart()
        if ($schemaTrimmed.StartsWith('[')) {
            Add-ValidationError 'schema' 'schema' 'must contain a JSON object, not an array'
            $schema = $null
        }
        else {
            $schema = $schemaRaw | ConvertFrom-Json -ErrorAction Stop
        }
    }
    catch {
        Add-ValidationError 'schema' 'schema JSON' ("could not parse JSON: {0}" -f $_.Exception.Message)
        $schema = $null
    }

    if (-not (Test-IsJsonObject $schema)) {
        Add-ValidationError 'schema' 'schema' 'must contain a JSON object'
    }
    else {
        $properties = Get-ExactProperty $schema 'properties'
        $versionDefinition = if ($null -ne $properties -and (Test-IsJsonObject $properties.Value)) {
            Get-ExactProperty $properties.Value 'schema_version'
        }
        else { $null }
        $const = if ($null -ne $versionDefinition -and (Test-IsJsonObject $versionDefinition.Value)) {
            Get-ExactProperty $versionDefinition.Value 'const'
        }
        else { $null }
        if ($null -eq $const -or $const.Value -isnot [string] -or $const.Value -cne '1.0.0') {
            Add-ValidationError 'schema' 'schema' 'properties.schema_version.const must be scalar 1.0.0'
        }
    }
}

$caseDirectories = @()
if ($null -ne $casesItem) {
    try {
        $caseDirectories = @(Get-ChildItem -LiteralPath $casesItem.FullName -Force -Directory | Sort-Object Name)
    }
    catch {
        Add-ValidationError 'library' 'CasesPath' ("could not enumerate case directories: {0}" -f $_.Exception.Message)
    }
    foreach ($caseDirectory in $caseDirectories) {
        try {
            Validate-Case $caseDirectory
        }
        catch {
            Add-ValidationError $caseDirectory.Name 'case.json' ("unexpected validation error: {0}" -f $_.Exception.Message)
        }
    }
}

if ($null -ne $indexItem) {
    try {
        $indexContent = Get-Content -LiteralPath $indexItem.FullName -Raw
        $matches = [regex]::Matches($indexContent, '\]\((?<slug>[a-z0-9]+(?:[-_][a-z0-9]+)*)/\)')
        $counts = @{}
        foreach ($match in $matches) {
            $indexedSlug = $match.Groups['slug'].Value
            if ($counts.ContainsKey($indexedSlug)) {
                $counts[$indexedSlug]++
            }
            else {
                $counts[$indexedSlug] = 1
            }
        }

        $directoryNames = @($caseDirectories | ForEach-Object { $_.Name })
        foreach ($directoryName in $directoryNames) {
            if (-not $counts.ContainsKey($directoryName)) {
                Add-ValidationError 'index' 'index' ("missing case directory entry: {0}" -f $directoryName)
            }
            elseif ($counts[$directoryName] -gt 1) {
                Add-ValidationError 'index' 'index' ("duplicate entry for {0}" -f $directoryName)
            }
        }
        foreach ($indexedSlug in $counts.Keys) {
            if ($directoryNames -cnotcontains $indexedSlug) {
                Add-ValidationError 'index' 'index' ("entry {0} has no case directory" -f $indexedSlug)
            }
        }
    }
    catch {
        Add-ValidationError 'index' 'index' ("could not read or parse index: {0}" -f $_.Exception.Message)
    }
}

if ($script:ValidationErrors.Count -gt 0) {
    $script:ValidationErrors | Sort-Object | ForEach-Object { Write-Output ("ERROR {0}" -f $_) }
    exit 1
}

Write-Output ("Case library validation passed: {0} cases." -f $caseDirectories.Count)
exit 0
