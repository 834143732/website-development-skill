# Website Material Library Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a license-safe reusable website material library, add Phabuilder as the eighth reviewed site, and audit all eight case studies for reusable material patterns.

**Architecture:** Keep reusable files in a centralized `assets/library/` tree with a machine-readable manifest and deterministic PowerShell validation. Keep observations and non-downloadable brand references in Markdown, linked from each site review and a central asset-library guide. Third-party site source is never copied; generic CSS/JS is authored locally, while third-party icons require an official license and preserved notice.

**Tech Stack:** Markdown, JSON, PowerShell 7, vanilla CSS/JavaScript, SVG, browser inspection, SHA-256.

---

## Chunk 1: Asset Library Infrastructure

### Task 1: Define the asset schema and failing validator checks

**Files:**
- Create: `assets/library/manifest.json`
- Create: `scripts/validate-asset-library.ps1`
- Create: `scripts/test-asset-library-validator.ps1`

- [ ] **Step 1: Create a minimal manifest with schema version, policies, and an empty asset list**
- [ ] **Step 2: Write validator tests using temporary fixture directories**

Cover valid manifests and failures for duplicate IDs, duplicate paths, missing files, orphan files, missing license/source, hash mismatch, disallowed extension, unsafe SVG, reference-site domains in CSS/JS, and oversized files without an exception.

- [ ] **Step 3: Run the test script and confirm it fails before the validator exists**

Run: `pwsh -NoProfile -File scripts/test-asset-library-validator.ps1`

Expected: non-zero exit showing the validator or required checks are missing.

- [ ] **Step 4: Implement the validator**

The validator accepts `-Root` and `-ManifestPath`, parses JSON, normalizes paths below `assets/library`, recalculates SHA-256, scans registered and orphan files, checks category extensions, and emits one actionable line per failure.

- [ ] **Step 5: Run validator tests and the repository manifest**

Run:

```powershell
pwsh -NoProfile -File scripts/test-asset-library-validator.ps1
pwsh -NoProfile -File scripts/validate-asset-library.ps1
```

Expected: all fixture cases pass and repository validation exits 0.

### Task 2: Add original reusable CSS and JavaScript patterns

**Files:**
- Create: `assets/library/css/focus-ring.css`
- Create: `assets/library/css/motion-safe-reveal.css`
- Create: `assets/library/js/accessible-disclosure-nav.js`
- Create: `assets/library/js/reveal-on-scroll.js`
- Modify: `assets/library/manifest.json`

- [ ] **Step 1: Add failing static assertions for required accessibility behavior**

Check that CSS includes `:focus-visible` and `prefers-reduced-motion`, the navigation controller uses native button state and Escape/focus restoration, and reveal content is visible before enhancement.

- [ ] **Step 2: Run the test script and confirm new assertions fail**
- [ ] **Step 3: Implement small dependency-free patterns from scratch**

Do not copy selectors, code, comments, durations, easing values, or naming from reference sites. Keep each file independent and document its DOM contract in the central reference.

- [ ] **Step 4: Add manifest entries as `self-authored` with hashes and intended uses**
- [ ] **Step 5: Run static tests and manifest validation**

### Task 3: Add reusable open-source icons and a generic visual asset

**Files:**
- Create: `assets/library/icons/*.svg`
- Create: `assets/library/images/*`
- Create: `assets/library/licenses/*`
- Modify: `assets/library/manifest.json`

- [ ] **Step 1: Verify icon source and license from the official upstream repository**
- [ ] **Step 2: Save only a small high-use set such as menu, close, arrow-up, search, phone, and external-link**
- [ ] **Step 3: Preserve the upstream license notice and record exact source URLs**
- [ ] **Step 4: Normalize SVGs to safe `currentColor` markup without scripts or remote references**
- [ ] **Step 5: Add one or more self-authored or clearly licensed generic visual assets only when they are broadly reusable**
- [ ] **Step 6: Update hashes and run manifest validation**

### Task 4: Document library usage and skill routing

**Files:**
- Create: `references/asset-library.md`
- Modify: `SKILL.md`
- Modify: `references/lessons-learned.md`

- [ ] **Step 1: Document selection, license, attribution, copying, and adaptation rules**
- [ ] **Step 2: Add a searchable material index with category, tags, path, license, and intended use**
- [ ] **Step 3: Route website planning and implementation from `SKILL.md` to the asset reference**
- [ ] **Step 4: Record the user-confirmed license boundary in the lessons log**
- [ ] **Step 5: Verify the main skill stays concise and does not duplicate the manifest or reference**

## Chunk 2: Site Review and Material Curation

### Task 5: Review Phabuilder as case study eight

**Files:**
- Create: `references/site-reviews/phabuilder.md`
- Modify: `references/site-reviews/index.md`
- Modify: `references/lessons-learned.md`

- [ ] **Step 1: Inspect desktop home, mobile home, and representative product/content pages**
- [ ] **Step 2: Record information architecture, visual system, interactions, assets, semantics, performance signals, console state, applicable conditions, and counterexamples**
- [ ] **Step 3: Add a material observation section classifying candidates as reusable, locally reimplemented, or reference-only**
- [ ] **Step 4: Add the eighth index row and a conditional lesson entry**

### Task 6: Revisit the seven existing cases for material observations

**Files:**
- Modify: `references/site-reviews/gpixel.md`
- Modify: `references/site-reviews/szzygh.md`
- Modify: `references/site-reviews/iyungo.md`
- Modify: `references/site-reviews/vision-life.md`
- Modify: `references/site-reviews/funext-protein.md`
- Modify: `references/site-reviews/tomilo.md`
- Modify: `references/site-reviews/yimmet.md`
- Modify: `references/asset-library.md`
- Modify: `assets/library/manifest.json`

- [ ] **Step 1: Read each existing review and revisit the live pages needed to confirm material observations**
- [ ] **Step 2: Record icons, CSS patterns, JavaScript behaviors, image archetypes, upstream dependencies, and license status**
- [ ] **Step 3: Link reusable local artifacts where one generic implementation covers multiple sites**
- [ ] **Step 4: Keep brand-specific graphics, project photos, product renders, fonts, and site source as reference-only**
- [ ] **Step 5: Update the central index with cross-site tags and avoid duplicating files for stylistic variants**

### Task 7: Final verification

**Files:**
- Verify all files above

- [ ] **Step 1: Run asset validator fixtures and repository validation**
- [ ] **Step 2: Validate all eight case files contain the required review and material sections**
- [ ] **Step 3: Validate relative Markdown links and count eight indexed cases**
- [ ] **Step 4: Run `git diff --check`**
- [ ] **Step 5: Run the skill validator**

Run:

```powershell
python -X utf8 C:\Users\Administrator\.codex\skills\.system\skill-creator\scripts\quick_validate.py .
```

Expected: `Skill is valid!`

- [ ] **Step 6: Reset temporary browser viewport overrides and report any unverified pages or licenses**

## Execution Constraints

- Work in the current user-owned worktree because the case library and skill edits are already uncommitted here; preserve all overlapping changes.
- Do not commit, push, pull, reset, clean, or switch branches unless the user explicitly asks.
- Do not use subagents because the active collaboration policy prohibits delegation without an explicit user request.
- Stop any silent validation after three minutes, record the incomplete check, and continue independent work.
