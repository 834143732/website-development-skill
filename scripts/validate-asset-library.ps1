[CmdletBinding()]
param(
    [string]$Root,
    [string]$ManifestPath
)

$ErrorActionPreference = 'Stop'

if (-not $Root) {
    $Root = Split-Path -Parent $PSScriptRoot
}

$resolvedRoot = [IO.Path]::GetFullPath($Root)
$libraryRoot = Join-Path $resolvedRoot 'assets/library'
if (-not $ManifestPath) {
    $ManifestPath = Join-Path $libraryRoot 'manifest.json'
}
$resolvedManifestPath = [IO.Path]::GetFullPath($ManifestPath)

$errors = [Collections.Generic.List[string]]::new()

function Add-ValidationError {
    param([Parameter(Mandatory)][string]$Message)

    $script:errors.Add($Message)
}

function Get-NormalizedRelativePath {
    param([Parameter(Mandatory)][string]$Path)

    return $Path.Replace('\', '/').TrimStart('/')
}

function Get-NormalizedRelativePathBelowRoot {
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][string]$Path
    )

    $rootFull = [IO.Path]::GetFullPath($Root).TrimEnd('\', '/')
    $rootPrefix = $rootFull + [IO.Path]::DirectorySeparatorChar
    $candidateFull = [IO.Path]::GetFullPath($Path)
    if (-not $candidateFull.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        return $null
    }

    return Get-NormalizedRelativePath -Path $candidateFull.Substring($rootPrefix.Length)
}

if (-not (Test-Path -LiteralPath $resolvedManifestPath -PathType Leaf)) {
    Write-Error "Manifest not found: $resolvedManifestPath"
    exit 1
}

try {
    $manifest = Get-Content -LiteralPath $resolvedManifestPath -Raw | ConvertFrom-Json
}
catch {
    Write-Error "Manifest JSON is invalid: $($_.Exception.Message)"
    exit 1
}

if ($manifest.schemaVersion -ne 1) {
    Add-ValidationError 'schemaVersion must be 1'
}

$maxFileSize = [long]$manifest.policies.maxFileSizeBytes
if ($maxFileSize -le 0) {
    Add-ValidationError 'policies.maxFileSizeBytes must be greater than zero'
}

$referenceDomains = @($manifest.policies.referenceDomains | Where-Object { $_ } | ForEach-Object { $_.ToString().ToLowerInvariant() })
$assets = @($manifest.assets)
$seenIds = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
$seenPaths = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
$registeredPaths = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)

$allowedExtensions = @{
    icon = @('.svg')
    css = @('.css')
    js = @('.js')
    image = @('.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg')
    license = @('.txt', '.md')
}

foreach ($asset in $assets) {
    $id = [string]$asset.id
    $category = ([string]$asset.category).ToLowerInvariant()
    $relativePath = Get-NormalizedRelativePath -Path ([string]$asset.path)
    $label = if ($id) { $id } else { '<missing-id>' }

    if (-not $id) {
        Add-ValidationError 'asset is missing id'
    }
    elseif (-not $seenIds.Add($id)) {
        Add-ValidationError "duplicate asset id: $id"
    }

    if (-not $relativePath) {
        Add-ValidationError "asset '$label' is missing path"
        continue
    }
    if ([IO.Path]::IsPathRooted($relativePath) -or $relativePath.Split('/') -contains '..') {
        Add-ValidationError "asset '$label' path must stay below assets/library: $relativePath"
        continue
    }
    if (-not $seenPaths.Add($relativePath)) {
        Add-ValidationError "duplicate asset path: $relativePath"
    }
    [void]$registeredPaths.Add($relativePath)

    if (-not $allowedExtensions.ContainsKey($category)) {
        Add-ValidationError "asset '$label' has unsupported category: $category"
    }
    else {
        $extension = [IO.Path]::GetExtension($relativePath).ToLowerInvariant()
        if ($extension -notin $allowedExtensions[$category]) {
            Add-ValidationError "asset '$label' extension '$extension' is not allowed for category '$category'"
        }
    }

    if (-not [string]$asset.description) {
        Add-ValidationError "asset '$label' is missing description"
    }
    if (-not [string]$asset.source.type) {
        Add-ValidationError "asset '$label' is missing source type"
    }
    if (-not [string]$asset.source.url) {
        Add-ValidationError "asset '$label' is missing source URL"
    }
    if (-not [string]$asset.source.author) {
        Add-ValidationError "asset '$label' is missing source author"
    }
    if (-not [string]$asset.license.name) {
        Add-ValidationError "asset '$label' is missing license name"
    }
    if (-not [string]$asset.license.url) {
        Add-ValidationError "asset '$label' is missing license URL"
    }
    if (-not [string]$asset.allowedUse) {
        Add-ValidationError "asset '$label' is missing allowedUse"
    }

    $fullPath = [IO.Path]::GetFullPath((Join-Path $libraryRoot $relativePath))
    $libraryPrefix = [IO.Path]::GetFullPath($libraryRoot).TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
    if (-not $fullPath.StartsWith($libraryPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        Add-ValidationError "asset '$label' resolves outside assets/library: $relativePath"
        continue
    }
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        Add-ValidationError "missing asset file: $relativePath"
        continue
    }

    $file = Get-Item -LiteralPath $fullPath
    $actualBytes = [long]$file.Length
    if ([long]$asset.bytes -ne $actualBytes) {
        Add-ValidationError "byte count mismatch for '$relativePath': manifest=$($asset.bytes), actual=$actualBytes"
    }
    if ($actualBytes -gt $maxFileSize -and -not [string]$asset.sizeException) {
        Add-ValidationError "asset '$relativePath' exceeds size limit of $maxFileSize bytes without sizeException"
    }

    $actualHash = (Get-FileHash -LiteralPath $fullPath -Algorithm SHA256).Hash.ToLowerInvariant()
    $expectedHash = ([string]$asset.sha256).ToLowerInvariant()
    if (-not $expectedHash) {
        Add-ValidationError "asset '$label' is missing sha256"
    }
    elseif ($expectedHash -ne $actualHash) {
        Add-ValidationError "sha256 mismatch for '$relativePath'"
    }

    if ($category -in @('css', 'js') -and $file.Name -match '\.min\.(css|js)$') {
        Add-ValidationError "minified library copies are not allowed: $relativePath"
    }

    if ($extension -in @('.svg', '.css', '.js')) {
        $content = Get-Content -LiteralPath $fullPath -Raw

        if ($extension -eq '.svg') {
            $unsafeSvgPatterns = @(
                '<script\b',
                '<foreignObject\b',
                '\son[a-z]+\s*=',
                'javascript\s*:',
                '(?:href|xlink:href)\s*=\s*["'']https?://'
            )
            if ($unsafeSvgPatterns | Where-Object { $content -match $_ }) {
                Add-ValidationError "unsafe svg content: $relativePath"
            }
        }

        if ($category -in @('css', 'js')) {
            foreach ($domain in $referenceDomains) {
                if ($content.ToLowerInvariant().Contains($domain)) {
                    Add-ValidationError "reference-site domain '$domain' found in code asset: $relativePath"
                }
            }
        }
    }
}

if (Test-Path -LiteralPath $libraryRoot -PathType Container) {
    $manifestRelative = Get-NormalizedRelativePathBelowRoot -Root $libraryRoot -Path $resolvedManifestPath
    foreach ($file in Get-ChildItem -LiteralPath $libraryRoot -Recurse -File) {
        $relative = Get-NormalizedRelativePathBelowRoot -Root $libraryRoot -Path $file.FullName
        if ($null -eq $relative) {
            Add-ValidationError "asset file resolves outside assets/library: $($file.FullName)"
            continue
        }
        if ($null -ne $manifestRelative -and $relative -eq $manifestRelative) {
            continue
        }
        if (-not $registeredPaths.Contains($relative)) {
            Add-ValidationError "unregistered asset file: $relative"
        }
    }
}

if ($errors.Count -gt 0) {
    foreach ($message in $errors) {
        Write-Host "ERROR: $message" -ForegroundColor Red
    }
    Write-Host "Asset library validation failed with $($errors.Count) error(s)." -ForegroundColor Red
    exit 1
}

Write-Host "Asset library is valid: $($assets.Count) asset(s) checked."
exit 0
