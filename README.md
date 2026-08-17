# Website Production Standards

This repository is the source of truth for the `website-production-standards` Codex Skill.

## Install locally

Run once from the repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-codex-skill.ps1
```

The script creates a directory junction at `%USERPROFILE%\.codex\skills\website-production-standards`. Later edits to this repository are immediately visible to Codex without copying files. Reload the Skill in an already-open session after changing its instructions.
