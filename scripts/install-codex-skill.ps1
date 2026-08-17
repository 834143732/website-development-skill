[CmdletBinding()]
param(
    [string]$RepoPath,
    [string]$CodexSkillsRoot = (Join-Path $env:USERPROFILE ".codex\skills"),
    [string]$SkillName = "website-production-standards"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($RepoPath)) {
    $RepoPath = Split-Path -Parent $PSScriptRoot
}

$resolvedRepoPath = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $RepoPath).Path)
$manifestPath = Join-Path $resolvedRepoPath "SKILL.md"

if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    throw "SKILL.md was not found at $manifestPath"
}

New-Item -ItemType Directory -Force -Path $CodexSkillsRoot | Out-Null
$linkPath = Join-Path $CodexSkillsRoot $SkillName

if (Test-Path -LiteralPath $linkPath) {
    $existing = Get-Item -LiteralPath $linkPath -Force

    if ($existing.PSIsContainer -and $existing.LinkType -eq "Junction") {
        $existingTarget = [System.IO.Path]::GetFullPath([string]$existing.Target)
        if ($existingTarget -eq $resolvedRepoPath) {
            Write-Host "Codex Skill junction already points to $resolvedRepoPath"
            exit 0
        }
    }

    throw "Refusing to replace existing path: $linkPath"
}

New-Item -ItemType Junction -Path $linkPath -Target $resolvedRepoPath | Out-Null
Write-Host "Linked Codex Skill: $linkPath -> $resolvedRepoPath"
