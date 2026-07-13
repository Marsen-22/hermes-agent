# Session Summary — 2026-07-13

**Nodes:** node1 (Mac) + node4 (Windows)

## node1 (Mac)

1. Restarted the Hermes dashboard backend on `127.0.0.1:9119` (it was down).
2. Opened the dashboard in a new Chrome tab; confirmed it loads and injects session token.
3. Verified Graphify dashboard plugin is **status-only** (healthy, 70 nodes, 0 edges); the actual visualization still lives at `llm-wiki/graphify-out/graph.html`.
4. Diagnosed the Hermes desktop app right-sidebar file tree as stuck due to stale renderer storage.
5. Cleared `Local Storage`, `Session Storage`, and `Partitions` under `~/Library/Application Support/Hermes`.
6. Confirmed `project-dir.json` points to `/Users/gilbertngai/Desktop/hermes/hermes-agent`.
7. Relaunched the desktop app successfully.
8. Committed all local modifications + personal workflow directories (`llm-wiki/`, `worklog/`) to personal fork `Marsen-22/hermes-agent` on `main`:
   - Commit: `b7a700bcd2` — "personal: llm-wiki, worklog, local patches, and dashboard/desktop fixes"
   - Follow-up: `fe9b787e65` — "docs: note fork commit in worklog and session summary"
   - Push succeeded; working tree is clean.

## node4 (Windows)

- Consolidated loose Hermes artifacts into the canonical framework home on node4.
- Archived corrupt/stale `state.db.*` and old config backups to `Hermes-Archive/`.
- Archived `state-snapshots/` and moved CUDA installer outside the Obsidian vault.
- Replaced node4 `.hermes/repo/` and `.hermes/synced/` with clean copies from node1 Mac.
- Promoted runtime-only profiles (`analyst`, `long-context`, `scout`, `vision`) and 14 skill categories into SSOT.
- Removed node-local `lsp/`, `mcp-installs/`, `state.db*`, caches, etc. from SSOT profiles.
- Verified `.hermes/repo/` and `.hermes/synced/` now differ only in cluster metadata (`nodes/`, `box-identity`).
- Artifacts: `worklog/2026-07-13.md`, `FINGERPRINT.md`, `CANONIZE_PLAN.md`.

## Knowledge Base Updates
- Added `worklog/2026-07-13.md`.
- Added `llm-wiki/session-summary-2026-07-13.md`.
- Added Desktop File Tree and Plugin Reality Check sections to `llm-wiki/hermes-web-dashboard.md`.
- Added `llm-wiki/hermes-ssot.md` documenting multi-node SSOT conventions.

## Repo Commit
- Committed all local modifications and personal workflow directories (`llm-wiki/`, `worklog/`) to personal fork `Marsen-22/hermes-agent`.
- Commit: `b7a700bcd2` — "personal: llm-wiki, worklog, local patches, and dashboard/desktop fixes"
- Follow-up: `fe9b787e65` — "docs: note fork commit in worklog and session summary"
- Push succeeded; working tree is clean.
