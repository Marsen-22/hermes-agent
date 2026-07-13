# Session Summary — 2026-07-12

## 1. Desktop App Rebuilt & Reinstalled from `fix/electron-41-upgrade`

**Problem:** The Hermes desktop app (installed `/Applications/Hermes.app`) crashed on launch with `EXC_BREAKPOINT`/`SIGTRAP` in `CrBrowserMain`. `Info.plist` showed v0.17.0, while the CLI/dashboard were already v0.18.2. `hermes update` does not update the Electron `.app`; it only updates CLI/Python packages.

**Solution:** Built the desktop app from the `fix/electron-41-upgrade` branch, which bumps Electron from `40.10.2` to `41.4.0`, and reinstalled it.

### Key details

| Step | Command / Action | Result |
|------|------------------|--------|
| Switch branch | `git checkout fix/electron-41-upgrade` | Electron 41.4.0 in `apps/desktop/package.json` |
| Build | `npm run dist:mac:dmg --workspace=apps/desktop` | DMG created at `apps/desktop/release/Hermes-0.17.0-mac-arm64.dmg` |
| Install | `hdiutil attach`, `cp -R /Volumes/.../Hermes.app /Applications/` | `/Applications/Hermes.app` now uses Electron v41.4.0 |
| Launch | `open -a /Applications/Hermes.app` | App opens a window titled **Hermes** |

### Verification

```
✓ Framework info shows Electron v41.4.0
✓ App window count = 1
✓ CDP reachable on port 9222
```

### Caveats

- `CFBundleShortVersionString` still reads `0.17.0` because the branch didn't bump `package.json` version. The meaningful change is the Electron runtime (40.10.2 → 41.4.0).
- Electron-builder skipped code signing — no Developer ID certificate configured. This can cause Gatekeeper prompts but doesn't block local use.

---

## 2. Dashboard Auth 401 Fixed (Env-Driven Auth Provider)

**Problem:** Dashboard on `127.0.0.1:9119` returned 401 even though `dashboard.basic_auth.enabled` was set to `false` in config. The desktop app and embedded TUI couldn't adopt `__HERMES_SESSION_TOKEN__` from the dashboard HTML.

**Root Cause:** The dashboard auth middleware is fail-closed whenever any auth provider is registered. The three `HERMES_DASHBOARD_BASIC_AUTH_*` env vars in `.hermes/.env` still registered a basic-auth provider, even though `enabled` was false.

**Solution:** Relaunched the dashboard with the three env vars explicitly unset, leaving the project config with `dashboard.basic_auth.enabled: false` and no `username`/`password_hash`.

### Key details

```bash
env -u HERMES_DASHBOARD_BASIC_AUTH_USERNAME \
    -u HERMES_DASHBOARD_BASIC_AUTH_PASSWORD \
    -u HERMES_DASHBOARD_BASIC_AUTH_SECRET \
    hermes dashboard --port 9119 --host 127.0.0.1 --no-open --skip-build
```

### Verification

```
✓ GET http://127.0.0.1:9119/ returns 200
✓ __HERMES_SESSION_TOKEN__ injected into HTML
✓ /api/sessions returns 200 with current session list
```

---

## 3. LiteLLM Context Windows Synced from LM Studio Model Cards

**Problem:** Models routed through LiteLLM were being capped at 64K context (or LiteLLM defaults), not the per-model context lengths configured in LM Studio.

**Root Cause:** LiteLLM does not read LM Studio's model-card `llm.load.contextLength`. It uses `context_window` declared in `litellm_config.yaml` under each model's `litellm_params`. Those were missing.

**Solution:** Read each LM Studio model card from `~/.lmstudio/.internal/user-concrete-model-default-config/`, extracted `llm.load.contextLength`, and added matching `context_window` values to every chat model in `litellm_config.yaml`. Restarted LiteLLM proxy.

### Key details

| Model | Context Window |
|-------|----------------|
| `ornith-1-0-35b-1m` | 1,048,576 |
| `qwen3-5-27b-claude-4-6-opus-reasoning-distilled` | 262,144 |
| `qwen3-6-27b-claude-opus-deepseek-distilled-imatrix-mtp` | 262,144 |
| `qwen3-5-9b-claude-4-6-highiq-instruct-heretic-uncensored` | 262,144 |
| `qwen3-5-9b-deepseek-v4-flash-mtp` | 262,144 |
| `qwen2-5-coder-7b-instruct` | 131,072 |
| `qwen35b-a3b-fable-sft-abliterated` | 262,144 |
| `ministral-3-3b-instruct-2512` | 262,144 |
| `gemma-3-12b-it-vl-polaris...` | 131,072 |
| `lfm2-5-1-2b-instruct` | 128,000 |
| `lfm2-5-audio-1-5b` | 128,000 |
| `text-embedding-nomic-embed-text-v1-5` | 8,192 |

### Verification

```
✓ YAML parses cleanly
✓ /health returns healthy after LiteLLM restart
✓ /models lists all 12 models
```

### Caveat

A real end-to-end 64K+/256K/1M prompt test is still outstanding; verification so far is config-level only.

---

## 4. Right Sidebar "Stuck Loading" / Project Tree Fixed

**Problem:** After the new desktop app launched, the right sidebar project file tree appeared stuck loading.

**Root Cause:** The workspace cwd was persisted as `/Users/gilbertngai` (home directory) in the app's Local Storage. The home dir is a git repo with a `.gitignore` that includes patterns like `.agentcortex/...` and a visible `.ssh/` directory. The file-tree git-ignore filter passed `.ssh/authorized_keys` to the `ignore` library, which threw a strict-mode `RangeError` for an absolute path and left the tree promise hanging.

**Solution:**
1. Created `/Users/gilbertngai/Desktop/hermes/hermes-agent/projects/`.
2. Updated `~/Library/Application Support/Hermes/project-dir.json` to point to the repo root (`/Users/gilbertngai/Desktop/hermes/hermes-agent`).
3. Cleared the app's Local Storage so it re-read the default project dir and dropped the stale `/Users/gilbertngai` workspace.
4. Relaunched the app.

### Verification

```
✓ workspace-cwd = /Users/gilbertngai/Desktop/hermes/hermes-agent
✓ Right sidebar shows HERMES-AGENT root with folders: apps, hermes_cli, llm-wiki, skills, tests, etc.
✓ No loading spinners remain
✓ Only cosmetic asset 404 in console logs
```

### Key file

- `~/Library/Application Support/Hermes/project-dir.json`

---

## Files Changed / State Mutated

| File / Path | Change |
|-------------|--------|
| `/Applications/Hermes.app` | Replaced old v0.17.0/Electron-40 binary with freshly built Electron 41.4.0 binary |
| `litellm_config.yaml` | Added `context_window` to every chat model, synced from LM Studio model cards |
| `~/.hermes/config.yaml` | `dashboard.basic_auth.enabled: false`; removed `username`/`password_hash` |
| `~/Library/Application Support/Hermes/connection.json` | Rewritten to clean local mode, port 9119, no stale remote/auth |
| `~/Library/Application Support/Hermes/project-dir.json` | Set default project dir to repo root |
| `~/Library/Application Support/Hermes/Local Storage` | Cleared to remove stale workspace-cwd and cached state |
| `~/Library/Application Support/Hermes/Session Storage` | Cleared alongside Local Storage |

---

## Related Session

- [session-summary-2026-07-11-late.md](session-summary-2026-07-11-late.md) — dashboard auth, gateway crash, and bot-profile separation work that preceded this session.
