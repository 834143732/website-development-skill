[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$validatorPath = Join-Path $PSScriptRoot 'validate-asset-library.ps1'
$windowsPowerShellPath = (Get-Command powershell.exe -ErrorAction Stop).Source

if (-not (Test-Path -LiteralPath $validatorPath -PathType Leaf)) {
    throw "Validator script not found: $validatorPath"
}

$childMajorVersion = (& $windowsPowerShellPath -NoProfile -Command '$PSVersionTable.PSVersion.Major' | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $childMajorVersion -ne '5') {
    throw "Expected validator child host to be Windows PowerShell 5.x, received major version '$childMajorVersion'."
}
Write-Host "PASS validator child host is Windows PowerShell $childMajorVersion.x"

function Get-FileSha256 {
    param([Parameter(Mandatory)][string]$Path)

    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function New-TestAsset {
    param(
        [Parameter(Mandatory)][string]$Path,
        [string]$Id = 'test-menu-icon',
        [string]$Category = 'icon'
    )

    $item = Get-Item -LiteralPath $Path
    return [ordered]@{
        id = $Id
        category = $Category
        path = 'icons/menu.svg'
        tags = @('navigation', 'test')
        description = 'Test fixture icon.'
        source = [ordered]@{
            type = 'self-authored'
            url = 'repository://website-development-skill'
            author = 'Wuyou Studio'
        }
        license = [ordered]@{
            name = 'Repository-authored reusable asset'
            url = 'repository://website-development-skill'
            attributionRequired = $false
            attribution = ''
        }
        modified = $false
        modifications = ''
        allowedUse = 'Reusable in Wuyou Studio website projects.'
        sha256 = Get-FileSha256 -Path $Path
        bytes = $item.Length
        notes = 'Validator fixture.'
    }
}

function New-Fixture {
    param([Parameter(Mandatory)][string]$Name)

    $root = Join-Path $script:tempRoot $Name
    $library = Join-Path $root 'assets/library'
    $icons = Join-Path $library 'icons'
    New-Item -ItemType Directory -Path $icons -Force | Out-Null

    $assetPath = Join-Path $icons 'menu.svg'
    Set-Content -LiteralPath $assetPath -Encoding utf8 -NoNewline -Value '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'

    $manifest = [ordered]@{
        schemaVersion = 1
        policies = [ordered]@{
            maxFileSizeBytes = 2097152
            referenceDomains = @('gpixel.com', 'phabuilder.com')
        }
        assets = @(New-TestAsset -Path $assetPath)
    }

    return [pscustomobject]@{
        Root = $root
        Library = $library
        AssetPath = $assetPath
        ManifestPath = Join-Path $library 'manifest.json'
        Manifest = $manifest
    }
}

function Save-FixtureManifest {
    param([Parameter(Mandatory)]$Fixture)

    $Fixture.Manifest | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $Fixture.ManifestPath -Encoding utf8
}

function Invoke-ValidatorCase {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)]$Fixture,
        [Parameter(Mandatory)][bool]$ShouldPass,
        [string]$ExpectedText = ''
    )

    Save-FixtureManifest -Fixture $Fixture
    $output = & $windowsPowerShellPath -NoProfile -ExecutionPolicy Bypass -File $validatorPath -Root $Fixture.Root -ManifestPath $Fixture.ManifestPath 2>&1
    $exitCode = $LASTEXITCODE
    $rendered = ($output | Out-String).Trim()

    if ($ShouldPass -and $exitCode -ne 0) {
        throw "[$Name] expected success but failed:`n$rendered"
    }
    if (-not $ShouldPass -and $exitCode -eq 0) {
        throw "[$Name] expected failure but passed."
    }
    if ($ExpectedText -and $rendered -notmatch [regex]::Escape($ExpectedText)) {
        throw "[$Name] expected output containing '$ExpectedText' but received:`n$rendered"
    }

    Write-Host "PASS $Name"
}

function Assert-FileMatches {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string[]]$Patterns
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "[$Name] required file not found: $Path"
    }

    $content = Get-Content -LiteralPath $Path -Raw
    foreach ($pattern in $Patterns) {
        if ($content -notmatch $pattern) {
            throw "[$Name] expected pattern not found: $pattern"
        }
    }

    Write-Host "PASS $Name"
}

function Assert-GitEolAttribute {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Path
    )

    $output = & git -C $repoRoot check-attr eol -- $Path 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "[$Name] git check-attr failed:`n$(($output | Out-String).Trim())"
    }
    $rendered = ($output | Out-String).Trim()
    if ($rendered -notmatch ': eol: lf$') {
        throw "[$Name] expected eol=lf for '$Path' but received: $rendered"
    }

    Write-Host "PASS $Name"
}

$tempRoot = Join-Path ([IO.Path]::GetTempPath()) ("website-material-library-tests-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempRoot | Out-Null

try {
    $valid = New-Fixture -Name 'valid'
    Invoke-ValidatorCase -Name 'valid manifest' -Fixture $valid -ShouldPass $true

    $duplicateId = New-Fixture -Name 'duplicate-id'
    $secondPath = Join-Path $duplicateId.Library 'icons/close.svg'
    Copy-Item -LiteralPath $duplicateId.AssetPath -Destination $secondPath
    $second = New-TestAsset -Path $secondPath -Id 'test-menu-icon'
    $second.path = 'icons/close.svg'
    $duplicateId.Manifest.assets = @($duplicateId.Manifest.assets[0], $second)
    Invoke-ValidatorCase -Name 'duplicate id' -Fixture $duplicateId -ShouldPass $false -ExpectedText 'duplicate asset id'

    $duplicatePath = New-Fixture -Name 'duplicate-path'
    $second = New-TestAsset -Path $duplicatePath.AssetPath -Id 'test-menu-icon-copy'
    $duplicatePath.Manifest.assets = @($duplicatePath.Manifest.assets[0], $second)
    Invoke-ValidatorCase -Name 'duplicate path' -Fixture $duplicatePath -ShouldPass $false -ExpectedText 'duplicate asset path'

    $missingFile = New-Fixture -Name 'missing-file'
    Remove-Item -LiteralPath $missingFile.AssetPath
    Invoke-ValidatorCase -Name 'missing file' -Fixture $missingFile -ShouldPass $false -ExpectedText 'missing asset file'

    $hashMismatch = New-Fixture -Name 'hash-mismatch'
    $hashMismatch.Manifest.assets[0].sha256 = ('0' * 64)
    Invoke-ValidatorCase -Name 'hash mismatch' -Fixture $hashMismatch -ShouldPass $false -ExpectedText 'sha256 mismatch'

    $orphan = New-Fixture -Name 'orphan-file'
    Set-Content -LiteralPath (Join-Path $orphan.Library 'icons/orphan.svg') -Encoding utf8 -Value '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>'
    Invoke-ValidatorCase -Name 'orphan file' -Fixture $orphan -ShouldPass $false -ExpectedText 'unregistered asset file'

    $unsafeSvg = New-Fixture -Name 'unsafe-svg'
    Set-Content -LiteralPath $unsafeSvg.AssetPath -Encoding utf8 -Value '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    $unsafeSvg.Manifest.assets[0].sha256 = Get-FileSha256 -Path $unsafeSvg.AssetPath
    $unsafeSvg.Manifest.assets[0].bytes = (Get-Item -LiteralPath $unsafeSvg.AssetPath).Length
    Invoke-ValidatorCase -Name 'unsafe svg' -Fixture $unsafeSvg -ShouldPass $false -ExpectedText 'unsafe svg content'

    $referenceDomain = New-Fixture -Name 'reference-domain'
    $cssDir = Join-Path $referenceDomain.Library 'css'
    New-Item -ItemType Directory -Path $cssDir | Out-Null
    $cssPath = Join-Path $cssDir 'pattern.css'
    Set-Content -LiteralPath $cssPath -Encoding utf8 -Value '.hero{background:url("https://gpixel.com/brand.jpg")}'
    $cssAsset = New-TestAsset -Path $cssPath -Id 'test-pattern' -Category 'css'
    $cssAsset.path = 'css/pattern.css'
    $referenceDomain.Manifest.assets = @($referenceDomain.Manifest.assets[0], $cssAsset)
    Invoke-ValidatorCase -Name 'reference domain in code' -Fixture $referenceDomain -ShouldPass $false -ExpectedText 'reference-site domain'

    $missingLicense = New-Fixture -Name 'missing-license'
    $missingLicense.Manifest.assets[0].license.name = ''
    Invoke-ValidatorCase -Name 'missing license' -Fixture $missingLicense -ShouldPass $false -ExpectedText 'missing license name'

    $oversized = New-Fixture -Name 'oversized'
    $oversized.Manifest.policies.maxFileSizeBytes = 10
    Invoke-ValidatorCase -Name 'oversized file' -Fixture $oversized -ShouldPass $false -ExpectedText 'exceeds size limit'

    Assert-FileMatches -Name 'focus ring css contract' -Path (Join-Path $repoRoot 'assets/library/css/focus-ring.css') -Patterns @(
        ':focus-visible',
        'outline',
        'forced-colors\s*:\s*active'
    )
    Assert-FileMatches -Name 'motion-safe reveal css contract' -Path (Join-Path $repoRoot 'assets/library/css/motion-safe-reveal.css') -Patterns @(
        '\[data-reveal\]\s*\{',
        'data-reveal-ready',
        'prefers-reduced-motion\s*:\s*reduce'
    )
    Assert-FileMatches -Name 'disclosure navigation js contract' -Path (Join-Path $repoRoot 'assets/library/js/accessible-disclosure-nav.js') -Patterns @(
        'aria-expanded',
        'aria-controls',
        'Escape',
        '\.focus\('
    )
    Assert-FileMatches -Name 'reveal js contract' -Path (Join-Path $repoRoot 'assets/library/js/reveal-on-scroll.js') -Patterns @(
        'IntersectionObserver',
        'revealReady',
        'prefers-reduced-motion'
    )
    Assert-GitEolAttribute -Name 'asset css uses stable LF checkout' -Path 'assets/library/css/focus-ring.css'
    Assert-GitEolAttribute -Name 'asset js uses stable LF checkout' -Path 'assets/library/js/reveal-on-scroll.js'
    Assert-GitEolAttribute -Name 'asset svg uses stable LF checkout' -Path 'assets/library/icons/menu.svg'
    Assert-GitEolAttribute -Name 'asset license uses stable LF checkout' -Path 'assets/library/licenses/lucide-LICENSE.txt'

    Write-Host 'All asset library validator tests passed.'
}
finally {
    $resolvedTempRoot = [IO.Path]::GetFullPath($tempRoot)
    $systemTempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    if ($resolvedTempRoot.StartsWith($systemTempRoot, [StringComparison]::OrdinalIgnoreCase)) {
        Remove-Item -LiteralPath $resolvedTempRoot -Recurse -Force
    }
}
