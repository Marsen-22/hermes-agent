# Hermes Home Canonization Plan

Generated: 2026-07-13
Canonical framework home: `C:\Users\juns6\Desktop\hermes\hermes-agent\.hermes` (node4)
Primary reference home: `/Users/gilbertngai/Desktop/hermes/hermes-agent/.hermes` (node1 / Mac)

## Principle

- `node1` (Mac) is the primary Hermes runtime and the source of the Obsidian-synced vault.
- `node4` (Windows) should mirror `node1`'s SSOT (`repo/` and `synced/`).
- Runtime state (`state.db`, per-profile state DBs, gateway locks, logs) is node-local and must not be blindly overwritten.
- Corrupt/stale backups are not part of the live framework; they should be evacuated to `Hermes-Archive/`.

## Current state comparison

| Item | node1 (Mac) | node4 (Windows) | Assessment |
|------|-------------|-----------------|------------|
| `state.db` | 400 MB, WAL 1.3 MB (active) | 323 MB, WAL empty | node4 may have unflushed/stale state |
| Runtime profiles | 8: analyst, coder, long-context, messaging-bots, orchestrator, researcher, scout, vision | 8 same | OK, but not in SSOT |
| `repo/profiles` | 9: builder, coder, default, friday, jarvis, messaging-bots, orchestrator, researcher, trainer | 12 (above + mac-gateway, researcher.bak, trainer.bak from import) | node4 repo has extra archived profiles |
| `synced/profiles` | 9 same as repo | 9 only | node4 `synced` missing the archived profiles |
| `repo` vs `synced` divergence | **0 differences** | **20 differences** | node4 must resync to node1 |
| `synced/nodes` | mac + node4 with full trees | mac + node4 | mostly match; node4 has node4-specific profiles |
| `repo/skills` | 27 categories | 28 (includes `.hub` imported) | close; runtime has 33 categories total |
| `runtime/skills` | 33 categories | 33 categories | extra categories not yet in SSOT |
| Corrupt/backup `state.db.*` files | ~1.4 GB in `.hermes/` root | ~1.4 GB in `.hermes/` root | must evacuate on both nodes |
| `state-snapshots/` | 340 MB | 1.1 MB | node1 has a huge snapshot to archive |
| `logs/` | 27 MB | 17 MB | archive old logs |

## 20 divergences on node4 (repo vs synced)

- `box-identity` only in synced
- `nodes/mac/` only in synced
- `nodes/node4/active_profile`, `.env`, `auth.json` only in synced
- `profiles/mac-gateway` only in repo
- `profiles/researcher.bak.20260701-203734` only in repo
- `profiles/trainer.bak.20260701-203735` only in repo
- `profiles/default/mcp-installs/` and `lsp/` only in repo
- `skills/.hub` only in repo
- `config.yaml` differs in every profile (builder, coder, default, friday, jarvis, messaging-bots, orchestrator, researcher, trainer)

## Proposed phases

### Phase 0 — Safety pause & backup (do first)

1. Stop any running Hermes agent/gateway processes on node4.
2. Copy `state.db`, `state.db-shm`, `state.db-wal` to `Hermes-Archive/node4-state-backup-20260713/`.
3. Do the same on node1 to `~/Hermes-Archive/mac-state-backup-20260713/`.

### Phase 1 — Evacuate corrupt/stale backups on both nodes (safe)

Move all of these out of `.hermes/` root to `Hermes-Archive/corruption-backups-<node>/`:
- `state.db.corrupted`
- `state.db.malformed-backup-*`
- `state.db.bak`, `state.db.bak3`, `state.db.bak4` (+ shm/wal)
- `config.yaml.corrupted-after-upgrade`
- Old `config.yaml.bak.*` (keep the 2–3 most recent)

Expected space freed: **~1.4 GB per node**.

### Phase 2 — Archive state-snapshots & old logs (safe)

- Move `.hermes/state-snapshots/` to `Hermes-Archive/state-snapshots/` (340 MB on node1).
- Compress and move logs older than 7 days from `.hermes/logs/` to `Hermes-Archive/logs/`.

### Phase 3 — Reconcile node4 SSOT against node1 (critical)

Since node1 `repo/` == `synced/` exactly, copy node1's:
- `.hermes/repo/` → node4 `.hermes/repo/`
- `.hermes/synced/` → node4 `.hermes/synced/`

This will overwrite the 20 divergences on node4 and make it match the primary.

Preserve node4-only additions first:
- `repo/profiles/mac-gateway/` → move to `Hermes-Archive/profiles/mac-gateway/`
- `repo/profiles/researcher.bak.*/` → move to `Hermes-Archive/profiles/`
- `repo/profiles/trainer.bak.*/` → move to `Hermes-Archive/profiles/`
- `repo/skills/.hub/` → keep? node1 runtime also has `.hub`, but not in repo. Promote to repo instead.

### Phase 4 — Promote runtime-only profiles to SSOT on both nodes

Copy from `.hermes/profiles/` into `.hermes/repo/profiles/` and `.hermes/synced/profiles/`:
- `analyst/`
- `long-context/`
- `scout/`
- `vision/`

These exist only as runtime profiles and should be part of the canonical SSOT.

### Phase 5 — Promote runtime-only skill categories to SSOT on both nodes

The following skill categories exist in `.hermes/skills/` but not in `repo/skills/` or `synced/skills/`:
- `.hub`
- `blockchain`
- `communication`
- `evaluation`
- `finance`
- `gaming`
- `health`
- `mcp`
- `migration`
- `payments`
- `security`
- `tencentdb-databaseclaw-skill`
- `web-development`
- `worklog`

Copy these into `.hermes/repo/skills/` and `.hermes/synced/skills/`.

### Phase 6 — Verify and document

1. Re-run `diff -r` or filecmp between `.hermes/repo/` and `.hermes/synced/` on both nodes; expect 0 differences.
2. Re-run profile/skill inventory; expect runtime categories to be reflected in SSOT.
3. Update `FINGERPRINT.md` and this `CANONIZE_PLAN.md` with executed actions.
4. Update `SOUL.md` or vault `AGENTS.md` if needed to reflect the canonical home layout.

## Open questions

1. Should node4 runtime profiles (`analyst`, `long-context`, `scout`, `vision`) also be copied into node1 `repo/synced`? Yes per Phase 4.
2. Should `.hub` skill remain in runtime only, or be promoted to SSOT? Promote per Phase 5.
3. Should the huge `node/` directory (188 MB) and `bin/` (68 MB) and `lsp/` (107 MB) be treated as runtime caches or archived? They appear to be node-local installations; leave them unless they are duplicated.

## Recommended first action

Start with **Phase 1** (evacuate corrupt backups) on node4. It is safe, frees ~1.4 GB, and removes dangerous stale DBs from the live home.
