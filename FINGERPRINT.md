# Hermes Loose-File Fingerprint

Generated: 2026-07-13
Canonical home: `C:\Users\juns6\Desktop\hermes\hermes-agent\`

This manifest records Hermes-related files/folders that were scattered outside
the canonical repo and have been consolidated under `archive-loose/` in this repo.

## Consolidated artifacts

- `C:\Users\juns6\Desktop\hermes\test_local_backend.py` → `archive-loose/scratch-scripts/test_local_backend.py`
- `C:\Users\juns6\run_hermes.ps1` → `archive-loose/scratch-scripts/run_hermes.ps1`
- `C:\Users\juns6\hermes_stderr.txt` → `archive-loose/logs/hermes_stderr.txt`
- `C:\Users\juns6\hermes_stdout.txt` → `archive-loose/logs/hermes_stdout.txt`
- `C:\Users\juns6\Downloads\6-hermes-agent-workflows-prompt-pack.pdf` → `archive-loose/docs/6-hermes-agent-workflows-prompt-pack.pdf`
- `C:\Users\juns6\AppData\Roaming\Hermes.bak.aisandbox` → `archive-loose/desktop-app-backup/Hermes.bak.aisandbox`
- `C:\Users\juns6\Desktop\hermes\hermes-output` → removed (empty)

## Kept in place (not moved)

- `C:\Users\juns6\Desktop\hermes\.obsidian/` — Obsidian vault metadata; belongs at vault root.
- `C:\Users\juns6\AppData\Roaming\Hermes/` — live Electron desktop app data.
- `C:\Users\juns6\AppData\Local\hermes/`, `hermes-updater/`, `com.nousresearch.hermes.setup/` — MSI/desktop installer runtime data.

## Suggested actions for remaining items

| Location | Suggested action |
|----------|------------------|
| `C:\Users\juns6\AppData\Roaming\Hermes.bak.aisandbox` | Archived under `archive-loose/desktop-app-backup/` if present. |
| `C:\Users\juns6\AppData\Local\Programs\Hermes\Hermes.exe` | Verify MSI install path is current; update shortcut/scheduled task if needed. |
| `C:\Users\juns6\Desktop\hermes\.obsidian\plugins\hermes-console` | Keep as part of Obsidian vault. |
| `C:\Users\juns6\Desktop\hermes\comfyui` | Removed (only empty subdirs; ComfyUI is a separate project). |


## Update: 2026-07-13 (vault-root items restored)

The Obsidian vault items (`AGENTS.md`, `CLAUDE.md`, `00 Human/`) were returned to the vault root.
They are no longer in `archive-loose/`.

## Scripts consolidation (2026-07-13)

Loose scripts from `Desktop` and `Downloads` were moved into `scripts/loose/`:

| Source | Count | Destination |
|--------|------:|-------------|
| `Desktop\*.bat` | 1 | `scripts/loose/desktop/bat/` |
| `Desktop\*.ps1` | 9 | `scripts/loose/desktop/ps1/` |
| `Downloads\*.sh` | 11 | `scripts/loose/downloads/sh/` |
| `Downloads\*.ps1` | 19 | `scripts/loose/downloads/ps1/` |
| `Downloads\*.py` | 5 | `scripts/loose/downloads/py/` |
| `Downloads\cuda-installer\*.ps1` | 2 | `scripts/loose/downloads/cuda-installer/` |

Total: 43 scripts consolidated. The empty `Downloads\cuda-installer\` directory was removed.

## Downloads Hermes artifacts (2026-07-13)

Additional Hermes-related files in `Downloads` were consolidated into `archive-loose/downloads/`:

| Source | Destination | Note |
|--------|-------------|------|
| `Downloads\node4-worker-phase1-deploy.tar.gz` | `archive-loose/downloads/` | Original deploy bundle. |
| `Downloads\node4-worker-phase1-deploy-v2.tar.gz` | — | Duplicate of v2 (1); removed. |
| `Downloads\node4-worker-phase1-deploy-v2 (1).tar.gz` | `archive-loose/downloads/` | Kept unique v2 bundle. |
| `Downloads\profiles\node4-worker\` | `archive-loose/downloads/profiles/node4-worker/` | Worker profile config + SOUL. |
| `Downloads\repo_main.tar.gz` | `archive-loose/downloads/` | `hermes-cluster-ssot-main` snapshot (profiles + manifests). |
| `Downloads\n1_id_ed25519.pub` | `archive-loose/downloads/ssh-keys/` | Node1 SSH public key. |
| `Downloads\cuda-installer\` | `archive-loose/downloads/cuda-installer/` | NVIDIA CUDA installer used for node setup. |
| `Downloads\node4-worker-phase1-deploy\` | — | Empty directory; removed. |
| `Downloads\profiles\` | — | Empty after move; removed. |

## User-home Hermes artifacts (2026-07-13)

Hermes-related files scattered under `C:\Users\juns6\` were consolidated into `archive-loose/user-home/`:

| Source | Destination | Note |
|--------|-------------|------|
| `\.ssh\id_ed25519_node4_hermes_ssot` (+ `.pub`) | `archive-loose/user-home/ssh-keys/` | Copied (not moved); originals kept in `.ssh` for active auth. |
| `\.ssh\id_ed25519_jarvis` (+ `.pub`) | `archive-loose/user-home/ssh-keys/` | Copied (not moved); originals kept in `.ssh`. |
| `\.local\bin\node4-worker.cmd` | `archive-loose/user-home/launchers/` | `node4-worker` launcher script. |
| `\.local\bin\node4-worker.bat` | `archive-loose/user-home/launchers/` | `node4-worker` launcher script. |
| `\AppData\Local\Temp\hermes-update-ijosz2n3\hermes-agent-main.zip` | `archive-loose/user-home/update-source/` | Update-source zip (71 MB). |
| `\AppData\Local\Temp\hermes-update-ijosz2n3\hermes-agent-main\` | `archive-loose/user-home/update-source/` | Extracted update source tree. |
| `\AppData\Local\Temp\hermes-mirror-reorg.py` | `archive-loose/user-home/temp-scripts/` | Mac→Windows mirror reorg script. |
| `\AppData\Local\Temp\hermes-verify-mirror.py` | `archive-loose/user-home/temp-scripts/` | Mirror verification script. |
| `\AppData\Local\Temp\hermes-mirror-junctions.py` | `archive-loose/user-home/temp-scripts/` | Junction-based mirror script. |
| `\AppData\Local\Temp\hermes_top.txt` | `archive-loose/user-home/temp-notes/` | Directory listing notes. |
| `\AppData\Local\Temp\Hermes_Import_top.txt` | `archive-loose/user-home/temp-notes/` | Directory listing notes. |
| `\AppData\Local\Temp\Hermes_Canon_top.txt` | `archive-loose/user-home/temp-notes/` | Directory listing notes. |
| `\AppData\Local\Temp\Jarvis_OS_top.txt` | `archive-loose/user-home/temp-notes/` | Directory listing notes. |
| `\AppData\Local\Temp\hermes-restore-backup\` | `archive-loose/user-home/restore-backup/` | Hermes restore snapshot (empty subdirs only). |
| `\Documents\node4-gateway-out.txt` | — | Empty file; removed. |
| `\AppData\Local\Temp\hermes-update-ijosz2n3\` | — | Empty after move; removed. |

Left in place (runtime / temp): `\.local\state\hermes\` (gateway locks), active `hermes_sandbox_*` temp dirs, and `\AppData\Roaming\Hermes\` (live desktop app data).

## Superseded framework: AI Sandbox (2026-07-13)

`C:\Users\juns6\AI Sandbox\` was the previous agent-framework directory. It is now superseded by the canonical Hermes home at `C:\Users\juns6\Desktop\hermes\hermes-agent\`. The directory contains only empty placeholder files and may be removed manually.

Stale launchers that referenced the `AI Sandbox` path were moved to `archive-loose/user-home/launchers/`:

| Source | Note |
|--------|------|
| `\.local\bin\node2-worker.cmd` | Pointed to non-existent `AI Sandbox\.hermes\profiles\node4-worker\...` |
| `\.local\bin\node3-worker.cmd` | Pointed to non-existent `AI Sandbox\.hermes\profiles\node4-worker\...` |

`\.local\bin\node1-remote.bat` was left in place because it just calls the system `hermes` executable.
