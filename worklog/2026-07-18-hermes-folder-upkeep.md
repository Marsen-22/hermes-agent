# 2026-07-18: Hermes Folder Upkeep (daily / follow-on)

Follow-on to `2026-07-17-hermes-folder-upkeep.md` and canonical consolidation.

## Scan summary

| Area | Status |
|------|--------|
| Repo root | Healthy product tree; large entry modules (`cli.py`, `run_agent.py`, etc.) expected |
| `.hermes/` | Runtime home; `repo/` is fleet SSoT; no `canonical/` or `synced/` |
| `archive-loose/` | Benchmarks + analysis already organized; still holds backups |
| Source content dups | Only benign empty `__init__.py` and platform plugin stubs; no conflicting skill/plugin copies outside vendor trees |
| Vendor dups | Heavy hash collisions inside `apps/*/node_modules` — ignore |

## Changes made

### Cleaned / consolidated
- **Root `graphify-out/`** — merged 3 unique semantic cache JSON files into `llm-wiki/graphify-out/cache/semantic/`, removed root tree (canonical graphify path is now only under `llm-wiki/`)
- **Empty `archive-loose/logs/`** — removed
- **Empty `scripts/loose/**`** — placeholder empty dirs (`temp-scripts`, `scratch`, `launchers`, `node4-ops`, `downloads/{py,sh,ps1}`) removed entirely

### AGENTS.md generated (missing from prior pass)
- `scripts/AGENTS.md`
- `cron/AGENTS.md` (in-repo scheduler code; runtime jobs still documented under `.hermes/cron/`)
- `skills/AGENTS.md`
- `optional-skills/AGENTS.md`
- `docs/AGENTS.md`
- `apps/AGENTS.md`
- `providers/AGENTS.md`
- `tui_gateway/AGENTS.md`
- `acp_adapter/AGENTS.md`

Prior pass already covered: `tools/`, `plugins/`, `gateway/`, `agent/`, `hermes_cli/`, `.hermes/scripts/`, `.hermes/cron/`.

### Self-update
- Updated `~/.hermes/scripts/hermes-folder-upkeep-prompt.md` with known layout, deferred items, and SILENT guidance for no-op runs

## Not changed (reported)

1. **`archive-loose/user-home/update-source/hermes-agent-main/`** (~9.7MB, nested partial tree / empty plugin dirs) — looks like an old update snapshot; **recommend delete after human confirm**
2. **`archive-loose/desktop-app-backup/Hermes.bak.aisandbox`** — retain until app backup policy decided
3. **Root `hermes-already-has-routines.md`** — tracked marketing post; optional move to `docs/` or website content tree
4. **`.hermes/state.db.corrupted` (~164MB, Jul 10)** — recovery artifact; confirm before delete (frees disk)
5. **`.hermes/profiles/**/*.bak*`** — all ≤14 days; kept per policy
6. **`llm-wiki/graphify-out/*.bak`** — age 10 days; kept
7. **`.hermes/state-snapshots/20260716-*`** — age 2 days; kept
8. **`datagen-config-examples/`** — still fine at root (small)
9. **Empty dirs under app `release/` / Tauri `target/`** — build artifacts; left alone
10. **No `.bak` files older than 14 days** found this run

## Duplicate / conflict assessment

- No action-needed content-hash conflicts among first-party Python/MD sources
- Platform plugins share identical empty-ish `__init__.py` stubs by design
- Skill/plugin resource trees look non-duplicative at the content level (excluding optional vs bundled category mirrors by name, which are intentional)

## Suggested next human actions

1. Confirm deletion of `archive-loose/user-home/update-source/` if no longer needed for restore
2. Confirm deletion of `.hermes/state.db.corrupted` (164MB)
3. Decide home for `hermes-already-has-routines.md` (docs vs website vs keep root)

## Verification

- Key dirs present; graphify only under `llm-wiki/`
- New AGENTS.md files written and non-empty
- No user data (worklogs, sessions, config, state.db live) deleted
- Cron prompt updated for next runs

---

# Pass 2 (cron ~02:00, same day)

## Delta vs pass 1

- Structure still healthy; no root `graphify-out/`; no empty `__pycache__` to remove
- Content-hash dups (6.5k files, exclude vendor/archive dump): only benign pairs (LaTeX skill templates, `nous-girl.jpg` shared assets, docker s6 type stubs, eslint/vite stubs)
- No `.bak` files older than 14 days

## Changes made

### AGENTS.md added (ops + UI surfaces missing after pass 1)
- `llm-wiki/AGENTS.md`
- `worklog/AGENTS.md`
- `archive-loose/AGENTS.md`
- `website/AGENTS.md`
- `web/AGENTS.md`
- `ui-tui/AGENTS.md`

### Self-update
- Cron prompt list of AGENTS.md coverage expanded; disk-pressure note for profile `skills.bak.20260715` (~423MB total, age ~3d — keep until >14d)

## Still deferred (report only)

1. `archive-loose/user-home/update-source/` (~9.7MB) — human confirm delete
2. `.hermes/state.db.corrupted` (~164MB, Jul 10) — human confirm delete
3. Root `hermes-already-has-routines.md` — optional move to `docs/` or website
4. `.hermes/profiles/*/skills.bak.20260715` (~423MB) — **not yet >14 days**; largest reclaim when eligible
5. Runtime empty dirs (caches, profile pairing/sessions placeholders, postgres volume stubs) — intentional, leave

## Not deleted

- User data, live state.db, worklogs, configs, profile bak trees under 14 days
