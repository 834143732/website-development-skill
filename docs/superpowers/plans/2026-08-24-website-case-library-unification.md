# Website Case Library Unification Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the local and remote `main` histories, make `cases/` the only website-case library, and validate one shared metadata contract for 16 review/snapshot cases.

**Architecture:** `cases/<slug>/README.md` and `case.json` are the stable human/machine interfaces. A Draft 2020-12 schema documents the contract, while a dependency-free Windows PowerShell 5.1 validator enforces the supported subset plus filesystem and index invariants. Existing full snapshots remain intact; seven Markdown-only reviews migrate as `review` cases, and Phabuilder combines the two observation scopes.

**Tech Stack:** Git, Markdown, JSON Schema Draft 2020-12, Windows PowerShell 5.1, repository-native validation scripts.

**Design spec:** `docs/superpowers/specs/2026-08-24-website-case-library-unification-design.md`

**Workspace note:** The repository-specific website standard requires direct work on `main` and no isolation worktree. Do not create or switch branches, do not reset/clean/rebase, and do not push.

**Execution precondition:** Commit this approved plan before Task 1. The unexplained-dirty-worktree guard does not permit leaving the plan untracked.

---

## File map

- Create `cases/case.schema.json`: declarative metadata contract for external tools and documentation.
- Create `scripts/validate-case-library.ps1`: production validator with overridable case/schema/index paths.
- Create `scripts/test-case-library-validator.ps1`: isolated positive and negative validator fixtures.
- Modify `cases/README.md`: sole case index, format contract, creation flow, and minimal templates.
- Modify `cases/{btj_hcm,enerax,ghrepower,jsmems,jxgtx,jypower,meihua,phabuilder,zoe_industry}/case.json`: normalize nine snapshots without deleting case-specific data.
- Modify `cases/phabuilder/README.md`: merge the local multi-page review with the remote snapshot review.
- Move seven unique reviews from `references/site-reviews/*.md` to `cases/<slug>/README.md` and add matching `case.json` files.
- Delete `references/site-reviews/index.md` and the duplicate local `references/site-reviews/phabuilder.md` after their content is consumed.
- Modify `SKILL.md`, `README.md`, and `references/lessons-learned.md`: route all case-library usage through `cases/`.
- Preserve `assets/library/`, `references/asset-library.md`, and their existing validator scripts unchanged except for link fixes proven necessary by migration.

## Chunk 1: Safe merge and enforceable contract

### Task 1: Refresh and merge the reviewed remote history

**Files:**
- Merge input: local `main` containing `a726900`, `b94bb09`, `cb63940`, and `6452084`
- Merge input: `refs/remotes/origin/main`
- Expected merged additions: `cases/`, root `README.md` case links

- [ ] **Step 1: Reconfirm the pre-merge safety state**

Run:

```powershell
git branch --show-current
git status --short --branch
git rev-parse HEAD
```

Expected: branch is `main`; worktree has no changes; HEAD contains the committed design work. Stop if the worktree is dirty for an unexplained reason.

- [ ] **Step 2: Refresh the actual remote-tracking ref**

Run:

```powershell
git fetch origin
$approvedTip = '6862f2c874f0f3e2288e49f2355276444017efa1'
$remoteTip = (git rev-parse refs/remotes/origin/main).Trim()
git log --oneline --left-right HEAD...$remoteTip
if ($remoteTip -ne $approvedTip) {
    git log --oneline "$approvedTip..$remoteTip"
    git diff --stat "$approvedTip..$remoteTip"
    git diff --name-status "$approvedTip..$remoteTip"
    throw "origin/main changed to $remoteTip; inspect the listed commits, then record that full SHA as the approved tip before merging"
}
```

Expected: the reviewed remote tip is `6862f2c874f0f3e2288e49f2355276444017efa1`. If it differs, the command prints the exact new commits and file changes, then stops. After verifying that all additions remain in scope and non-destructive, replace the literal `$approvedTip` in the execution command with that inspected full SHA; otherwise report the blocker.

- [ ] **Step 3: Merge the fixed commit SHA**

Run:

```powershell
$approvedTip = '6862f2c874f0f3e2288e49f2355276444017efa1'
$remoteTip = (git rev-parse refs/remotes/origin/main).Trim()
if ($remoteTip -ne $approvedTip) { throw "Remote tip $remoteTip is not the reviewed tip $approvedTip" }
git show --no-patch --oneline $approvedTip
git merge --no-ff $approvedTip -m "merge: combine website case library work"
```

Expected: `git show` prints the exact reviewed commit, then merge completes. If Step 2 approved a newer remote SHA, use that exact recorded literal in both `$approvedTip` assignments. Conflicts should be limited to `README.md`, `SKILL.md`, or shared documentation; retain the local asset-library rules and the remote `cases/` additions, never discarding one side wholesale.

- [ ] **Step 4: Verify the merge graph and worktree**

Run:

```powershell
git merge-base --is-ancestor a726900 HEAD
if ($LASTEXITCODE -ne 0) { throw 'Local case/material commit is not an ancestor of HEAD' }
git merge-base --is-ancestor 6862f2c HEAD
if ($LASTEXITCODE -ne 0) { throw 'Remote case snapshot commit is not an ancestor of HEAD' }
git status --short --branch
```

Expected: both ancestor checks exit 0; no unresolved paths; `main` is ahead of `origin/main` and not behind.

### Task 2: Build the case contract with tests first

**Files:**
- Create: `scripts/test-case-library-validator.ps1`
- Create: `cases/case.schema.json`
- Create: `scripts/validate-case-library.ps1`

- [ ] **Step 1: Write the failing validator test harness and exact fixtures**

Create `scripts/test-case-library-validator.ps1` with these responsibilities:

```powershell
$ErrorActionPreference = 'Stop'
$validator = Join-Path $PSScriptRoot 'validate-case-library.ps1'
$script:passed = 0
$script:failed = 0

function Invoke-Fixture {
    param(
        [string]$Name,
        [scriptblock]$Arrange,
        [int]$ExpectedExitCode,
        [string]$ExpectedMessage
    )

    $root = Join-Path ([System.IO.Path]::GetTempPath()) ("case-library-" + [guid]::NewGuid())
    $cases = Join-Path $root 'cases'
    New-Item -ItemType Directory -Path $cases -Force | Out-Null
    try {
        & $Arrange $cases
        $schema = Join-Path $cases 'case.schema.json'
        $index = Join-Path $cases 'README.md'
        $output = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator `
            -CasesPath $cases -SchemaPath $schema -IndexPath $index 2>&1
        $exitCode = $LASTEXITCODE
        if ($exitCode -eq $ExpectedExitCode -and (($output -join "`n") -match $ExpectedMessage)) {
            $script:passed++
        } else {
            $script:failed++
            Write-Error "$Name failed. Exit=$exitCode Output=$($output -join ' | ')"
        }
    } finally {
        Remove-Item -LiteralPath $root -Recurse -Force
    }
}
```

Add these exact helpers after `Invoke-Fixture`:

```powershell
function Write-TestSchema([string]$CasesPath) {
    $schema = [ordered]@{ properties = [ordered]@{ schema_version = [ordered]@{ const = '1.0.0' } } }
    $schema | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $CasesPath 'case.schema.json') -Encoding UTF8
}

function Write-TestIndex([string]$CasesPath, [string[]]$Slugs) {
    $rows = $Slugs | ForEach-Object { "- [$_]($_/)" }
    Set-Content -LiteralPath (Join-Path $CasesPath 'README.md') `
        -Value ((@('# Test cases', '') + $rows) -join "`n") -Encoding UTF8
}

function New-ReviewCase([string]$CasesPath, [string]$Slug = 'alpha') {
    $caseRoot = Join-Path $CasesPath $Slug
    New-Item -ItemType Directory -Path $caseRoot -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $caseRoot 'README.md') -Value "# $Slug" -Encoding UTF8
    $metadata = [ordered]@{
        schema_version = '1.0.0'; slug = $Slug; artifact_level = 'review'
        title = 'Alpha'; source = 'https://example.com/'; observed_at = '2026-08-24'
        language = 'en'; industry = @('Testing'); page_type = 'Fixture'
        evidence = [ordered]@{ status = 'public-site-readonly-review'; observations = @(
            [ordered]@{ observed_at = '2026-08-24'; scope = @('home'); checked = @(); not_checked = @(); notes = @() }
        ) }
        site_facts = @(); transferable_patterns = @(); do_not_copy = @('Do not reuse fixture copy')
        source_assets = @(); case_files = [ordered]@{ readme = 'README.md'; metadata = 'case.json' }
    }
    $metadata | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $caseRoot 'case.json') -Encoding UTF8
    return $caseRoot
}

function Convert-ToSnapshot([string]$CaseRoot) {
    $metadataPath = Join-Path $CaseRoot 'case.json'
    $metadata = Get-Content -Raw $metadataPath | ConvertFrom-Json
    $metadata.artifact_level = 'snapshot'
    $metadata.source_assets = @([pscustomobject]@{ file = 'assets/source/evidence.txt'; kind = 'text'; role = 'fixture evidence' })
    $metadata.case_files | Add-Member -NotePropertyName review_page -NotePropertyValue 'index.html'
    $metadata.case_files | Add-Member -NotePropertyName source_root -NotePropertyValue 'assets/source'
    Set-Content -LiteralPath (Join-Path $CaseRoot 'index.html') -Value '<!doctype html><title>Fixture</title>' -Encoding UTF8
    $sourceRoot = Join-Path $CaseRoot 'assets\source'
    New-Item -ItemType Directory -Path $sourceRoot -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $sourceRoot 'evidence.txt') -Value 'evidence' -Encoding UTF8
    $metadata | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $metadataPath -Encoding UTF8
}

function Initialize-ReviewFixture([string]$CasesPath) {
    Write-TestSchema $CasesPath
    New-ReviewCase $CasesPath 'alpha' | Out-Null
    Write-TestIndex $CasesPath @('alpha')
}

function Update-TestMetadata([string]$CasesPath, [scriptblock]$Mutation) {
    $path = Join-Path $CasesPath 'alpha\case.json'
    $metadata = Get-Content -Raw $path | ConvertFrom-Json
    & $Mutation $metadata
    $metadata | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $path -Encoding UTF8
}
```

Use a common arrange block that calls `Write-TestSchema`, `New-ReviewCase`, then `Write-TestIndex`. Add these exact fixture names, mutations, exit codes, and message regexes:

| Fixture | Mutation after the common arrange | Exit | Message regex |
| --- | --- | --- | --- |
| `valid review` | none | 0 | `validation passed: 1 cases` |
| `valid snapshot` | `Convert-ToSnapshot alpha` | 0 | `validation passed: 1 cases` |
| `slug mismatch` | set JSON `slug` to `beta` | 1 | `slug.*directory` |
| `missing README` | remove `alpha/README.md` | 1 | `README.md.*missing` |
| `snapshot missing page` | convert, then remove `alpha/index.html` | 1 | `review_page.*missing` |
| `snapshot empty source` | convert, then remove `evidence.txt` | 1 | `source_root.*empty` |
| `path traversal` | set `case_files.metadata` to `../case.json` | 1 | `case_files.metadata.*relative` |
| `invalid artifact level` | set level to `partial` | 1 | `artifact_level` |
| `index omission` | write index with no slugs | 1 | `index.*alpha` |
| `duplicate index` | write `alpha` twice | 1 | `index.*duplicate.*alpha` |
| `invalid schema JSON` | overwrite schema with `{` | 1 | `schema.*JSON` |
| `wrong schema version` | set schema `properties.schema_version.const` to `2.0.0` | 1 | `schema.*1.0.0` |
| `review page undeclared` | create `alpha/index.html` without metadata change | 1 | `index.html.*review_page` |
| `declared source missing` | add `case_files.source_root` without creating directory | 1 | `source_root.*missing` |
| `missing selected asset` | convert, then change selected asset to `assets/source/missing.txt` | 1 | `source_assets.*missing.txt` |

Each mutation must load `case.json`, change only the named property, and write it back with `ConvertTo-Json -Depth 12`. End with:

Implement the table with these concrete calls (line wrapping is allowed, behavior is not):

```powershell
Invoke-Fixture 'valid review' { param($c) Initialize-ReviewFixture $c } 0 'validation passed: 1 cases'
Invoke-Fixture 'valid snapshot' { param($c) Initialize-ReviewFixture $c; Convert-ToSnapshot (Join-Path $c 'alpha') } 0 'validation passed: 1 cases'
Invoke-Fixture 'slug mismatch' { param($c) Initialize-ReviewFixture $c; Update-TestMetadata $c { param($m) $m.slug = 'beta' } } 1 'slug.*directory'
Invoke-Fixture 'missing README' { param($c) Initialize-ReviewFixture $c; Remove-Item -LiteralPath (Join-Path $c 'alpha\README.md') } 1 'README.md.*missing'
Invoke-Fixture 'snapshot missing page' { param($c) Initialize-ReviewFixture $c; Convert-ToSnapshot (Join-Path $c 'alpha'); Remove-Item -LiteralPath (Join-Path $c 'alpha\index.html') } 1 'review_page.*missing'
Invoke-Fixture 'snapshot empty source' { param($c) Initialize-ReviewFixture $c; Convert-ToSnapshot (Join-Path $c 'alpha'); Remove-Item -LiteralPath (Join-Path $c 'alpha\assets\source\evidence.txt') } 1 'source_root.*empty'
Invoke-Fixture 'path traversal' { param($c) Initialize-ReviewFixture $c; Update-TestMetadata $c { param($m) $m.case_files.metadata = '../case.json' } } 1 'case_files.metadata.*relative'
Invoke-Fixture 'invalid artifact level' { param($c) Initialize-ReviewFixture $c; Update-TestMetadata $c { param($m) $m.artifact_level = 'partial' } } 1 'artifact_level'
Invoke-Fixture 'index omission' { param($c) Initialize-ReviewFixture $c; Write-TestIndex $c @() } 1 'index.*alpha'
Invoke-Fixture 'duplicate index' { param($c) Initialize-ReviewFixture $c; Write-TestIndex $c @('alpha', 'alpha') } 1 'index.*duplicate.*alpha'
Invoke-Fixture 'invalid schema JSON' { param($c) Initialize-ReviewFixture $c; Set-Content -LiteralPath (Join-Path $c 'case.schema.json') -Value '{' -Encoding UTF8 } 1 'schema.*JSON'
Invoke-Fixture 'wrong schema version' { param($c) Initialize-ReviewFixture $c; $s = Get-Content -Raw (Join-Path $c 'case.schema.json') | ConvertFrom-Json; $s.properties.schema_version.const = '2.0.0'; $s | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $c 'case.schema.json') -Encoding UTF8 } 1 'schema.*1.0.0'
Invoke-Fixture 'review page undeclared' { param($c) Initialize-ReviewFixture $c; Set-Content -LiteralPath (Join-Path $c 'alpha\index.html') -Value '<!doctype html>' -Encoding UTF8 } 1 'index.html.*review_page'
Invoke-Fixture 'declared source missing' { param($c) Initialize-ReviewFixture $c; Update-TestMetadata $c { param($m) $m.case_files | Add-Member -NotePropertyName source_root -NotePropertyValue 'assets/source' } } 1 'source_root.*missing'
Invoke-Fixture 'missing selected asset' { param($c) Initialize-ReviewFixture $c; Convert-ToSnapshot (Join-Path $c 'alpha'); Update-TestMetadata $c { param($m) $m.source_assets[0].file = 'assets/source/missing.txt' } } 1 'source_assets.*missing.txt'
```

End with:

```powershell
Write-Host "Case validator fixtures passed: $script:passed; failed: $script:failed"
if ($script:failed -gt 0) { exit 1 }
exit 0
```

- [ ] **Step 2: Run the test to prove the validator is missing**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-case-library-validator.ps1
```

Expected: FAIL because `scripts/validate-case-library.ps1` does not exist.

- [ ] **Step 3: Add the declarative schema**

Create `cases/case.schema.json` exactly from this structure. The URN is an intentional non-resolving identifier:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:wuyoustudio:schemas:website-case:1.0.0",
  "title": "Website Case Metadata",
  "type": "object",
  "required": [
    "schema_version", "slug", "artifact_level", "title", "source",
    "observed_at", "language", "industry", "page_type", "evidence",
    "site_facts", "transferable_patterns", "do_not_copy",
    "source_assets", "case_files"
  ],
  "properties": {
    "schema_version": {"const": "1.0.0"},
    "slug": {"type": "string", "pattern": "^[a-z0-9]+(?:[-_][a-z0-9]+)*$"},
    "artifact_level": {"enum": ["review", "snapshot"]},
    "title": {"type": "string", "minLength": 1},
    "source": {"type": "string", "format": "uri", "pattern": "^[Hh][Tt][Tt][Pp][Ss]?://"},
    "observed_at": {"type": "string", "format": "date"},
    "language": {"type": "string", "pattern": "^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$"},
    "languages": {
      "type": "array",
      "items": {"type": "string", "pattern": "^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$"},
      "uniqueItems": true
    },
    "industry": {"allOf": [{"$ref": "#/$defs/stringArray"}, {"minItems": 1}]},
    "page_type": {"type": "string", "minLength": 1},
    "evidence": {
      "type": "object",
      "required": ["status", "observations"],
      "properties": {
        "status": {"type": "string", "minLength": 1},
        "observations": {"type": "array", "minItems": 1, "items": {"$ref": "#/$defs/observation"}}
      },
      "additionalProperties": true
    },
    "site_facts": {"$ref": "#/$defs/stringArray"},
    "source_claims": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["claim", "location", "verification"],
        "properties": {
          "claim": {"type": "string", "minLength": 1},
          "location": {"type": "string", "minLength": 1},
          "verification": {"type": "string", "minLength": 1}
        },
        "additionalProperties": true
      }
    },
    "transferable_patterns": {"type": "array", "items": {"$ref": "#/$defs/pattern"}},
    "do_not_copy": {"allOf": [{"$ref": "#/$defs/stringArray"}, {"minItems": 1}]},
    "source_assets": {"type": "array", "items": {"$ref": "#/$defs/sourceAsset"}},
    "case_files": {
      "type": "object",
      "required": ["readme", "metadata"],
      "properties": {
        "readme": {"const": "README.md"},
        "metadata": {"const": "case.json"},
        "review_page": {"const": "index.html"},
        "source_root": {"const": "assets/source"},
        "supporting_files": {
          "type": "array",
          "items": {"$ref": "#/$defs/relativePath"},
          "uniqueItems": true
        }
      },
      "additionalProperties": false
    }
  },
  "$defs": {
    "relativePath": {
      "type": "string",
      "minLength": 1,
      "pattern": "^(?!/)(?![A-Za-z]:)(?!.*(?:^|/)\\.\\.(?:/|$))[^\\\\]+$"
    },
    "stringArray": {"type": "array", "items": {"type": "string", "minLength": 1}},
    "observation": {
      "type": "object",
      "required": ["observed_at", "scope", "checked", "not_checked", "notes"],
      "properties": {
        "observed_at": {"type": "string", "format": "date"},
        "scope": {"allOf": [{"$ref": "#/$defs/stringArray"}, {"minItems": 1}]},
        "checked": {"$ref": "#/$defs/stringArray"},
        "not_checked": {"$ref": "#/$defs/stringArray"},
        "notes": {"$ref": "#/$defs/stringArray"}
      },
      "additionalProperties": true
    },
    "pattern": {
      "type": "object",
      "required": ["name", "when", "use", "guardrail"],
      "properties": {
        "name": {"type": "string", "minLength": 1},
        "when": {"type": "string", "minLength": 1},
        "use": {"type": "string", "minLength": 1},
        "guardrail": {"type": "string", "minLength": 1}
      },
      "additionalProperties": true
    },
    "sourceAsset": {
      "type": "object",
      "required": ["file", "kind", "role"],
      "properties": {
        "file": {"$ref": "#/$defs/relativePath"},
        "kind": {"type": "string", "minLength": 1},
        "role": {"type": "string", "minLength": 1}
      },
      "additionalProperties": true
    }
  },
  "allOf": [{
    "if": {"properties": {"artifact_level": {"const": "snapshot"}}, "required": ["artifact_level"]},
    "then": {
      "properties": {
        "source_assets": {"minItems": 1},
        "case_files": {"required": ["readme", "metadata", "review_page", "source_root"]}
      }
    }
  }],
  "additionalProperties": true
}
```

- [ ] **Step 4: Implement the complete Windows PowerShell 5.1 validator**

Create `scripts/validate-case-library.ps1` from the complete script below; do not prepend another `param(...)` block and do not replace it with `Test-Json` or an external module:

```powershell
[CmdletBinding()]
param(
    [string]$CasesPath = (Join-Path $PSScriptRoot '..\cases'),
    [string]$SchemaPath = (Join-Path $PSScriptRoot '..\cases\case.schema.json'),
    [string]$IndexPath = (Join-Path $PSScriptRoot '..\cases\README.md')
)

$ErrorActionPreference = 'Stop'
$script:errors = New-Object System.Collections.Generic.List[string]

function Add-ValidationError([string]$Case, [string]$Field, [string]$Message) {
    $script:errors.Add(('[{0}] {1}: {2}' -f $Case, $Field, $Message))
}

function Has-Property($Object, [string]$Name) {
    if ($null -eq $Object) { return $false }
    foreach ($property in $Object.PSObject.Properties) {
        if ([string]::Equals($property.Name, $Name, [StringComparison]::Ordinal)) { return $true }
    }
    return $false
}

function Test-String($Value) { return $Value -is [string] -and $Value.Trim().Length -gt 0 }
function Test-Array($Value) { return $Value -is [System.Array] }

function Test-RelativeCasePath([string]$Value) {
    if (-not (Test-String $Value) -or [IO.Path]::IsPathRooted($Value) -or $Value.Contains('\')) { return $false }
    return -not (@($Value -split '/') -contains '..')
}

function Resolve-RequiredPath([string]$Value, [string]$Field, [string]$PathType) {
    try {
        $resolved = (Resolve-Path -LiteralPath $Value -ErrorAction Stop).Path
        $expectedType = if ($PathType -eq 'directory') { 'Container' } else { 'Leaf' }
        if (-not (Test-Path -LiteralPath $resolved -PathType $expectedType)) {
            Add-ValidationError 'library' $Field ("expected a $PathType at $Value")
            return $null
        }
        return $resolved
    } catch {
        Add-ValidationError 'library' $Field ("missing or unreadable $PathType at $Value")
        return $null
    }
}

function Read-JsonFile([string]$Path, [string]$Case, [string]$Field) {
    try {
        $value = Get-Content -LiteralPath $Path -Raw -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop
        return [pscustomobject]@{ Success = $true; Value = $value }
    } catch {
        Add-ValidationError $Case $Field ("invalid JSON: $($_.Exception.Message)")
        return [pscustomobject]@{ Success = $false; Value = $null }
    }
}

function Validate-StringArray($Value, [string]$Case, [string]$Field, [int]$MinItems = 0) {
    if (-not (Test-Array $Value)) {
        Add-ValidationError $Case $Field 'must be an array'
        return
    }
    if ($Value.Count -lt $MinItems) { Add-ValidationError $Case $Field ("must contain at least $MinItems item(s)") }
    for ($i = 0; $i -lt $Value.Count; $i++) {
        if (-not (Test-String $Value[$i])) { Add-ValidationError $Case "$Field[$i]" 'must be a nonempty string' }
    }
}

function Validate-Date($Value, [string]$Case, [string]$Field) {
    if (-not (Test-String $Value)) {
        Add-ValidationError $Case $Field 'must be a nonempty string'
        return
    }
    [DateTime]$parsed = [DateTime]::MinValue
    $ok = [DateTime]::TryParseExact($Value, 'yyyy-MM-dd', [Globalization.CultureInfo]::InvariantCulture,
        [Globalization.DateTimeStyles]::None, [ref]$parsed)
    if (-not $ok) { Add-ValidationError $Case $Field 'must use YYYY-MM-DD' }
}

function Validate-Url($Value, [string]$Case, [string]$Field) {
    if (-not (Test-String $Value)) {
        Add-ValidationError $Case $Field 'must be a nonempty string'
        return
    }
    [Uri]$uri = $null
    if (-not [Uri]::TryCreate($Value, [UriKind]::Absolute, [ref]$uri) -or $uri.Scheme -notin @('http', 'https')) {
        Add-ValidationError $Case $Field 'must be an absolute HTTP(S) URL'
    }
}

function Resolve-CaseRelativePath([string]$CaseRoot, [string]$Value, [string]$Case, [string]$Field) {
    if (-not (Test-RelativeCasePath $Value)) {
        Add-ValidationError $Case $Field 'relative path is invalid'
        return $null
    }
    $rootFull = [IO.Path]::GetFullPath($CaseRoot)
    $rootPrefix = $rootFull.TrimEnd([char[]]@([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar)) + [IO.Path]::DirectorySeparatorChar
    $platformPath = $Value.Replace('/', [IO.Path]::DirectorySeparatorChar)
    $target = [IO.Path]::GetFullPath((Join-Path $rootFull $platformPath))
    if (-not $target.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        Add-ValidationError $Case $Field 'path escapes the case directory'
        return $null
    }
    return $target
}

function Validate-Observation($Observation, [string]$Case, [string]$Field) {
    foreach ($name in @('observed_at', 'scope', 'checked', 'not_checked', 'notes')) {
        if (-not (Has-Property $Observation $name)) { Add-ValidationError $Case "$Field.$name" 'is required' }
    }
    if (Has-Property $Observation 'observed_at') { Validate-Date $Observation.observed_at $Case "$Field.observed_at" }
    if (Has-Property $Observation 'scope') { Validate-StringArray $Observation.scope $Case "$Field.scope" 1 }
    foreach ($name in @('checked', 'not_checked', 'notes')) {
        if (Has-Property $Observation $name) { Validate-StringArray $Observation.$name $Case "$Field.$name" }
    }
}

function Validate-Pattern($Pattern, [string]$Case, [string]$Field) {
    foreach ($name in @('name', 'when', 'use', 'guardrail')) {
        if (-not (Has-Property $Pattern $name) -or -not (Test-String $Pattern.$name)) {
            Add-ValidationError $Case "$Field.$name" 'must be a nonempty string'
        }
    }
}

$resolvedCases = Resolve-RequiredPath $CasesPath 'CasesPath' 'directory'
$resolvedSchema = Resolve-RequiredPath $SchemaPath 'SchemaPath' 'file'
$resolvedIndex = Resolve-RequiredPath $IndexPath 'IndexPath' 'file'

$schema = $null
if ($resolvedSchema) {
    $schemaResult = Read-JsonFile $resolvedSchema 'library' 'schema JSON'
    if ($schemaResult.Success) {
        if ($schemaResult.Value -isnot [PSCustomObject]) {
            Add-ValidationError 'library' 'schema' 'top-level JSON must be an object'
        } else {
            $schema = $schemaResult.Value
            if (-not (Has-Property $schema 'properties') -or
                -not (Has-Property $schema.properties 'schema_version') -or
                -not (Has-Property $schema.properties.schema_version 'const') -or
                -not (Test-String $schema.properties.schema_version.const) -or
                $schema.properties.schema_version.const -ne '1.0.0') {
                Add-ValidationError 'library' 'schema' 'expected schema version 1.0.0'
            }
        }
    }
}

$caseDirectories = @()
if ($resolvedCases) {
    $caseDirectories = @(Get-ChildItem -LiteralPath $resolvedCases -Directory | Where-Object {
        (Test-Path -LiteralPath (Join-Path $_.FullName 'README.md') -PathType Leaf) -or
        (Test-Path -LiteralPath (Join-Path $_.FullName 'case.json') -PathType Leaf)
    } | Sort-Object Name)
}

foreach ($directory in $caseDirectories) {
    $caseName = $directory.Name
    $readmePath = Join-Path $directory.FullName 'README.md'
    $metadataPath = Join-Path $directory.FullName 'case.json'
    if (-not (Test-Path -LiteralPath $readmePath -PathType Leaf)) { Add-ValidationError $caseName 'README.md' 'required file is missing' }
    if (-not (Test-Path -LiteralPath $metadataPath -PathType Leaf)) {
        Add-ValidationError $caseName 'case.json' 'required file is missing'
        continue
    }

    $metadataResult = Read-JsonFile $metadataPath $caseName 'case.json'
    if (-not $metadataResult.Success) { continue }
    if ($metadataResult.Value -isnot [PSCustomObject]) {
        Add-ValidationError $caseName 'case.json' 'top-level JSON must be an object'
        continue
    }
    $metadata = $metadataResult.Value
    $required = @('schema_version', 'slug', 'artifact_level', 'title', 'source', 'observed_at', 'language',
        'industry', 'page_type', 'evidence', 'site_facts', 'transferable_patterns', 'do_not_copy',
        'source_assets', 'case_files')
    foreach ($name in $required) {
        if (-not (Has-Property $metadata $name)) { Add-ValidationError $caseName $name 'is required' }
    }

    if ((Has-Property $metadata 'schema_version') -and (-not (Test-String $metadata.schema_version) -or $metadata.schema_version -ne '1.0.0')) { Add-ValidationError $caseName 'schema_version' 'must be the string 1.0.0' }
    if (Has-Property $metadata 'slug') {
        if (-not (Test-String $metadata.slug) -or $metadata.slug -notmatch '^[a-z0-9]+(?:[-_][a-z0-9]+)*$') { Add-ValidationError $caseName 'slug' 'has invalid format' }
        elseif ($metadata.slug -ne $caseName) { Add-ValidationError $caseName 'slug' 'does not match directory name' }
    }
    if ((Has-Property $metadata 'artifact_level') -and (-not (Test-String $metadata.artifact_level) -or $metadata.artifact_level -notin @('review', 'snapshot'))) { Add-ValidationError $caseName 'artifact_level' 'must be the string review or snapshot' }
    foreach ($name in @('title', 'language', 'page_type')) {
        if ((Has-Property $metadata $name) -and -not (Test-String $metadata.$name)) { Add-ValidationError $caseName $name 'must be a nonempty string' }
    }
    if ((Has-Property $metadata 'language') -and (Test-String $metadata.language) -and $metadata.language -notmatch '^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$') { Add-ValidationError $caseName 'language' 'has invalid BCP 47 format' }
    if (Has-Property $metadata 'source') { Validate-Url $metadata.source $caseName 'source' }
    if (Has-Property $metadata 'observed_at') { Validate-Date $metadata.observed_at $caseName 'observed_at' }
    if (Has-Property $metadata 'industry') { Validate-StringArray $metadata.industry $caseName 'industry' 1 }
    if (Has-Property $metadata 'site_facts') { Validate-StringArray $metadata.site_facts $caseName 'site_facts' }
    if (Has-Property $metadata 'do_not_copy') { Validate-StringArray $metadata.do_not_copy $caseName 'do_not_copy' 1 }
    if (Has-Property $metadata 'languages') {
        Validate-StringArray $metadata.languages $caseName 'languages'
        if (Test-Array $metadata.languages) {
            for ($i = 0; $i -lt $metadata.languages.Count; $i++) {
                if ((Test-String $metadata.languages[$i]) -and $metadata.languages[$i] -notmatch '^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$') {
                    Add-ValidationError $caseName "languages[$i]" 'has invalid BCP 47 format'
                }
            }
        }
    }

    if (Has-Property $metadata 'evidence') {
        if (-not (Has-Property $metadata.evidence 'status') -or -not (Test-String $metadata.evidence.status)) { Add-ValidationError $caseName 'evidence.status' 'must be a nonempty string' }
        if (-not (Has-Property $metadata.evidence 'observations') -or -not (Test-Array $metadata.evidence.observations) -or $metadata.evidence.observations.Count -lt 1) {
            Add-ValidationError $caseName 'evidence.observations' 'must be a nonempty array'
        } else {
            for ($i = 0; $i -lt $metadata.evidence.observations.Count; $i++) { Validate-Observation $metadata.evidence.observations[$i] $caseName "evidence.observations[$i]" }
        }
    }

    if (Has-Property $metadata 'transferable_patterns') {
        if (-not (Test-Array $metadata.transferable_patterns)) { Add-ValidationError $caseName 'transferable_patterns' 'must be an array' }
        else { for ($i = 0; $i -lt $metadata.transferable_patterns.Count; $i++) { Validate-Pattern $metadata.transferable_patterns[$i] $caseName "transferable_patterns[$i]" } }
    }

    if (Has-Property $metadata 'source_claims') {
        if (-not (Test-Array $metadata.source_claims)) { Add-ValidationError $caseName 'source_claims' 'must be an array' }
        else {
            for ($i = 0; $i -lt $metadata.source_claims.Count; $i++) {
                foreach ($name in @('claim', 'location', 'verification')) {
                    if (-not (Has-Property $metadata.source_claims[$i] $name) -or -not (Test-String $metadata.source_claims[$i].$name)) {
                        Add-ValidationError $caseName "source_claims[$i].$name" 'must be a nonempty string'
                    }
                }
            }
        }
    }

    $caseFiles = if (Has-Property $metadata 'case_files') { $metadata.case_files } else { $null }
    $declaredReview = $false
    $declaredSource = $false
    if ((Has-Property $metadata 'case_files') -and $caseFiles -isnot [PSCustomObject]) {
        Add-ValidationError $caseName 'case_files' 'must be an object'
        $caseFiles = $null
    }
    if ($caseFiles -is [PSCustomObject]) {
        foreach ($name in @('readme', 'metadata')) {
            if (-not (Has-Property $caseFiles $name)) { Add-ValidationError $caseName "case_files.$name" 'is required' }
        }
        foreach ($entry in @(@('readme', 'README.md'), @('metadata', 'case.json'))) {
            $name = $entry[0]; $expected = $entry[1]
            if (Has-Property $caseFiles $name) {
                if (-not (Test-String $caseFiles.$name)) { Add-ValidationError $caseName "case_files.$name" 'must be a string' }
                else {
                    Resolve-CaseRelativePath $directory.FullName $caseFiles.$name $caseName "case_files.$name" | Out-Null
                    if ($caseFiles.$name -ne $expected) { Add-ValidationError $caseName "case_files.$name" ("must equal $expected") }
                }
            }
        }
        $declaredReview = Has-Property $caseFiles 'review_page'
        $declaredSource = Has-Property $caseFiles 'source_root'
        if ($declaredReview) {
            if (-not (Test-String $caseFiles.review_page)) { Add-ValidationError $caseName 'case_files.review_page' 'must be a string' }
            else {
                $target = Resolve-CaseRelativePath $directory.FullName $caseFiles.review_page $caseName 'case_files.review_page'
                if ($caseFiles.review_page -ne 'index.html') { Add-ValidationError $caseName 'case_files.review_page' 'must equal index.html' }
                if ($target -and -not (Test-Path -LiteralPath $target -PathType Leaf)) { Add-ValidationError $caseName 'case_files.review_page' 'declared file is missing' }
            }
        }
        if ($declaredSource) {
            if (-not (Test-String $caseFiles.source_root)) { Add-ValidationError $caseName 'case_files.source_root' 'must be a string' }
            else {
                $target = Resolve-CaseRelativePath $directory.FullName $caseFiles.source_root $caseName 'case_files.source_root'
                if ($caseFiles.source_root -ne 'assets/source') { Add-ValidationError $caseName 'case_files.source_root' 'must equal assets/source' }
                if ($target -and -not (Test-Path -LiteralPath $target -PathType Container)) { Add-ValidationError $caseName 'case_files.source_root' 'declared directory is missing' }
            }
        }
        if (Has-Property $caseFiles 'supporting_files') {
            if (-not (Test-Array $caseFiles.supporting_files)) { Add-ValidationError $caseName 'case_files.supporting_files' 'must be an array' }
            else {
                for ($i = 0; $i -lt $caseFiles.supporting_files.Count; $i++) {
                    if (-not (Test-String $caseFiles.supporting_files[$i])) { Add-ValidationError $caseName "case_files.supporting_files[$i]" 'must be a string' }
                    else {
                        $target = Resolve-CaseRelativePath $directory.FullName $caseFiles.supporting_files[$i] $caseName "case_files.supporting_files[$i]"
                        if ($target -and -not (Test-Path -LiteralPath $target -PathType Leaf)) { Add-ValidationError $caseName "case_files.supporting_files[$i]" 'declared file is missing' }
                    }
                }
            }
        }
    }

    $physicalReview = Test-Path -LiteralPath (Join-Path $directory.FullName 'index.html') -PathType Leaf
    $physicalSource = Test-Path -LiteralPath (Join-Path $directory.FullName 'assets\source') -PathType Container
    if ($physicalReview -and -not $declaredReview) { Add-ValidationError $caseName 'index.html' 'exists but case_files.review_page is missing' }
    if ($physicalSource -and -not $declaredSource) { Add-ValidationError $caseName 'assets/source' 'exists but case_files.source_root is missing' }

    if (Has-Property $metadata 'source_assets') {
        if (-not (Test-Array $metadata.source_assets)) { Add-ValidationError $caseName 'source_assets' 'must be an array' }
        else {
            for ($i = 0; $i -lt $metadata.source_assets.Count; $i++) {
                $asset = $metadata.source_assets[$i]
                foreach ($name in @('file', 'kind', 'role')) {
                    if (-not (Has-Property $asset $name) -or -not (Test-String $asset.$name)) { Add-ValidationError $caseName "source_assets[$i].$name" 'must be a nonempty string' }
                }
                if ((Has-Property $asset 'file') -and (Test-String $asset.file)) {
                    $target = Resolve-CaseRelativePath $directory.FullName $asset.file $caseName "source_assets[$i].file"
                    if ($target -and -not (Test-Path -LiteralPath $target -PathType Leaf)) { Add-ValidationError $caseName "source_assets[$i].file" ("declared file is missing: $($asset.file)") }
                }
            }
        }
    }

    if ((Has-Property $metadata 'artifact_level') -and $metadata.artifact_level -eq 'snapshot') {
        if (-not $declaredReview) { Add-ValidationError $caseName 'case_files.review_page' 'is required for snapshot' }
        if (-not $declaredSource) { Add-ValidationError $caseName 'case_files.source_root' 'is required for snapshot' }
        if (-not (Test-Array $metadata.source_assets) -or $metadata.source_assets.Count -lt 1) { Add-ValidationError $caseName 'source_assets' 'snapshot requires at least one selected asset' }
        if ($physicalSource -and -not (Get-ChildItem -LiteralPath (Join-Path $directory.FullName 'assets\source') -File -Recurse | Select-Object -First 1)) {
            Add-ValidationError $caseName 'case_files.source_root' 'snapshot source_root directory is empty'
        }
    }
}

if ($resolvedIndex) {
    try {
        $indexText = Get-Content -LiteralPath $resolvedIndex -Raw -ErrorAction Stop
        $linkPattern = '\]\((?<slug>[a-z0-9]+(?:[-_][a-z0-9]+)*)/\)'
        $counts = @{}
        foreach ($match in [regex]::Matches($indexText, $linkPattern)) {
            $slug = $match.Groups['slug'].Value
            if (-not $counts.ContainsKey($slug)) { $counts[$slug] = 0 }
            $counts[$slug]++
        }
        $directoryNames = @($caseDirectories | ForEach-Object Name)
        foreach ($name in $directoryNames) {
            if (-not $counts.ContainsKey($name)) { Add-ValidationError 'index' 'index' ("missing case directory entry: {0}" -f $name) }
            elseif ($counts[$name] -ne 1) { Add-ValidationError 'index' 'index' ("duplicate entry for {0}" -f $name) }
        }
        foreach ($name in $counts.Keys) {
            if ($name -notin $directoryNames) { Add-ValidationError 'index' 'index' ("entry {0} has no case directory" -f $name) }
        }
    } catch {
        Add-ValidationError 'library' 'IndexPath' ("unreadable index: $($_.Exception.Message)")
    }
}

if ($script:errors.Count -gt 0) {
    $script:errors | Sort-Object | ForEach-Object { Write-Output "ERROR $_" }
    exit 1
}
Write-Output ("Case library validation passed: {0} cases." -f $caseDirectories.Count)
exit 0
```

- [ ] **Step 5: Add the missing bidirectional and optional-field fixtures**

Add twelve more fixtures before the final summary:

```powershell
Invoke-Fixture 'source directory undeclared' { param($c) Initialize-ReviewFixture $c; New-Item -ItemType Directory -Path (Join-Path $c 'alpha\assets\source') -Force | Out-Null; Set-Content -LiteralPath (Join-Path $c 'alpha\assets\source\evidence.txt') -Value 'evidence' } 1 'assets/source.*source_root'
Invoke-Fixture 'languages wrong type' { param($c) Initialize-ReviewFixture $c; Update-TestMetadata $c { param($m) $m | Add-Member -NotePropertyName languages -NotePropertyValue 'en' } } 1 'languages.*array'
Invoke-Fixture 'languages invalid tag' { param($c) Initialize-ReviewFixture $c; Update-TestMetadata $c { param($m) $m | Add-Member -NotePropertyName languages -NotePropertyValue @('not_a_tag') } } 1 'languages.*BCP 47'
Invoke-Fixture 'case files null' { param($c) Initialize-ReviewFixture $c; Update-TestMetadata $c { param($m) $m.case_files = $null } } 1 'case_files.*object'
Invoke-Fixture 'schema null' { param($c) Initialize-ReviewFixture $c; Set-Content -LiteralPath (Join-Path $c 'case.schema.json') -Value 'null' -Encoding UTF8 } 1 'schema.*object'
Invoke-Fixture 'case JSON array' { param($c) Initialize-ReviewFixture $c; Set-Content -LiteralPath (Join-Path $c 'alpha\case.json') -Value '[]' -Encoding UTF8 } 1 'case.json.*object'
Invoke-Fixture 'required key wrong case' { param($c) Initialize-ReviewFixture $c; Update-TestMetadata $c { param($m) $value = $m.slug; $m.PSObject.Properties.Remove('slug'); $m | Add-Member -NotePropertyName Slug -NotePropertyValue $value } } 1 'slug.*required'
Invoke-Fixture 'CasesPath is file' { param($c) Initialize-ReviewFixture $c; Remove-Item -LiteralPath $c -Recurse -Force; Set-Content -LiteralPath $c -Value 'not a directory' -Encoding UTF8 } 1 'CasesPath.*directory'
Invoke-Fixture 'artifact level array' { param($c) Initialize-ReviewFixture $c; Update-TestMetadata $c { param($m) $m.artifact_level = @('review') } } 1 'artifact_level.*string'
Invoke-Fixture 'source array' { param($c) Initialize-ReviewFixture $c; Update-TestMetadata $c { param($m) $m.source = @('https://example.com/') } } 1 'source.*string'
Invoke-Fixture 'case readme array' { param($c) Initialize-ReviewFixture $c; Update-TestMetadata $c { param($m) $m.case_files.readme = @('README.md') } } 1 'case_files.readme.*string'
Invoke-Fixture 'schema const array' { param($c) Initialize-ReviewFixture $c; $s = Get-Content -Raw (Join-Path $c 'case.schema.json') | ConvertFrom-Json; $s.properties.schema_version.const = @('1.0.0'); $s | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $c 'case.schema.json') -Encoding UTF8 } 1 'schema.*1.0.0'
```

- [ ] **Step 6: Make the test harness collect nonzero child exits safely**

Replace the invocation and result branch inside `Invoke-Fixture` with:

```powershell
$previousPreference = $ErrorActionPreference
try {
    $ErrorActionPreference = 'Continue'
    $output = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator `
        -CasesPath $cases -SchemaPath $schema -IndexPath $index 2>&1
    $exitCode = $LASTEXITCODE
} finally {
    $ErrorActionPreference = $previousPreference
}
$joinedOutput = $output -join "`n"
if ($exitCode -eq $ExpectedExitCode -and $joinedOutput -match $ExpectedMessage) {
    $script:passed++
} else {
    $script:failed++
    Write-Host "FIXTURE FAILED: $Name Exit=$exitCode Output=$($output -join ' | ')"
}
```

Remove the old child invocation/result branch entirely. The script must reach its final pass/fail summary even when negative fixtures correctly return exit 1.

- [ ] **Step 7: Run the isolated validator tests**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-case-library-validator.ps1
```

Expected: all twenty-seven fixtures pass. Do not run longer than three minutes without observable output.

- [ ] **Step 8: Confirm the real repository currently fails for contract reasons**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\validate-case-library.ps1
```

Expected: FAIL because the nine remote `case.json` files and index have not yet been normalized. The failure must name concrete cases/fields, proving the validator is exercising production data.

- [ ] **Step 9: Commit the contract and validator**

Run:

```powershell
git add cases/case.schema.json scripts/validate-case-library.ps1 scripts/test-case-library-validator.ps1
git commit -m "test: define website case library contract"
```

## Chunk 2: Normalize and migrate case data

### Task 3A: Normalize the seven near-contract snapshots

**Files:**
- Modify: `cases/enerax/case.json`
- Modify: `cases/ghrepower/case.json`
- Modify: `cases/jsmems/case.json`
- Modify: `cases/jxgtx/case.json`
- Modify: `cases/jypower/case.json`
- Modify: `cases/meihua/case.json`
- Modify: `cases/phabuilder/case.json`

- [ ] **Step 1: Apply the shared deterministic transformation**

For all seven files:

- prepend `schema_version: "1.0.0"` and `artifact_level: "snapshot"`;
- retain existing `slug`, `title`, string `source`, `observed_at`, `language`, `languages`, `industry`, `page_type`, `transferable_patterns`, and selected `source_assets`;
- normalize every old source claim to `{claim, location, verification}`: retain already-conforming objects; convert `{metric, value, verification}` to `{claim: "$metric：$value", location: "首页公开内容", verification: <old verification>}`; deduplicate the final array by exact `claim` text;
- wrap the old evidence in one observation: retain `status`; set observation `observed_at` to the top-level `observed_at`; copy old `checked` and `not_checked`; convert old `note` to single-item `notes`, retain old `notes` arrays, and use an empty notes array when neither exists;
- add the exact `scope` values below;
- rename the old grouped `site_facts` object to `site_fact_groups`, then write the exact string summaries below; retain existing string arrays unchanged for `ghrepower`, `jsmems`, and `phabuilder`;
- replace any old `case_files` shape with the fixed entry shown below; do not delete other case-specific top-level fields.

```json
{
  "readme": "README.md",
  "metadata": "case.json",
  "review_page": "index.html",
  "source_root": "assets/source",
  "supporting_files": ["styles.css", "script.js"]
}
```

| slug | observation `scope` | exact `site_facts` summary when the old value is grouped |
| --- | --- | --- |
| `enerax` | `公开首页`, `1440x900 桌面截图`, `390x844 移动截图`, `本地案例页` | `导航提供产品、行业应用、服务、新闻、关于、联系、语言和搜索入口`; `Hero 使用三张场景画面及视频层表达移动能源系统定位`; `产品分为移动电源、补能装置和数字能源管理平台`; `应用覆盖城市配送、专业运输、矿山、港口和钢厂等运输任务`; `桌面为深色设备叙事，移动端切换白色导航与纵向内容` |
| `ghrepower` | `公开首页`, `1440x900 桌面截图`, `390x844 移动截图`, `首页 DOM/CSS/JS` | 保留现有数组，不重写 |
| `jsmems` | `公开首页`, `首页 DOM/CSS/JS`, `公开图片资源` | 保留现有数组，不重写 |
| `jxgtx` | `公开中文首页`, `1440x900 桌面截图`, `390x844 移动截图`, `本地案例页` | `导航连接六类光通信产品、新闻、服务支持、公司和联系入口`; `Hero 展示测试仪器、OTDR、熔接机和连接器五类主题`; `产品分为熔接机、OTDR、测量仪器、ODN、清洁和工具`; `首页提供手册、指南、教程和售后四类服务快捷入口`; `移动端在约 990px 以下切换汉堡菜单并重排产品卡` |
| `jypower` | `公开中文首页`, `1440x900 桌面截图`, `390x844 移动截图`, `本地案例页` | `导航按产品、应用、设计、支持和公司信息组织`; `Hero 使用四张画面说明功率转换、创新、节源和客户连接`; `产品覆盖 AC/DC、USB PD、功率器件、同步整流、霍尔/DC-DC 与参考电压等系列`; `应用覆盖 AC/DC 电源、USB PD、LED 驱动和电机驱动`; `页面提供订购、设计、支持和加入四类行动入口` |
| `meihua` | `中文首页`, `英文首页`, `1440x900 桌面截图`, `390x844 移动截图`, `本地案例页` | `中英文导航连接公司、产品、研发、人才、投资者关系和可持续发展`; `Hero 用家庭烹饪与陪伴场景引出营养和生物制造`; `产品分为动物营养、鲜味剂、食品原料、胶体多糖、动物保健、植物蛋白和植物营养`; `生物制造模块连接可再生原料、生产效率、供应链循环和未来应用`; `产品卡在不同断点从横向多列逐步收敛到单列` |
| `phabuilder` | `公开首页`, `1440x900 桌面截图`, `390x844 移动截图`, `首页 DOM/CSS/JS 与公开素材` | 保留现有数组，第二次观察在 Task 4B 追加 |

For `jypower`, retain `site_fact_groups.public_claims` for traceability. Do not append it again: its public metrics already exist in the old `source_claims`, and the shared normalization/deduplication rule above produces the canonical claims.

- [ ] **Step 2: Parse and inspect the seven normalized files**

Run:

```powershell
$slugs = 'enerax','ghrepower','jsmems','jxgtx','jypower','meihua','phabuilder'
foreach ($slug in $slugs) {
    $case = Get-Content -Raw "cases/$slug/case.json" | ConvertFrom-Json
    if ($case.slug -ne $slug -or $case.artifact_level -ne 'snapshot' -or $case.evidence.observations.Count -ne 1) {
        throw "Snapshot normalization failed for $slug"
    }
    if ($case.evidence.observations[0].observed_at -ne $case.observed_at) {
        throw "Observation date mismatch for $slug"
    }
    foreach ($claim in @($case.source_claims)) {
        if (-not $claim.claim -or -not $claim.location -or -not $claim.verification) {
            throw "Noncanonical source claim for $slug"
        }
    }
}
```

Expected: no exception.

- [ ] **Step 3: Commit the seven normalized snapshots**

```powershell
git add cases/enerax/case.json cases/ghrepower/case.json cases/jsmems/case.json cases/jxgtx/case.json cases/jypower/case.json cases/meihua/case.json cases/phabuilder/case.json
git commit -m "docs: normalize website case snapshots"
```

### Task 3B: Normalize the two legacy snapshots

**Files:**
- Modify: `cases/btj_hcm/case.json`
- Modify: `cases/zoe_industry/case.json`

- [ ] **Step 1: Normalize `btj_hcm` with fixed identity and summaries**

Set `schema_version: "1.0.0"`, `slug: "btj_hcm"`, `artifact_level: "snapshot"`, `source: "https://cn.btjhcm.com/"`, `observed_at: "2026-08-24"`, `language: "zh-CN"`, `industry: ["金属钙", "钙系合金", "工业材料", "源头制造"]`, and `page_type: "金属钙与钙系合金制造企业官网首页"`. Set `evidence.status: "public-site-readonly-snapshot"`. Use one observation dated `2026-08-24` with scope `公开首页`, `桌面与移动截图`, `DOM/CSS/JS`, `公开图片与视频`; checked items come from the README archive list; not-checked items are `表单提交`, `登录与后台`, `第三方宣传核验`, `原站素材生产授权`; notes retain `source.notes` and the archive-rights boundary.

Write these `site_facts`: material forms and alloy families are both visible; applications connect steel/casting, nonferrous metallurgy, chemical and battery tasks; capability cards present range, stability, environmental process and qualifications; contact details are public. Map each old `publicClaims` item to `{claim: <old claim>, location: "全站公开内容", verification: <old status>}`; rename structures to `product_families`, `applications`, `asset_groups`, and `do_not_copy`. Create five patterns named `材料身份优先`, `采购关系模型`, `行业任务证据`, `能力证明映射`, and `工业视频回退`. Pattern index `i` uses `designRules[i]` as `use`, the fixed page type as `when`, and `doNotCopy[i]` as `guardrail`.

- [ ] **Step 2: Normalize `zoe_industry` with fixed identity and summaries**

Set `schema_version: "1.0.0"`, `slug: "zoe_industry"`, `artifact_level: "snapshot"`, `source: "https://www.zoe-industry.cn/"`, `observed_at: "2026-08-23"`, `language: "zh-CN"`, `industry: ["工业自动化", "MRO 采购", "欧洲品牌代理与经销", "跨境交付"]`, and `page_type: "工业 MRO 与跨境供应链企业官网首页"`. Set `evidence.status: "public-site-readonly-snapshot"`. Use one observation dated `2026-08-23` with scope `公开首页`, `桌面与移动截图`, `DOM/CSS/JS`, `公开品牌与产品资源`; checked/not-checked/notes follow the same archive rule as `btj_hcm`.

Write these `site_facts`: navigation exposes product, brand, company, news and contact routes; nine product families cover sensing, pumps, valves, motors, fixtures, electrical and instrumentation tasks; twelve industry categories are shown; brand relationships are visible but require authorization checks. Map each old `publicClaims` item to `{claim: <old claim>, location: "全站公开内容", verification: <old status>}`; rename structures to `product_families`, `brand_examples`, `asset_groups`, and `do_not_copy`. Create five patterns named `产品品牌行业三路径`, `品牌关系证据`, `行业任务下一步`, `信任数字核验`, and `设备图像降级`. Pattern index `i` uses `designRules[i]` as `use`, the fixed page type as `when`, and `doNotCopy[i]` as `guardrail`.

- [ ] **Step 3: Apply the shared snapshot file contract and commit**

Both files use the fixed snapshot `case_files` object from Task 3A. Use exactly these selected asset paths, each with a factual `kind` and `role`: `btj_hcm` uses `assets/source/home.html`, `assets/source/images/hero-factory.jpg`, and `assets/source/original-home-desktop.png`; `zoe_industry` uses `assets/source/home.html`, `assets/source/images/about-team.jpg`, and `assets/source/original-home-desktop.png`. Preserve `positioning`, `navigation`, `contact`, capabilities and other domain structures as snake_case extension fields.

```powershell
$output = & powershell -NoProfile -ExecutionPolicy Bypass -File scripts/validate-case-library.ps1 2>&1
if ($LASTEXITCODE -ne 0) { throw ($output -join [Environment]::NewLine) }
if (($output -join [Environment]::NewLine) -notmatch 'Case library validation passed: 9 cases') { throw 'Unexpected nine-case validation output' }
git add cases/btj_hcm/case.json cases/zoe_industry/case.json
git commit -m "docs: normalize legacy website snapshots"
```

### Task 4A: Migrate the seven lightweight reviews

**Files:**
- Move seven unique Markdown reviews to matching `cases/<slug>/README.md`
- Create seven matching `case.json` files

- [ ] **Step 1: Move the review documents with history**

```powershell
$moves = @{
  'gpixel'='gpixel.md'; 'szzygh'='szzygh.md'; 'iyungo'='iyungo.md';
  'vision-life'='vision-life.md'; 'funext-protein'='funext-protein.md';
  'tomilo'='tomilo.md'; 'yimmet'='yimmet.md'
}
foreach ($slug in $moves.Keys) {
    New-Item -ItemType Directory -Path "cases/$slug" -Force | Out-Null
    git mv "references/site-reviews/$($moves[$slug])" "cases/$slug/README.md"
}
```

Expected: seven moves, no copied duplicate. Existing `../../assets/library/` links remain correct from the new locations.

- [ ] **Step 2: Create exact review metadata summaries**

All seven files use `schema_version: "1.0.0"`, `artifact_level: "review"`, `evidence.status: "public-site-readonly-review"`, `source_assets: []`, and `case_files: {"readme":"README.md","metadata":"case.json"}`. The single observation uses the top-level `observed_at` date. `checked` equals the page/viewport entries in `scope`; `not_checked` is the exact text following `未验证项：` in the moved README as one string; `notes` contains the exact review-scope sentence that says site claims were not independently verified. If the README has no such sentence, use `本案例仅记录公开页面的只读审阅结果。`. `do_not_copy` contains the first sentence of every bullet under the moved README's `不应照搬` section. Use these exact identity, fact and primary-pattern values:

| slug | title / source / date / language | scope | exact `site_facts` | exact primary pattern (`name`; `when`; `use`; `guardrail`) |
| --- | --- | --- | --- | --- |
| `gpixel` | `Gpixel 复杂技术产品站案例`; `https://gpixel.com/`; `2026-08-20`; `en` | 首页、GMAX 系列、GMAX2424BSI 详情、1440x900、390x844 | 产品可按系列/子分类/型号浏览; 应用入口连接技术能力; 型号详情提供产品图、规格、工程图和分级资料 | `产品与应用双路径`; 多系列多型号且选型依赖参数或资料; 同时提供产品树与应用入口并在详情汇合; 移动端不得保留桌面固定宽度，资料权限必须明确 |
| `szzygh` | `卓越光华智能制造企业站案例`; `http://www.szzygh.cn/`; `2026-08-20`; `zh-CN` | 首页、MES 列表、注塑 MES 详情、1440x900、390x844 | 软件方案与配套硬件是并行入口; 首页使用公司数字和行业方案建立信任; 行业详情使用流程图解释实施任务 | `软硬件并行业务入口`; 同时销售工业软件实施和配套设备; 分开组织方案与硬件目录并用行业流程连接咨询; 不用泛化工业素材或图片正文替代真实证据 |
| `iyungo` | `云中谷工业装备企业站案例`; `http://www.iyungo.com/`; `2026-08-20`; `zh-CN` | 首页、产品中心、COB 测试台详情、1440x900、390x844 | 真实设备贯穿 Hero、产品和方案; 桌面首页由七个全屏楼层组成; 移动端退化为自然纵向内容 | `高价值设备叙事`; 产品类别少、单价高且拥有真实设备资产; 用设备主视觉和楼层解释公司、产品、方案与服务; 型号增多时必须增加筛选和参数证据，移动端不用滚动接管 |
| `vision-life` | `Vision-Life 高端住宅工程品牌站案例`; `https://www.vision-life.cn/`; `2026-08-21`; `zh-CN` | 首页、经典项目、檀宫详情、服务体系、施工总包、灵感故事、1440x900、390x844 | 首页先表达居住愿景和品牌价值; 少量精品项目承担审美与客群判断; 服务页用工艺、管理节点和长期服务支撑承诺 | `愿景到工程证据`; 高客单少项目且案例公开受隐私限制; 先建立生活愿景，再用项目与工程体系证明; 实景、示意、效果图和替代图必须分别披露 |
| `funext-protein` | `Funext Protein 食品科技品牌站案例`; `https://www.funext-protein.com/`; `2026-08-21`; `zh-CN` | 首页、产品与应用、鲜素块详情、公司简介、ESG、1440x900、390x844 | 液态微生物形状和 DNA 是统一动态母题; 内容按产品形态与食品应用双路径组织; 生产闭环和 ESG 承接技术可信度 | `认知任务驱动滚动`; 单一新技术原料需要教育研发、品牌和公众; 每段滚动回答定义、形态、应用、生产或影响问题; 移动端恢复自然流，所有动效有静态终态和可跳过路径 |
| `tomilo` | `Tomilo 环境试验设备站案例`; `https://www.tomilo.com.cn/`; `2026-08-21`; `zh-CN` | 首页、产品中心、设备详情、新能源汽车方案、质量、售后、技术文章与联系、1440x900、390x844 | 访客可从行业任务或产品分类进入; 详情连接参数、相关产品和适用方案; 质量、售后和技术文章形成长期采购证据 | `行业与产品双入口`; 多系列设备跨多个行业且售后影响采购; 关联行业、对象、要求、设备、型号和服务证据; 产品总览不能用无限长页替代筛选，参数与承诺要有版本口径 |
| `yimmet` | `YIMMET 宜美照明场景化产品站案例`; `https://www.yimmet.cn/`; `2026-08-21`; `zh-CN` | 首页、产品中心、筒灯详情、品牌案例、1440x900、1684x887、390x844 | 首页用办公室、教室、商业和家居场景说明使用结果; 产品中心按类型、功率和功能缩小范围; 详情与案例补齐参数、购买和项目证据 | `场景到产品证据链`; 安装效果重要且同时具有标准产品与工程案例; 场景回链产品属性、详情和项目; 不以大图、过量动效或外部商城替代参数、可访问性与性能 |

Set `industry` and `page_type` from the fixed design-spec identity table. Put the four strings in the last column into the first `transferable_patterns` object. Then convert every `###` subsection under `## 值得借鉴` into an additional pattern, in document order: `name` is the exact subsection heading; `use` is all prose and bullet text in that subsection joined with newlines; `when` is all prose and bullet text under `## 适用条件` joined with newlines; and `guardrail` is all prose and bullet text under `## 不应照搬` joined with newlines. Skip only a subsection whose exact heading duplicates the primary pattern name. For `source_claims`, add one object containing the exact review-scope sentence that enumerates the reference site's unverified metrics/credentials/effects; use `location: "审阅范围"` and `verification: "unverified-source-claim"`. If a review has no such sentence, use an empty array rather than inventing a claim.

- [ ] **Step 3: Assert the seven lightweight directory boundaries and commit**

```powershell
$slugs = 'gpixel','szzygh','iyungo','vision-life','funext-protein','tomilo','yimmet'
foreach ($slug in $slugs) {
    $relative = @(Get-ChildItem "cases/$slug" -Recurse -File | ForEach-Object { $_.FullName.Substring((Resolve-Path "cases/$slug").Path.Length + 1).Replace('\','/') }) | Sort-Object
    if (($relative -join ',') -ne 'case.json,README.md') { throw "Unexpected review files for $slug: $($relative -join ',')" }
}
$output = & powershell -NoProfile -ExecutionPolicy Bypass -File scripts/validate-case-library.ps1 2>&1
if ($LASTEXITCODE -eq 0) { throw 'Validator unexpectedly passed before the canonical index was updated' }
$indexErrors = @($output | Where-Object { $_ -match '^ERROR \[index\] index: missing case directory entry: ' })
$nonIndexErrors = @($output | Where-Object { $_ -match '^ERROR ' -and $_ -notmatch '^ERROR \[index\] index: missing case directory entry: ' })
if ($indexErrors.Count -ne 7) { throw "Expected seven missing index entries, got $($indexErrors.Count)" }
if ($nonIndexErrors.Count -gt 0) { throw ($nonIndexErrors -join [Environment]::NewLine) }
git add cases references/site-reviews
git commit -m "docs: migrate website reviews into cases"
```

### Task 4B: Merge the local Phabuilder review into the snapshot

**Files:**
- Modify: `cases/phabuilder/README.md`
- Modify: `cases/phabuilder/case.json`
- Delete: `references/site-reviews/phabuilder.md`

- [ ] **Step 1: Append the exact second observation**

Append this observation to `evidence.observations` while keeping top-level `observed_at: "2026-08-23"`:

```json
{
  "observed_at": "2026-08-21",
  "scope": ["首页", "PHAmily 原料产品", "PHAbrary 定制方案", "PHAdustry 智造产线", "PHA Life 多元创造", "1440x900", "390x844"],
  "checked": ["页面信息架构与业务路径", "标题与页面地标", "移动菜单与横向溢出", "图片/视频/轮播数量", "控制台错误与 fullPage 配置"],
  "not_checked": ["英文站完整内容", "搜索与商城", "订阅与联系提交", "新闻/专利/认证详情", "真实移动设备", "Firefox", "弱网与受控性能", "站点自述数据的第三方核验"],
  "notes": ["页面展示的组合数量、材料属性、抗菌率、产能、投资额、数字化率、人员、效率、认证和合作关系均为原站自述。", "可读取样式未发现 prefers-reduced-motion，另有跨域样式无法检查。"]
}
```

- [ ] **Step 2: Merge the exact local-only structured findings**

Add these `site_facts`: four inner-page paths map raw materials, application customization, manufacturing and commercialization; PHAmily combines scientific classification with grade/procurement data; PHAbrary organizes six application tasks; PHAdustry uses layout/digitalization/production lines as delivery evidence; PHA Life distinguishes collaborations, purchasable products and upcoming states.

Add these exact patterns:

| name | when | use | guardrail |
| --- | --- | --- | --- |
| 四阶段业务关系模型 | 企业同时具有材料谱系、应用开发、规模制造和商业案例 | 建立材料/牌号→性能→应用→样品/方案→产线→商业案例→证据关系 | 业务阶段不完整或命名难懂时改用直白栏目 |
| 真实资产认知递进 | 新材料需要从价值直觉逐步解释到产业落地 | 按自然场景、材料/实验、工厂、生活产品排列真实资产 | 自然风光不能替代产品、样品、工厂和测试证据 |
| 产线状态证据 | 产业客户需要判断规模化交付风险 | 区分布局、数字化、设计产能、在建、投产和实际产量 | 产能、效率、投资和数字化数据必须保留口径与审核状态 |
| 商业化状态区分 | 平台同时展示概念样品、合作与可购买产品 | 分开记录概念、展览、合作、可购买和即将上线状态 | 不把合作展示或概念样品写成已量产销售事实 |

Add these local-only guardrails to `do_not_copy`: missing H1/landmarks and wrong `lang`; all images loaded without native lazy loading; overlapping plugins and fullPage conflicts; inaccessible mobile menu without focus/Esc/background lock; diagrams without text equivalents. Add one `source_claims` object for the categories in the first observation note, with `location: "多页面公开内容"` and `verification: "unverified-source-claim"`; before appending it, remove any old claim whose exact `claim` text is already contained in the combined entry, then deduplicate the final array by exact `claim` text so combination-count and efficiency claims are not repeated.

Append a `## 多页面补充观察（2026-08-21）` section to `cases/phabuilder/README.md` containing the moved review's four-path model, inner-page findings, applicability, risks and minimum QA. Do not duplicate the remote README's homepage snapshot/archive sections.

- [ ] **Step 3: Remove the consumed duplicate, validate metadata, and commit**

```powershell
git rm references/site-reviews/phabuilder.md
$output = & powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\validate-case-library.ps1 2>&1
if ($LASTEXITCODE -ne 1) { throw "Expected only pre-index validation failures: $($output -join ' | ')" }
$indexErrors = @($output | Where-Object { $_ -match '^ERROR \[index\] index: missing case directory entry: ' })
$nonIndexErrors = @($output | Where-Object { $_ -match '^ERROR ' -and $_ -notmatch '^ERROR \[index\] index: missing case directory entry: ' })
if ($indexErrors.Count -ne 7) { throw "Expected seven missing index entries, got $($indexErrors.Count)" }
if ($nonIndexErrors.Count -gt 0) { throw ($nonIndexErrors -join [Environment]::NewLine) }
git add cases/phabuilder
git commit -m "docs: merge Phabuilder case observations"
```

Expected: before the canonical index update, validator failures are index-only.

## Chunk 3: Route the canonical library and verify

### Task 5: Make `cases/` the sole routed index

**Files:**
- Modify: `cases/README.md`
- Modify: `README.md`
- Modify: `SKILL.md`
- Modify: `references/lessons-learned.md`
- Delete: `references/site-reviews/index.md`

- [ ] **Step 1: Replace the case index with the fixed 16-row table**

Write sections in this order: `# 网站案例库`, `## 文件契约`, `## 完整度`, `## 权利边界`, `## 案例索引`, `## 新案例步骤`, `## README 最小模板`, and `## case.json 最小模板`. Use this exact index table:

| 案例 | 行业 | 主要受众 | 页面类型 | 风格 / 内容密度 | 观察日期 | 完整度 | 重点模式 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [晶华金属钙业](btj_hcm/) | 金属钙与钙系合金制造 | 材料采购、冶金/化工工程师、供应链与质量决策者 | 金属钙与钙系合金制造企业官网首页 | 深色工业制造、材料与工厂实景；中高密度 | 2026-08-24 | snapshot | 材料形态到采购证据链 |
| [能翊行](enerax/) | 移动能源与换电方案 | 商用车与矿港运营方、车队能源负责人、设备采购与合作伙伴 | 移动能源与换电方案企业官网首页 | 深色移动能源、设备与场景叙事；中高密度 | 2026-08-23 | snapshot | 场景、产品、应用与证据条 |
| [Funext Protein](funext-protein/) | 微生物蛋白与食品科技 | 食品研发/配方、品牌与采购合作方、产业伙伴及公众 | 原料、应用与 ESG 品牌站 | 橙绿生命科技、液态粒子、固定滚动叙事；中等密度 | 2026-08-21 | review | 认知任务驱动滚动 |
| [Gpixel](gpixel/) | 图像传感器技术产品 | 熟悉型号的工程用户、从应用进入的技术决策者 | 技术产品目录与型号详情 | 国际化科技、工程证据密集；高密度 | 2026-08-20 | review | 产品与应用双路径 |
| [上海致远绿色能源](ghrepower/) | 分布式风电与微电网 | 园区/微网能源负责人、工程与采购决策者、运维客户 | 工业能源企业官网首页 | 深色能源科技、五幕全屏叙事；中高密度 | 2026-08-23 | snapshot | 五幕叙事与方案矩阵 |
| [云中谷](iyungo/) | 半导体光芯片测试设备 | 工艺/研发工程师、设备采购与项目决策者、求职者 | 工业装备企业官网 | 沉浸式深色科技、全屏楼层；中等密度 | 2026-08-20 | review | 高价值设备叙事 |
| [苏州晶溯微纳](jsmems/) | MEMS 与微纳加工 | MEMS/微纳研发、项目工程师、采购与合作方 | 工业技术型官网首页 | 蓝色洁净科技、服务卡与工艺证据；中高密度 | 2026-08-23 | snapshot | 技术能力与工艺证据 |
| [江苏吉星 KomShine](jxgtx/) | 光通信设备与仪器 | 光纤施工/测试工程师、渠道采购、售后用户 | 光通信设备与光纤仪器企业官网首页 | 蓝色光通信科技、设备与服务导向；高密度 | 2026-08-23 | snapshot | 产品任务与服务支持层 |
| [苏州吉远 JIYUAN](jypower/) | 功率器件与电源方案 | 电源研发工程师、方案/采购决策者、样品与支持用户 | 功率转换控制器、功率器件与电源方案企业官网首页 | 深色电子科技、电路与器件视觉；高密度 | 2026-08-23 | snapshot | 产品/应用双路径与设计支持 |
| [梅花集团](meihua/) | 生物制造与食品配料 | 食品/饲料/农业采购、研发与全球合作方 | 氨基酸、食品配料与生物制造企业官网首页 | 暖色生活场景、生物制造叙事；中高密度 | 2026-08-23 | snapshot | 家庭场景到全球制造证据 |
| [微构工场 Phabuilder](phabuilder/) | PHA 生物材料平台 | 材料研发、产品/品牌团队、采购与产业合作方 | 生物材料与工业生物制造企业官网首页 | 绿色生命科技、自然实景、全屏楼层；中高密度 | 2026-08-23 | snapshot | 材料、应用、制造、商业化四阶段 |
| [卓越光华](szzygh/) | 智能制造软件与硬件 | 制造企业信息化负责人、生产/仓储管理者、采购与实施决策者 | B2B 企业官网与行业方案 | 深蓝工业科技、分屏叙事；中高密度 | 2026-08-20 | review | 软硬件并行业务入口 |
| [Tomilo](tomilo/) | 环境可靠性试验设备 | 测试/研发工程师、实验室与质量负责人、采购决策者、售后客户 | 复杂产品与行业解决方案站 | 蓝色工业科技、全屏楼层与真实设备；高密度 | 2026-08-21 | review | 行业与产品双入口 |
| [Vision-Life](vision-life/) | 高端住宅精装工程 | 高净值业主、家族住宅决策者、设计师与项目顾问 | 精品项目与服务品牌站 | 暖白金色、克制奢华、品牌叙事；低至中等密度 | 2026-08-21 | review | 愿景到工程证据 |
| [YIMMET 宜美照明](yimmet/) | 室内 LED 照明 | 工程采购、设计/经销合作方、终端消费者 | 场景化产品、案例与电商导流站 | 黄灰现代工业、真实空间与产品大图；中高密度 | 2026-08-21 | review | 场景到产品证据链 |
| [舟欧工业科技](zoe_industry/) | 工业 MRO 与跨境供应链 | 工业 MRO 采购、设备工程师、品牌供应商与跨境合作方 | 工业 MRO 与跨境供应链企业官网首页 | 蓝色工业供应链、产品品牌并行；高密度 | 2026-08-23 | snapshot | 产品、品牌、行业三路径 |

- [ ] **Step 2: Add concrete creation templates**

The README template contains these headings: `案例定位`, `审阅范围`, `已核实事实`, `可迁移经验（条件规则）`, `不应直接复制`, `复用时的最小验收`, and `归档资源`. State that the last section may say “无归档资源，当前为 review” rather than inventing files.

The JSON template uses real example values rather than placeholders:

```json
{
  "schema_version": "1.0.0",
  "slug": "sample-case",
  "artifact_level": "review",
  "title": "示例网站案例",
  "source": "https://example.com/",
  "observed_at": "2026-08-24",
  "language": "zh-CN",
  "industry": ["示例行业"],
  "page_type": "企业官网首页",
  "evidence": {"status": "public-site-readonly-review", "observations": [{"observed_at": "2026-08-24", "scope": ["公开首页"], "checked": ["页面结构"], "not_checked": ["表单提交"], "notes": ["示例数据不能作为生产事实"]}]},
  "site_facts": ["首页提供产品与联系入口"],
  "source_claims": [],
  "transferable_patterns": [{"name": "清晰入口", "when": "访客任务明确", "use": "按任务组织入口", "guardrail": "不复制品牌素材"}],
  "do_not_copy": ["未经授权的品牌素材"],
  "source_assets": [],
  "case_files": {"readme": "README.md", "metadata": "case.json"}
}
```

- [ ] **Step 3: Collapse the root README to one case-library entry**

Replace the duplicated per-case list with a short description and `[网站案例库](cases/)` link.

- [ ] **Step 4: Update Skill and lessons routes**

Replace `references/site-reviews/index.md` with `cases/README.md`; replace single-case paths with `cases/<slug>/README.md`; change the new-case instruction from creating under `references/site-reviews/` to `cases/<slug>/`. Preserve asset-library rules and all unrelated lessons.

- [ ] **Step 5: Delete the old index**

Run:

```powershell
git rm references/site-reviews/index.md
```

The `references/site-reviews/` directory should disappear once all tracked files are moved or removed.

- [ ] **Step 6: Run the route and index checks**

Run:

```powershell
$stale = & rg -n "references/site-reviews" SKILL.md README.md cases references/lessons-learned.md
if ($LASTEXITCODE -eq 0) { throw "Stale routes remain: $($stale -join ' | ')" }
if ($LASTEXITCODE -ne 1) { throw "rg failed with exit code $LASTEXITCODE" }
$output = & powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\validate-case-library.ps1 2>&1
if ($LASTEXITCODE -ne 0) { throw ($output -join [Environment]::NewLine) }
if (($output -join [Environment]::NewLine) -notmatch 'Case library validation passed: 16 cases') { throw 'Unexpected sixteen-case validation output' }
```

Expected: `rg` returns no matches; case validator reports exactly 16 valid cases.

- [ ] **Step 7: Commit routing changes**

Run:

```powershell
git add cases/README.md README.md SKILL.md references/lessons-learned.md
git commit -m "docs: make cases the canonical website library"
```

### Task 6: Run proportional final verification

**Files:**
- Verify only; modify files only if a failing check identifies a defect in this change.

- [ ] **Step 1: Request final code/content review before final checks**

Invoke `requesting-code-review` against `refs/remotes/origin/main..HEAD`. Verify each reported issue against the repository, apply only technically valid fixes, run the directly affected check, and commit review fixes with `fix: address case library review` if any files change.

- [ ] **Step 2: Run both case-library checks**

Run:

```powershell
$fixtureOutput = & powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-case-library-validator.ps1 2>&1
if ($LASTEXITCODE -ne 0) { throw ($fixtureOutput -join [Environment]::NewLine) }
if (($fixtureOutput -join [Environment]::NewLine) -notmatch 'Case validator fixtures passed: 27; failed: 0') { throw 'Unexpected fixture summary' }
$productionOutput = & powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\validate-case-library.ps1 2>&1
if ($LASTEXITCODE -ne 0) { throw ($productionOutput -join [Environment]::NewLine) }
if (($productionOutput -join [Environment]::NewLine) -notmatch 'Case library validation passed: 16 cases') { throw 'Unexpected production summary' }
```

Expected: twenty-seven fixture scenarios pass; production validation reports 16 cases. Stop any silent check after three minutes and report it as incomplete.

- [ ] **Step 3: Re-run the existing asset-library checks**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-asset-library-validator.ps1
if ($LASTEXITCODE -ne 0) { throw 'Asset validator fixture tests failed' }
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\validate-asset-library.ps1
if ($LASTEXITCODE -ne 0) { throw 'Production asset validation failed' }
```

Expected: both pass, showing the remote merge and case moves did not break the locally added licensed asset library.

- [ ] **Step 4: Validate JSON, stale routes, and whitespace with explicit assertions**

Run:

```powershell
$ErrorActionPreference = 'Stop'
Get-ChildItem cases -Directory | ForEach-Object {
    Get-Content -Raw (Join-Path $_.FullName 'case.json') | ConvertFrom-Json -ErrorAction Stop | Out-Null
}
$stale = & rg -n "references/site-reviews" SKILL.md README.md cases references/lessons-learned.md
if ($LASTEXITCODE -eq 0) { throw "Stale routes remain: $($stale -join ' | ')" }
if ($LASTEXITCODE -ne 1) { throw "rg failed with exit code $LASTEXITCODE" }
git diff --check refs/remotes/origin/main..HEAD
if ($LASTEXITCODE -ne 0) { throw 'git diff --check failed' }
```

Expected: all JSON parses; no stale production routes; no whitespace errors.

- [ ] **Step 5: Confirm exact content and size boundaries**

Run:

```powershell
$reviewSlugs = 'gpixel','szzygh','iyungo','vision-life','funext-protein','tomilo','yimmet'
foreach ($slug in $reviewSlugs) {
    $root = (Resolve-Path "cases/$slug").Path
    $files = @(Get-ChildItem $root -Recurse -File | ForEach-Object { $_.FullName.Substring($root.Length + 1).Replace('\','/') }) | Sort-Object
    if (($files -join ',') -ne 'case.json,README.md') { throw "Unexpected lightweight files for $slug: $($files -join ',')" }
}
$snapshotSlugs = 'btj_hcm','enerax','ghrepower','jsmems','jxgtx','jypower','meihua','phabuilder','zoe_industry'
$snapshotFiles = @($snapshotSlugs | ForEach-Object { Get-ChildItem "cases/$_" -Recurse -File })
if ($snapshotFiles.Count -ne 2383) { throw "Snapshot file count changed: $($snapshotFiles.Count)" }
$snapshotBytes = [int64](($snapshotFiles | Measure-Object Length -Sum).Sum)
if ([Math]::Abs($snapshotBytes - 554607256) -gt 1MB) { throw "Snapshot text-only delta exceeded 1 MiB: $snapshotBytes" }
$allCaseFiles = @(Get-ChildItem cases -Recurse -File)
if ($allCaseFiles.Count -ne 2399) { throw "Expected 2399 case-library files, found $($allCaseFiles.Count)" }
```

Then inspect `cases/gpixel/README.md` + `case.json`, `cases/jsmems/README.md` + `case.json`, and both Phabuilder observations to confirm the human and structured summaries agree.

- [ ] **Step 6: Confirm final Git state and history after review fixes**

Run:

```powershell
git status --short --branch
git log --oneline --decorate --graph -12
git merge-base --is-ancestor a726900 HEAD
if ($LASTEXITCODE -ne 0) { throw 'a726900 is not an ancestor' }
git merge-base --is-ancestor 6862f2c HEAD
if ($LASTEXITCODE -ne 0) { throw '6862f2c is not an ancestor' }
$porcelain = git status --porcelain
if ($porcelain) { throw "Worktree is not clean: $($porcelain -join ' | ')" }
$counts = (git rev-list --left-right --count HEAD...refs/remotes/origin/main) -split '\s+'
if ([int]$counts[1] -ne 0) { throw "main is behind origin/main by $($counts[1]) commit(s)" }
```

Expected: clean `main`, ahead of `origin/main`; both prior commits are ancestors; no push performed.
