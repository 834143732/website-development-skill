[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$script:RepositoryRoot = Split-Path -Parent $PSScriptRoot
$script:ValidatorPath = Join-Path $PSScriptRoot 'validate-case-library.ps1'
$script:Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

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

Write-Output ("Case validator fixtures passed: {0}; failed: {1}" -f $passed, $failed)
if ($failed -gt 0) {
    exit 1
}
exit 0
