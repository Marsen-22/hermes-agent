# Hermes Pitfalls & Lessons Learned

> A running log of issues encountered since starting with Hermes Agent (June 2026). Each entry includes the symptom, root cause, and fix. Update when new pitfalls are encountered.

---

## 1. LM Studio MLX Backend Broken (2026-06-22)

**Symptom:** Models like `openai/gpt-oss-20b` and `nousresearch/hermes-4-70b` fail to load with `libpython3.11.dylib` not found or "Trying to load an unsigned library" errors.

**Root Cause:** LM Studio's MLX backend has a broken cross-vendor library chain on macOS — ad-hoc signature + hardened runtime + missing signed `libpython3.11.dylib`. The llama.cpp backend works fine; only MLX-backed models are affected.

**Fix:** Update LM Studio (auto-update re-downloads the missing `_amphibian/cpython3.11-mac-arm64@10/` bundle correctly signed). Until then, only use llama.cpp/GGUF models. Hermes-4-70B-MLX is unusable on this setup.

**Lesson:** Always test each model with a real `curl` round-trip before wiring it as default — LM Studio's `/v1/models` list includes models that can't actually load.

---

## 2. Hermes Config Path Mismatch (2026-06-22 onward)

**Symptom:** `hermes config set` writes to one config file, but the running daemon reads a different one. Changes appear to apply but don't take effect.

**Root Cause:** Multiple config locations existed: `~/.hermes/config.yaml` (runtime), `~/Desktop/Hermes Canon/` (workspace), and installer default paths. `HERMES_HOME` env var and the installer's `_get_platform_default_hermes_home()` can resolve to different paths. The CLI's "wrote to" message names a file but doesn't confirm which one the running daemon reads.

**Fix:** Always verify `hermes config path` matches `HERMES_HOME` before `hermes config set`. If they disagree, edit the live file directly. This cost ~3 weeks of config-mismatch errors.

**Lesson:** Verify the config path before trusting any `config set` command. Print `hermes config path` and compare to `$HERMES_HOME`.

---

## 3. TencentDB Memory Plugin Not Wired (2026-06-24)

**Symptom:** TencentDB memory plugin process is running (port 8420, health OK), but Hermes can't use it — memory provider set to `scope-recall` instead of `memory-tencentdb`.

**Root Cause:** Plugin was running but never installed under `~/.hermes/plugins/` and not added to `plugins.enabled` in config.yaml. The gateway returned 401 because the API key wasn't configured in Hermes.

**Fix:** Copy plugin from `synced/profiles/default/plugins/memory_tencentdb/` to `~/.hermes/plugins/`, add to `plugins.enabled`, set env vars (`MEMORY_TENCENTDB_LLM_API_KEY`, `MEMORY_TENCENTDB_LLM_BASE_URL`, `MEMORY_TENCENTDB_LLM_MODEL`).

**Lesson:** A running service ≠ a wired plugin. Check both the process AND the Hermes config entry.

---

## 4. LiteLLM Model Name Dots→Dashes (2026-07-09)

**Symptom:** Models work directly against LM Studio but fail through LiteLLM proxy with "model not found."

**Root Cause:** LiteLLM replaces dots with dashes in model names (e.g., `ornith-1.0-35b-1m` → `ornith-1-0-35b-1m`). Profile configs using LM Studio names (dots) don't match LiteLLM aliases (dashes).

**Fix:** Profile configs must use LiteLLM alias names (dashes), not LM Studio names (dots). Check `litellm_config.yaml` for the correct alias.

**Lesson:** When routing through LiteLLM, always use the alias name, not the upstream name.

---

## 5. state.db Corruption (2026-07-10)

**Symptom:** Dashboard sessions page returns 500 errors. `state.db` (171MB) corrupted — SQLite `PRAGMA integrity_check` shows page errors, `btreeInitPage()` failures, "database disk image is malformed."

**Root Cause:** Likely from a crash during write or the hermes update process.

**Fix:** SQLite `.recover` on the pre-update snapshot to extract 186,277 lines of SQL, rebuild clean database. Recovered 140 sessions, 16,066 messages.

**Lesson:** Pre-update snapshots are critical. Always keep `~/.hermes/state-snapshots/` intact. SQLite `.recover` is the recovery tool of choice.

---

## 6. Hermes Update Wipes plugin.yaml Files (2026-07-10, 2026-07-11)

**Symptom:** After `hermes update`, plugins (langgraph, langchain) stop loading. Dashboard tiles still appear but the plugin loader silently skips them.

**Root Cause:** `hermes update` rebuilds `~/.hermes/plugins/` but doesn't recreate top-level `plugin.yaml` files. Dashboard tiles load from `dashboard/manifest.json` separately (in `web_server.py`), so they still appear — masking the real problem. The plugin loader (`plugins.py` line 1545) skips any directory without `plugin.yaml`.

**Fix:** After any `hermes update`: `ls ~/.hermes/plugins/*/plugin.yaml`. Restore missing files from `~/.hermes/synced/profiles/default/plugins/`.

**Lesson:** Dashboard tiles showing up ≠ plugins being loaded. Verify `hermes plugins list` shows the plugin as `enabled` after updates.

---

## 7. Pre-Update Snapshot Config Version Mismatch (2026-07-10)

**Symptom:** Recovering config from a pre-update snapshot produces a config that doesn't work with the current Hermes version.

**Root Cause:** Snapshot config may be from a different Hermes version (e.g., pre-v0.18 with LiteLLM) than the version that was running at crash time (v0.18). Naively restoring the snapshot config loses newer config structure.

**Fix:** Always merge — take model/provider from the last v0.18 backup, then layer rich settings (plugins, MCP, MOA, custom providers) from the snapshot. Procedure documented in hermes-agent skill: `references/pre-update-snapshot-recovery.md`.

**Lesson:** Snapshots are not drop-in restores. Merge, don't replace.

---

## 8. Desktop App "Not a Git Checkout" Error (2026-07-10)

**Symptom:** Desktop app update fails with "not a git checkout" even though the source repo exists.

**Root Cause:** `resolveUpdateRoot()` in `apps/desktop/electron/main.cjs` looks for the repo at `~/.hermes/hermes-agent`. If the actual repo is at `~/Desktop/hermes/hermes-agent`, no `.git` is found at the expected path.

**Fix:** Symlink: `ln -s ~/Desktop/hermes/hermes-agent ~/.hermes/hermes-agent`

**Lesson:** The desktop app hardcodes `~/.hermes/hermes-agent` as the expected repo path. Symlink if your repo lives elsewhere.

---

## 9. Desktop App Build Fails — npm Workspace DevDeps (2026-07-10)

**Symptom:** `hermes desktop --build-only` fails because `tsc` (TypeScript) is not on PATH. `apps/desktop/node_modules/` only contains `@nous-research` with no `.bin/` directory.

**Root Cause:** npm workspace `devDependencies` (including `typescript`) declared in `apps/desktop/package.json` are not materialized by `npm ci`. The lockfile records them but `npm ci` doesn't install them. Pre-existing npm workspace resolution issue.

**Fix:** Build manually from `apps/desktop/` where root `node_modules` has devDeps installed. Or run `npm install` (not `npm ci`) in the workspace root.

**Lesson:** `npm ci` in workspaces may skip devDeps. Use `npm install` for desktop builds.

---

## 10. Thinking Models Output to reasoning_content (2026-07-11)

**Symptom:** Qwen3 thinking models score 0 in benchmarks — benchmark script reads `content` field but thinking models put their answer in `reasoning_content`.

**Root Cause:** GGUF chat templates for Qwen3.x output chain-of-thought to `reasoning_content` and the final answer to `content`, but sometimes `content` is empty.

**Fix:** Benchmark scripts must read both `content` and `reasoning_content`. Additionally, disabling thinking via `enable_thinking: false` in the LM Studio chat template config drops latency 10-40x with same or better agentic scores.

**Lesson:** Always check the model card for output format. Thinking models need special handling in any code that parses API responses.

---

## 11. n8n MCP SSRF Strict Mode Blocks Localhost (2026-07-11)

**Symptom:** n8n MCP health check fails with "SSRF protection: Localhost access is blocked in strict mode."

**Root Cause:** n8n-mcp has SSRF protection that blocks localhost/loopback URLs in strict mode, even though n8n is legitimately running locally.

**Fix:** Need to configure n8n-mcp to allow localhost, or bind n8n to a non-loopback address. (Not yet resolved.)

**Lesson:** MCP servers with SSRF protection may block legitimate localhost services. Check the server's SSRF config options.

---

## 12. n8n Password Reset (2026-07-11)

**Symptom:** Can't log into n8n web UI — password forgotten.

**Root Cause:** n8n stores passwords as bcrypt hashes in SQLite (`~/.n8n/database.sqlite`). No CLI command to set a specific password.

**Fix:** `N8N_USER_FOLDER=~/.n8n n8n user-management:reset` resets to initial setup state. If owner already exists, generate bcrypt hash with Python and update directly: `sqlite3 ~/.n8n/database.sqlite "UPDATE user SET password='$HASH' WHERE email='...';"`

**Lesson:** n8n password resets require direct SQLite manipulation. No user-friendly CLI for password changes.

---

## 13. Gateway Stale Python Path (2026-07-10)

**Symptom:** Gateway (Telegram/Discord) not connecting after update.

**Root Cause:** Launchd service `ai.hermes.gateway` had a stale Python path pointing to the old venv location.

**Fix:** Restart gateway directly with current venv path, or update the launchd plist.

**Lesson:** After updates that change venv paths, check launchd service paths. `launchctl list | grep hermes` to verify, then restart.

---

## 14. ComfyUI Path Move (2026-07-10)

**Symptom:** ComfyUI scripts/plugins reference old path `~/Desktop/hermes/comfyui/` but it was moved.

**Root Cause:** ComfyUI was moved to `~/Desktop/comfyui/` but references in configs/scripts weren't all updated.

**Fix:** Update all references. New canonical path: `~/Desktop/comfyui/`.

**Lesson:** When moving directories that are referenced by config, grep for the old path across all config files and update.

---

## 15. Dashboard Plugin SDK Mismatch — `SDK.registerTab` / `SDK.registerSlot` is dead (2026-07-13)

**Symptom:** Dashboard sidebar shows plugin links (n8n, LangChain, LangGraph, Graphify) but the main content area is blank/black. Browser console shows plugin registered, yet the page never renders; loader may log "The plugin's script did not call register(), or the script errored."

**Root Cause:** Old plugin bundles call `SDK.registerTab(...)` or `SDK.registerSlot(...)`, where `SDK = window.__HERMES_PLUGIN_SDK__`. The current dashboard SDK exposes `register` and `registerSlot` only on `window.__HERMES_PLUGINS__`, not on the SDK object. Calling the nonexistent method throws inside the plugin IIFE, aborting execution before it can call the real `register()`. The plugin loader then sees no registered component.

**Fix:** Rewrite plugin bundles to call:
```js
window.__HERMES_PLUGINS__.register("plugin-name", PageComponent);
window.__HERMES_PLUGINS__.registerSlot("header-left", StatusBadge);
```
Use SDK helpers from `window.__HERMES_PLUGIN_SDK__` only for React/components/fetch (`fetchJSON`, `authedFetch`), not for registration. Also avoid passing unsupported props like `variant="success"` to `Badge`; use plain styling instead.

**Lesson:** Plugin registration API lives on `window.__HERMES_PLUGINS__`, not on `window.__HERMES_PLUGIN_SDK__`. If a plugin script fails silently, manually `eval()` the bundle in the console to see the exact TypeError.

---

## 16. LangChain Plugin Reports 0 Installs (2026-07-13)

**Symptom:** LangChain dashboard plugin shows "Total installs: 0" and "NO INSTALLS" despite `langchain-core` being present.

**Root Cause:** The plugin probes each candidate venv by running `python -c "import langchain"`. The project venv had `langchain-core` and `langgraph` installed, but not the top-level `langchain` package, so the probe failed.

**Fix:** Install the top-level package into the project venv:
```bash
/Users/gilbertngai/Desktop/hermes/hermes-agent/venv/bin/pip install langchain
```

**Lesson:** `langchain-core` ≠ `langchain`. The user-facing package is `langchain`; always have it in the venv that plugin backends use.

---

## 17. Hermes Dashboard Starts Headless (2026-07-13)

**Symptom:** `http://127.0.0.1:9119/` returns "Headless backend (hermes serve): web UI disabled" instead of the dashboard SPA.

**Root Cause:** The dashboard subcommand branches on `_headless_backend`. When launched under conditions that set headless mode, it does not serve `web_dist/` and only exposes API routes.

**Fix:** Rebuild the web bundle and relaunch with headless mode explicitly disabled:
```bash
cd /Users/gilbertngai/Desktop/hermes/hermes-agent/web
npm run build
HERMES_SERVE_HEADLESS=0 hermes dashboard --skip-build --no-open
```

**Lesson:** If the dashboard serves text instead of the SPA, check for `HERMES_SERVE_HEADLESS` or a competing `hermes serve` process. Rebuilding `web/` and relaunching with the flag cleared restores the UI.

---

## 18. Hermes Dashboard Split: 9119 Loopback vs 9120 Public Remote (2026-07-12)

**Symptom:** node4 Hermes desktop app can use its own local gateway, but restoring the remote connection to the Mac gateway fails with "Remote Hermes gateway uses OAuth, but you are not signed in."

**Root Cause:** A single Mac dashboard cannot be both loopback/no-auth (so the local Mac desktop app can adopt `__HERMES_SESSION_TOKEN__`) and public/no-auth (post-June-2026 hardening, public binds always engage the auth gate). The prior working setup used two separate dashboard binds:
- `127.0.0.1:9119` — local Mac app, auth gate off, token injected.
- `0.0.0.0:9120` — node4 remote access, auth gate on, basic-auth provider registered.

**Fix:**
1. Run a loopback dashboard for the local Mac app with auth env vars unset:
   ```bash
   env -u HERMES_DASHBOARD_BASIC_AUTH_USERNAME \
       -u HERMES_DASHBOARD_BASIC_AUTH_PASSWORD \
       -u HERMES_DASHBOARD_BASIC_AUTH_SECRET \
       hermes dashboard --port 9119 --host 127.0.0.1 --no-open --skip-build
   ```
2. Run a separate public-facing dashboard for node4 with basic-auth env vars set:
   ```bash
   HERMES_DASHBOARD_BASIC_AUTH_USERNAME=jarvis-local \
   HERMES_DASHBOARD_BASIC_AUTH_PASSWORD=bunta \
   HERMES_DASHBOARD_BASIC_AUTH_SECRET=jarvis-cluster-9118-fixed-2026-serve-secret \
   hermes dashboard --port 9120 --host 0.0.0.0 --no-open --skip-build
   ```
3. On node4, keep `connection.json` in default `local` mode but preserve the saved remote block:
   ```json
   {
     "mode": "local",
     "remote": {
       "url": "http://192.168.50.101:9120",
       "authMode": "oauth",
       "token": null
     },
     "profiles": {}
   }
   ```
4. When switching to Remote on node4, sign in with the Mac dashboard's basic-auth credentials; session cookies persist in the Electron partition afterward.

**Lesson:** After the June 2026 hardening, a non-loopback Hermes dashboard must have an auth provider. For a mixed local+remote desktop setup, run two dashboard instances on different ports/envs rather than trying to make one bind serve both use cases.

---


## Recurring Patterns

1. **Updates are destructive** — `hermes update` can wipe plugin manifests, corrupt state.db, change venv paths, and does not update the Electron `.app`. Always snapshot before updating and verify after.
2. **Running ≠ wired** — A service can be running (process alive, port open) but not configured in Hermes. Always check both the process AND the config entry.
3. **Config path ambiguity** — Multiple config locations cause silent failures. Always verify which config file the running daemon reads.
4. **Dashboard masks plugin issues** — Dashboard tiles load from `manifest.json` separately from plugin loading via `plugin.yaml`. Tiles appearing ≠ plugins working.
5. **Model names differ across layers** — LM Studio uses dots, LiteLLM uses dashes, ollama-cloud uses different names entirely. Always use the correct name for the layer you're configuring.
6. **Electron/desktop state is sticky** — Local Storage and `project-dir.json` can hold stale workspace/auth state across reinstalls. Clear them when the desktop app behaves oddly.
7. **Public dashboard = auth gate** — Any non-loopback dashboard bind now requires a registered auth provider. Plan for two binds (loopback local + public remote) or use an SSH tunnel to keep the public bind at 127.0.0.1.

---
*Last updated: 2026-07-12*
