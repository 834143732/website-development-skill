[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$script:RepositoryRoot = Split-Path -Parent $PSScriptRoot
$script:ValidatorPath = Join-Path $PSScriptRoot 'validate-case-library.ps1'
$script:ProductionSchemaPath = Join-Path $script:RepositoryRoot 'cases/case.schema.json'
$script:Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$script:ContractPassed = 0
$script:ContractFailed = 0
$script:ContractBlocked = 0

function Write-Utf8File {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
    )

    $parent = Split-Path -Parent $Path
    if ($parent -and -not (Test-Path -LiteralPath $parent -PathType Container)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    [System.IO.File]::WriteAllText($Path, $Content, $script:Utf8NoBom)
}

function Write-MinimalSchema {
    param([Parameter(Mandatory = $true)][string]$Path)

    $schema = [ordered]@{
        type = 'object'
        properties = [ordered]@{
            schema_version = [ordered]@{
                const = '1.0.0'
            }
        }
    }
    Write-Utf8File -Path $Path -Content ($schema | ConvertTo-Json -Depth 12)
}

function New-ValidReviewCase {
    param(
        [Parameter(Mandatory = $true)][string]$CasesPath,
        [Parameter(Mandatory = $true)][string]$IndexPath
    )

    $casePath = Join-Path $CasesPath 'alpha'
    New-Item -ItemType Directory -Path $casePath -Force | Out-Null
    Write-Utf8File -Path (Join-Path $casePath 'README.md') -Content "# Alpha`n"

    $metadata = [ordered]@{
        schema_version = '1.0.0'
        slug = 'alpha'
        artifact_level = 'review'
        title = 'Alpha case'
        source = 'https://example.com/'
        observed_at = '2026-08-24'
        language = 'en'
        industry = @('Testing')
        page_type = 'home page'
        evidence = [ordered]@{
            status = 'observed'
            observations = @(
                [ordered]@{
                    observed_at = '2026-08-24'
                    scope = @('home page')
                    checked = @('desktop layout')
                    not_checked = @('authenticated pages')
                    notes = @('Fixture evidence only.')
                }
            )
        }
        site_facts = @('The fixture has one review page.')
        transferable_patterns = @(
            [ordered]@{
                name = 'Clear hierarchy'
                when = 'The page has one primary task.'
                use = 'Keep one primary heading and action.'
                guardrail = 'Do not hide supporting context.'
            }
        )
        do_not_copy = @('Brand assets')
        source_assets = @()
        case_files = [ordered]@{
            readme = 'README.md'
            metadata = 'case.json'
        }
    }

    Write-Utf8File -Path (Join-Path $casePath 'case.json') -Content ($metadata | ConvertTo-Json -Depth 12)
    Write-Utf8File -Path $IndexPath -Content "# Cases`n`n- [alpha](alpha/)`n"
}

function Update-CaseMetadata {
    param(
        [Parameter(Mandatory = $true)][string]$CasesPath,
        [Parameter(Mandatory = $true)][scriptblock]$Update
    )

    $metadataPath = Join-Path (Join-Path $CasesPath 'alpha') 'case.json'
    $metadata = Get-Content -LiteralPath $metadataPath -Raw | ConvertFrom-Json
    & $Update $metadata
    Write-Utf8File -Path $metadataPath -Content ($metadata | ConvertTo-Json -Depth 12)
}

function ConvertTo-SnapshotFixture {
    param([Parameter(Mandatory = $true)][string]$CasesPath)

    $casePath = Join-Path $CasesPath 'alpha'
    Write-Utf8File -Path (Join-Path $casePath 'index.html') -Content '<!doctype html><title>Alpha</title>'
    Write-Utf8File -Path (Join-Path $casePath 'assets/source/evidence.txt') -Content 'fixture evidence'
    Update-CaseMetadata -CasesPath $CasesPath -Update {
        param($metadata)
        $metadata.artifact_level = 'snapshot'
        $metadata.source_assets = @(
            [pscustomobject]@{
                file = 'assets/source/evidence.txt'
                kind = 'text'
                role = 'source evidence'
            }
        )
        $metadata.case_files | Add-Member -NotePropertyName review_page -NotePropertyValue 'index.html'
        $metadata.case_files | Add-Member -NotePropertyName source_root -NotePropertyValue 'assets/source'
    }
}

function Remove-FixtureRoot {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return
    }

    $tempBase = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $leaf = Split-Path -Leaf $fullPath
    if (-not $fullPath.StartsWith($tempBase, [System.StringComparison]::OrdinalIgnoreCase) -or
        $leaf -notmatch '^case-validator-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
        throw "Refusing to remove unexpected fixture path: $fullPath"
    }

    Get-ChildItem -LiteralPath $fullPath -Recurse -Force -File | ForEach-Object {
        Remove-Item -LiteralPath $_.FullName -Force
    }
    Get-ChildItem -LiteralPath $fullPath -Recurse -Force -Directory |
        Sort-Object { $_.FullName.Length } -Descending |
        ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force }
    Remove-Item -LiteralPath $fullPath -Force
}

function Remove-FixtureJunction {
    param(
        [Parameter(Mandatory = $true)][string]$FixtureRoot,
        [Parameter(Mandatory = $true)][string]$JunctionPath,
        [Parameter(Mandatory = $true)][string]$TargetSentinel
    )

    if (-not (Test-Path -LiteralPath $JunctionPath)) {
        return
    }

    $rootFull = [System.IO.Path]::GetFullPath($FixtureRoot).TrimEnd('\', '/')
    $junctionFull = [System.IO.Path]::GetFullPath($JunctionPath)
    $rootBoundary = $rootFull + [System.IO.Path]::DirectorySeparatorChar
    if (-not $junctionFull.StartsWith($rootBoundary, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove junction outside GUID fixture root: $junctionFull"
    }

    $junction = Get-Item -LiteralPath $junctionFull -Force
    if (($junction.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -eq 0) {
        throw "Refusing junction cleanup because path is not a reparse point: $junctionFull"
    }

    [System.IO.Directory]::Delete($junctionFull, $false)
    if (Test-Path -LiteralPath $junctionFull) {
        throw "Junction cleanup did not remove link: $junctionFull"
    }
    if (-not (Test-Path -LiteralPath $TargetSentinel -PathType Leaf)) {
        throw "Junction cleanup followed the link and removed its target: $TargetSentinel"
    }
}

function New-Fixture {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][int]$ExpectedExitCode,
        [Parameter(Mandatory = $true)][string]$ExpectedPattern,
        [Parameter(Mandatory = $true)][scriptblock]$Arrange
    )

    [pscustomobject]@{
        Name = $Name
        ExpectedExitCode = $ExpectedExitCode
        ExpectedPattern = $ExpectedPattern
        Arrange = $Arrange
    }
}

function Get-ExactJsonProperty {
    param(
        [AllowNull()][object]$Object,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($null -eq $Object -or $Object -isnot [pscustomobject]) {
        return $null
    }
    $properties = @($Object.PSObject.Properties | Where-Object { $_.Name -ceq $Name })
    if ($properties.Count -eq 0) {
        return $null
    }
    return $properties[0]
}

function Assert-ContractRegression {
    param(
        [Parameter(Mandatory = $true)][bool]$Condition,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$FailureMessage
    )

    if ($Condition) {
        $script:ContractPassed++
    }
    else {
        $script:ContractFailed++
        Write-Output ("CONTRACT FAIL {0}: {1}" -f $Name, $FailureMessage)
    }
}

function Invoke-ValidatorProcess {
    param(
        [Parameter(Mandatory = $true)][string]$CasesPath,
        [Parameter(Mandatory = $true)][string]$SchemaPath,
        [Parameter(Mandatory = $true)][string]$IndexPath
    )

    $oldErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $output = & powershell -NoProfile -ExecutionPolicy Bypass -File $script:ValidatorPath -CasesPath $CasesPath -SchemaPath $SchemaPath -IndexPath $IndexPath 2>&1 | Out-String
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $oldErrorActionPreference
    }

    [pscustomobject]@{
        ExitCode = $exitCode
        Output = $output
    }
}

function Invoke-ContractRegressions {
    try {
        $schema = Get-Content -LiteralPath $script:ProductionSchemaPath -Raw | ConvertFrom-Json
        $definitions = Get-ExactJsonProperty $schema '$defs'
        $stringArray = if ($null -ne $definitions) { Get-ExactJsonProperty $definitions.Value 'stringArray' } else { $null }
        $stringItems = if ($null -ne $stringArray) { Get-ExactJsonProperty $stringArray.Value 'items' } else { $null }
        $minimumLength = if ($null -ne $stringItems) { Get-ExactJsonProperty $stringItems.Value 'minLength' } else { $null }
        $stringItemPattern = if ($null -ne $stringItems) { Get-ExactJsonProperty $stringItems.Value 'pattern' } else { $null }
        Assert-ContractRegression ($null -ne $minimumLength -and $minimumLength.Value -eq 1 -and $null -ne $stringItemPattern -and $stringItemPattern.Value -ceq '\S') 'schema stringArray nonempty items' '$defs.stringArray items must use minLength 1 and pattern \S'

        $stringArrayReference = '#/$defs/stringArray'
        $siteFactsRef = Get-ExactJsonProperty $schema.properties.site_facts '$ref'
        $observationProperties = $schema.properties.evidence.properties.observations.items.properties
        $checkedRef = Get-ExactJsonProperty $observationProperties.checked '$ref'
        $notCheckedRef = Get-ExactJsonProperty $observationProperties.not_checked '$ref'
        $notesRef = Get-ExactJsonProperty $observationProperties.notes '$ref'
        $allStringArraysUseDefinition = $null -ne $siteFactsRef -and $siteFactsRef.Value -ceq $stringArrayReference -and
            $null -ne $checkedRef -and $checkedRef.Value -ceq $stringArrayReference -and
            $null -ne $notCheckedRef -and $notCheckedRef.Value -ceq $stringArrayReference -and
            $null -ne $notesRef -and $notesRef.Value -ceq $stringArrayReference
        Assert-ContractRegression $allStringArraysUseDefinition 'schema stringArray references' 'checked, not_checked, notes, and site_facts must use #/$defs/stringArray'

        Assert-ContractRegression ($schema.properties.source.pattern -ceq '^[Hh][Tt][Tt][Pp][Ss]?://\S+$') 'schema source scheme casing and whitespace' 'source.pattern must accept uppercase/lowercase HTTP(S) and reject every whitespace character'
        $industryUnique = Get-ExactJsonProperty $schema.properties.industry 'uniqueItems'
        Assert-ContractRegression ($null -eq $industryUnique) 'schema duplicate industry values' 'industry must not declare uniqueItems'

        $nonEmptyString = if ($null -ne $definitions) { Get-ExactJsonProperty $definitions.Value 'nonEmptyString' } else { $null }
        $nonEmptyPattern = if ($null -ne $nonEmptyString) { Get-ExactJsonProperty $nonEmptyString.Value 'pattern' } else { $null }
        $nonEmptyMinimum = if ($null -ne $nonEmptyString) { Get-ExactJsonProperty $nonEmptyString.Value 'minLength' } else { $null }
        $nonEmptyStringRef = '#/$defs/nonEmptyString'
        $ordinaryStringNodes = @(
            $schema.properties.title,
            $schema.properties.page_type,
            $schema.properties.industry.items,
            $schema.properties.evidence.properties.status,
            $observationProperties.scope.items,
            $schema.properties.source_claims.items.properties.claim,
            $schema.properties.source_claims.items.properties.location,
            $schema.properties.source_claims.items.properties.verification,
            $schema.properties.transferable_patterns.items.properties.name,
            $schema.properties.transferable_patterns.items.properties.when,
            $schema.properties.transferable_patterns.items.properties.use,
            $schema.properties.transferable_patterns.items.properties.guardrail,
            $schema.properties.do_not_copy.items,
            $schema.properties.source_assets.items.properties.kind,
            $schema.properties.source_assets.items.properties.role
        )
        $ordinaryStringsUseDefinition = $true
        foreach ($node in $ordinaryStringNodes) {
            $reference = Get-ExactJsonProperty $node '$ref'
            if ($null -eq $reference -or $reference.Value -cne $nonEmptyStringRef) {
                $ordinaryStringsUseDefinition = $false
            }
        }
        Assert-ContractRegression ($null -ne $nonEmptyMinimum -and $nonEmptyMinimum.Value -eq 1 -and $null -ne $nonEmptyPattern -and $nonEmptyPattern.Value -ceq '\S' -and $ordinaryStringsUseDefinition) 'schema ordinary nonempty strings' 'all ordinary nonempty string fields must use a minLength 1, pattern \S definition'

        $relativePath = if ($null -ne $definitions) { Get-ExactJsonProperty $definitions.Value 'relativePath' } else { $null }
        $relativePattern = if ($null -ne $relativePath) { Get-ExactJsonProperty $relativePath.Value 'pattern' } else { $null }
        $sourceAssetFileRef = Get-ExactJsonProperty $schema.properties.source_assets.items.properties.file '$ref'
        $supportingFileRef = Get-ExactJsonProperty $schema.properties.case_files.properties.supporting_files.items '$ref'
        $expectedRelativePattern = '^(?=.*\S)(?!/)(?![A-Za-z]:)(?!.*(?:^|/)\.\.(?:/|$))(?!.*\\).+$'
        Assert-ContractRegression ($null -ne $relativePattern -and $relativePattern.Value -ceq $expectedRelativePattern -and
            $null -ne $sourceAssetFileRef -and $sourceAssetFileRef.Value -ceq '#/$defs/relativePath' -and
            $null -ne $supportingFileRef -and $supportingFileRef.Value -ceq '#/$defs/relativePath') 'schema relative paths reject whitespace-only' 'relativePath must require a non-whitespace character and back both declared path fields'
    }
    catch {
        Assert-ContractRegression $false 'schema contract inspection' $_.Exception.Message
    }

    $regressionRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("case-validator-{0}" -f [guid]::NewGuid().ToString('D'))
    try {
        $casesPath = Join-Path $regressionRoot 'cases'
        $indexPath = Join-Path $regressionRoot 'README.md'
        New-Item -ItemType Directory -Path $casesPath -Force | Out-Null

        New-ValidReviewCase $casesPath $indexPath
        Update-CaseMetadata $casesPath {
            param($metadata)
            $metadata.source = 'HTTPS://example.com/'
            $metadata.industry = @('Testing', 'Testing')
        }
        $validResult = Invoke-ValidatorProcess $casesPath $script:ProductionSchemaPath $indexPath
        Assert-ContractRegression ($validResult.ExitCode -eq 0 -and $validResult.Output -match 'Case library validation passed: 1 cases\.') 'validator accepts uppercase HTTP and duplicate industry' ("exit {0}; output: {1}" -f $validResult.ExitCode, (($validResult.Output -replace '[\r\n]+', ' ').Trim()))

        $emptyStringCases = @(
            [pscustomobject]@{
                Name = 'validator rejects empty checked item'
                Pattern = 'evidence\.observations\[0\]\.checked\[0\].*nonempty'
                Update = { param($metadata) $metadata.evidence.observations[0].checked = @('') }
            }
            [pscustomobject]@{
                Name = 'validator rejects empty not_checked item'
                Pattern = 'evidence\.observations\[0\]\.not_checked\[0\].*nonempty'
                Update = { param($metadata) $metadata.evidence.observations[0].not_checked = @('') }
            }
            [pscustomobject]@{
                Name = 'validator rejects empty notes item'
                Pattern = 'evidence\.observations\[0\]\.notes\[0\].*nonempty'
                Update = { param($metadata) $metadata.evidence.observations[0].notes = @('') }
            }
            [pscustomobject]@{
                Name = 'validator rejects empty site_facts item'
                Pattern = 'site_facts\[0\].*nonempty'
                Update = { param($metadata) $metadata.site_facts = @('') }
            }
        )

        foreach ($emptyStringCase in $emptyStringCases) {
            New-ValidReviewCase $casesPath $indexPath
            Update-CaseMetadata $casesPath $emptyStringCase.Update
            $invalidResult = Invoke-ValidatorProcess $casesPath $script:ProductionSchemaPath $indexPath
            Assert-ContractRegression ($invalidResult.ExitCode -eq 1 -and $invalidResult.Output -match $emptyStringCase.Pattern) $emptyStringCase.Name ("exit {0}; output: {1}" -f $invalidResult.ExitCode, (($invalidResult.Output -replace '[\r\n]+', ' ').Trim()))
        }

        $whitespaceCases = @(
            [pscustomobject]@{
                Name = 'validator rejects whitespace-only title'
                Pattern = 'title.*nonempty'
                Update = { param($metadata) $metadata.title = '   ' }
            }
            [pscustomobject]@{
                Name = 'validator rejects whitespace-only site_facts item'
                Pattern = 'site_facts\[0\].*nonempty'
                Update = { param($metadata) $metadata.site_facts = @('   ') }
            }
            [pscustomobject]@{
                Name = 'validator rejects leading URL whitespace'
                Pattern = 'source.*whitespace'
                Update = { param($metadata) $metadata.source = ' HTTPS://example.com/' }
            }
            [pscustomobject]@{
                Name = 'validator rejects trailing URL whitespace'
                Pattern = 'source.*whitespace'
                Update = { param($metadata) $metadata.source = 'HTTPS://example.com/ ' }
            }
            [pscustomobject]@{
                Name = 'validator rejects embedded URL whitespace'
                Pattern = 'source.*whitespace'
                Update = { param($metadata) $metadata.source = 'HTTPS://exa mple.com/' }
            }
        )
        foreach ($whitespaceCase in $whitespaceCases) {
            New-ValidReviewCase $casesPath $indexPath
            Update-CaseMetadata $casesPath $whitespaceCase.Update
            $whitespaceResult = Invoke-ValidatorProcess $casesPath $script:ProductionSchemaPath $indexPath
            Assert-ContractRegression ($whitespaceResult.ExitCode -eq 1 -and $whitespaceResult.Output -match $whitespaceCase.Pattern) $whitespaceCase.Name ("exit {0}; output: {1}" -f $whitespaceResult.ExitCode, (($whitespaceResult.Output -replace '[\r\n]+', ' ').Trim()))
        }

        New-ValidReviewCase $casesPath $indexPath
        Update-CaseMetadata $casesPath {
            param($metadata)
            $metadata.evidence.observations += [pscustomobject]@{
                observed_at = '2026-08-25'
                scope = @('product page')
                checked = @('content hierarchy')
                not_checked = @()
                notes = @('Newer observation fixture.')
            }
        }
        $staleDateResult = Invoke-ValidatorProcess $casesPath $script:ProductionSchemaPath $indexPath
        Assert-ContractRegression ($staleDateResult.ExitCode -eq 1 -and $staleDateResult.Output -match 'observed_at.*latest observation') 'validator rejects stale top-level observed_at' ("exit {0}; output: {1}" -f $staleDateResult.ExitCode, (($staleDateResult.Output -replace '[\r\n]+', ' ').Trim()))

        New-ValidReviewCase $casesPath $indexPath
        $externalSource = Join-Path $regressionRoot 'outside-case-source'
        $targetSentinel = Join-Path $externalSource 'evidence.txt'
        New-Item -ItemType Directory -Path $externalSource -Force | Out-Null
        Write-Utf8File $targetSentinel 'outside case root'
        $assetsPath = Join-Path (Join-Path $casesPath 'alpha') 'assets'
        New-Item -ItemType Directory -Path $assetsPath -Force | Out-Null
        $junctionPath = Join-Path $assetsPath 'source'
        try {
            $junction = New-Item -ItemType Junction -Path $junctionPath -Target $externalSource -ErrorAction Stop
            if (($junction.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -eq 0) {
                throw 'created directory is not marked as a reparse point'
            }
        }
        catch {
            $script:ContractBlocked++
            Write-Output ("CONTRACT BLOCKED junction regression: {0}" -f $_.Exception.Message)
        }
        if ($script:ContractBlocked -eq 0) {
            Write-Utf8File (Join-Path (Join-Path $casesPath 'alpha') 'index.html') '<!doctype html><title>Alpha</title>'
            Update-CaseMetadata $casesPath {
                param($metadata)
                $metadata.artifact_level = 'snapshot'
                $metadata.source_assets = @(
                    [pscustomobject]@{
                        file = 'assets/source/evidence.txt'
                        kind = 'text'
                        role = 'source evidence'
                    }
                )
                $metadata.case_files | Add-Member -NotePropertyName review_page -NotePropertyValue 'index.html'
                $metadata.case_files | Add-Member -NotePropertyName source_root -NotePropertyValue 'assets/source'
            }
            $junctionResult = Invoke-ValidatorProcess $casesPath $script:ProductionSchemaPath $indexPath
            Assert-ContractRegression ($junctionResult.ExitCode -eq 1 -and $junctionResult.Output -match 'reparse point') 'validator rejects junction escape' ("exit {0}; output: {1}" -f $junctionResult.ExitCode, (($junctionResult.Output -replace '[\r\n]+', ' ').Trim()))
        }
    }
    catch {
        Assert-ContractRegression $false 'validator contract invocation' $_.Exception.Message
    }
    finally {
        if ($null -ne $junctionPath -and $null -ne $targetSentinel) {
            Remove-FixtureJunction $regressionRoot $junctionPath $targetSentinel
        }
        Remove-FixtureRoot $regressionRoot
    }
}

$fixtures = @(
    New-Fixture 'valid review' 0 'Case library validation passed: 1 cases\.' {}
    New-Fixture 'valid snapshot' 0 'Case library validation passed: 1 cases\.' {
        param($context)
        ConvertTo-SnapshotFixture -CasesPath $context.CasesPath
    }
    New-Fixture 'slug mismatch' 1 'slug.*directory' {
        param($context)
        Update-CaseMetadata $context.CasesPath { param($metadata) $metadata.slug = 'beta' }
    }
    New-Fixture 'missing README' 1 'README\.md.*missing' {
        param($context)
        Remove-Item -LiteralPath (Join-Path (Join-Path $context.CasesPath 'alpha') 'README.md') -Force
    }
    New-Fixture 'snapshot missing page' 1 'review_page.*missing' {
        param($context)
        ConvertTo-SnapshotFixture $context.CasesPath
        Remove-Item -LiteralPath (Join-Path (Join-Path $context.CasesPath 'alpha') 'index.html') -Force
    }
    New-Fixture 'snapshot empty source' 1 'source_root.*empty' {
        param($context)
        ConvertTo-SnapshotFixture $context.CasesPath
        Remove-Item -LiteralPath (Join-Path (Join-Path $context.CasesPath 'alpha') 'assets/source/evidence.txt') -Force
    }
    New-Fixture 'path traversal' 1 'case_files\.metadata.*relative' {
        param($context)
        Update-CaseMetadata $context.CasesPath { param($metadata) $metadata.case_files.metadata = '../case.json' }
    }
    New-Fixture 'invalid artifact level' 1 'artifact_level' {
        param($context)
        Update-CaseMetadata $context.CasesPath { param($metadata) $metadata.artifact_level = 'partial' }
    }
    New-Fixture 'index omission' 1 'index.*alpha' {
        param($context)
        Write-Utf8File $context.IndexPath "# Cases`n"
    }
    New-Fixture 'duplicate index' 1 'index.*duplicate.*alpha' {
        param($context)
        Write-Utf8File $context.IndexPath "# Cases`n`n- [alpha](alpha/)`n- [Alpha again](alpha/)`n"
    }
    New-Fixture 'invalid schema JSON' 1 'schema.*JSON' {
        param($context)
        Write-Utf8File $context.SchemaPath '{'
    }
    New-Fixture 'wrong schema version' 1 'schema.*1\.0\.0' {
        param($context)
        Write-MinimalSchema $context.SchemaPath
        $schema = Get-Content -LiteralPath $context.SchemaPath -Raw | ConvertFrom-Json
        $schema.properties.schema_version.const = '2.0.0'
        Write-Utf8File $context.SchemaPath ($schema | ConvertTo-Json -Depth 12)
    }
    New-Fixture 'review page undeclared' 1 'index\.html.*review_page' {
        param($context)
        Write-Utf8File (Join-Path (Join-Path $context.CasesPath 'alpha') 'index.html') '<!doctype html>'
    }
    New-Fixture 'declared source missing' 1 'source_root.*missing' {
        param($context)
        Update-CaseMetadata $context.CasesPath {
            param($metadata)
            $metadata.case_files | Add-Member -NotePropertyName source_root -NotePropertyValue 'assets/source'
        }
    }
    New-Fixture 'missing selected asset' 1 'source_assets.*missing\.txt' {
        param($context)
        ConvertTo-SnapshotFixture $context.CasesPath
        Update-CaseMetadata $context.CasesPath {
            param($metadata)
            $metadata.source_assets[0].file = 'assets/source/missing.txt'
        }
    }
    New-Fixture 'source directory undeclared' 1 'assets/source.*source_root' {
        param($context)
        Write-Utf8File (Join-Path (Join-Path $context.CasesPath 'alpha') 'assets/source/evidence.txt') 'fixture evidence'
    }
    New-Fixture 'languages wrong type' 1 'languages.*array' {
        param($context)
        Update-CaseMetadata $context.CasesPath { param($metadata) $metadata | Add-Member -NotePropertyName languages -NotePropertyValue 'en' }
    }
    New-Fixture 'languages invalid tag' 1 'languages.*BCP 47' {
        param($context)
        Update-CaseMetadata $context.CasesPath { param($metadata) $metadata | Add-Member -NotePropertyName languages -NotePropertyValue @('not_a_tag') }
    }
    New-Fixture 'case files null' 1 'case_files.*object' {
        param($context)
        Update-CaseMetadata $context.CasesPath { param($metadata) $metadata.case_files = $null }
    }
    New-Fixture 'schema null' 1 'schema.*object' {
        param($context)
        Write-Utf8File $context.SchemaPath 'null'
    }
    New-Fixture 'case JSON array' 1 'case\.json.*object' {
        param($context)
        Write-Utf8File (Join-Path (Join-Path $context.CasesPath 'alpha') 'case.json') '[{"slug":"alpha"}]'
    }
    New-Fixture 'required key wrong case' 1 'slug.*required' {
        param($context)
        Update-CaseMetadata $context.CasesPath {
            param($metadata)
            $slugProperty = @($metadata.PSObject.Properties | Where-Object { $_.Name -ceq 'slug' })[0]
            $metadata.PSObject.Properties.Remove($slugProperty.Name)
            $metadata | Add-Member -NotePropertyName Slug -NotePropertyValue 'alpha'
        }
    }
    New-Fixture 'CasesPath is file' 1 'CasesPath.*directory' {
        param($context)
        $filePath = Join-Path $context.RootPath 'not-a-directory'
        Write-Utf8File $filePath 'fixture'
        $context.CasesPath = $filePath
    }
    New-Fixture 'artifact level array' 1 'artifact_level.*string' {
        param($context)
        Update-CaseMetadata $context.CasesPath { param($metadata) $metadata.artifact_level = @('review') }
    }
    New-Fixture 'source array' 1 'source.*string' {
        param($context)
        Update-CaseMetadata $context.CasesPath { param($metadata) $metadata.source = @('https://example.com/') }
    }
    New-Fixture 'case readme array' 1 'case_files\.readme.*string' {
        param($context)
        Update-CaseMetadata $context.CasesPath { param($metadata) $metadata.case_files.readme = @('README.md') }
    }
    New-Fixture 'schema const array' 1 'schema.*1\.0\.0' {
        param($context)
        $schema = Get-Content -LiteralPath $context.SchemaPath -Raw | ConvertFrom-Json
        $schema.properties.schema_version.const = @('1.0.0')
        Write-Utf8File $context.SchemaPath ($schema | ConvertTo-Json -Depth 12)
    }
)

$passed = 0
$failed = 0

foreach ($fixture in $fixtures) {
    $fixtureRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("case-validator-{0}" -f [guid]::NewGuid().ToString('D'))
    try {
        New-Item -ItemType Directory -Path $fixtureRoot | Out-Null
        $context = [pscustomobject]@{
            RootPath = $fixtureRoot
            CasesPath = (Join-Path $fixtureRoot 'cases')
            SchemaPath = (Join-Path $fixtureRoot 'case.schema.json')
            IndexPath = (Join-Path $fixtureRoot 'README.md')
        }
        New-Item -ItemType Directory -Path $context.CasesPath | Out-Null
        Write-MinimalSchema -Path $context.SchemaPath
        New-ValidReviewCase -CasesPath $context.CasesPath -IndexPath $context.IndexPath
        & $fixture.Arrange $context

        $oldErrorActionPreference = $ErrorActionPreference
        try {
            $ErrorActionPreference = 'Continue'
            $output = & powershell -NoProfile -ExecutionPolicy Bypass -File $script:ValidatorPath -CasesPath $context.CasesPath -SchemaPath $context.SchemaPath -IndexPath $context.IndexPath 2>&1 | Out-String
            $exitCode = $LASTEXITCODE
        }
        finally {
            $ErrorActionPreference = $oldErrorActionPreference
        }

        $exitMatches = $exitCode -eq $fixture.ExpectedExitCode
        $outputMatches = $output -match $fixture.ExpectedPattern
        if ($exitMatches -and $outputMatches) {
            $passed++
        }
        else {
            $failed++
            $singleLineOutput = ($output -replace '[\r\n]+', ' ').Trim()
            Write-Output ("FAIL {0}: exit {1} (expected {2}); output: {3}" -f $fixture.Name, $exitCode, $fixture.ExpectedExitCode, $singleLineOutput)
        }
    }
    catch {
        $failed++
        Write-Output ("FAIL {0}: fixture error: {1}" -f $fixture.Name, $_.Exception.Message)
    }
    finally {
        Remove-FixtureRoot -Path $fixtureRoot
    }
}

Invoke-ContractRegressions
Write-Output ("Case validator contract regressions passed: {0}; failed: {1}" -f $script:ContractPassed, $script:ContractFailed)
if ($script:ContractBlocked -gt 0) {
    Write-Output ("Case validator contract regressions BLOCKED: {0}" -f $script:ContractBlocked)
}
Write-Output ("Case validator fixtures passed: {0}; failed: {1}" -f $passed, $failed)
if ($failed -gt 0 -or $script:ContractFailed -gt 0 -or $script:ContractBlocked -gt 0) {
    exit 1
}
exit 0
