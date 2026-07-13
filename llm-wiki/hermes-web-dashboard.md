# Hermes Web Dashboard

## Ports / instances
| Port | Bind | Purpose | Auth |
|------|------|---------|------|
| `9119` | `127.0.0.1` | Local Mac desktop app + browser dashboard | No auth; session token injected |
| `9120` | `0.0.0.0` | node4 / remote access | Basic auth (`jarvis-local` / `bunta`) |

The two binds are required because the June 2026 hardening forces any non-loopback dashboard to have an auth provider. A single bind cannot be both public and local-no-auth.

## Starting the dashboard

Local loopback:
```bash
cd ~/Desktop/hermes/hermes-agent
source venv/bin/activate
HERMES_SERVE_HEADLESS=0 hermes dashboard --skip-build --no-open
```

Public remote:
```bash
HERMES_DASHBOARD_BASIC_AUTH_USERNAME=jarvis-local \
HERMES_DASHBOARD_BASIC_AUTH_PASSWORD=bunta \
HERMES_DASHBOARD_BASIC_AUTH_SECRET=jarvis-cluster-9118-fixed-2026-serve-secret \
hermes dashboard --port 9120 --host 0.0.0.0 --no-open --skip-build
```

If the page shows "Headless backend (hermes serve): web UI disabled", rebuild `web/` and relaunch with `HERMES_SERVE_HEADLESS=0`.

## Plugin SDK contract

Plugins are loaded from `.hermes/plugins/<name>/dashboard/dist/index.js` and run in the dashboard window.

Current SDK surface (`window.__HERMES_PLUGIN_SDK__`):
- `React`, `hooks` — React core
- `components` — `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Badge`, `Button`, etc.
- `fetchJSON(url)` — make authenticated JSON calls to plugin backend
- `authedFetch(url, options)` — like `fetch` but injects session auth
- `api` — Hermes API client
- `utils` — `cn`, `timeAgo`, etc.

**Registration is NOT on the SDK object.** Plugins must call:
```js
window.__HERMES_PLUGINS__.register("plugin-name", PageComponent);
window.__HERMES_PLUGINS__.registerSlot("header-left", StatusBadge);
```

Calling `SDK.registerTab` or `SDK.registerSlot` throws, aborts the IIFE, and leaves the page blank.

## Plugin backend routes

Each dashboard plugin can include `dashboard/plugin_api.py` exposing FastAPI routes under `/api/plugins/<name>/...`. The SPA proxies these through the same session auth.

## Built-in plugin pages

| Plugin | Backend file | Notes |
|--------|--------------|-------|
| `n8n` | `plugin_api.py` | Embeds n8n UI in iframe; workflow list needs valid n8n owner API key |
| `langchain` | `plugin_api.py` | Requires top-level `langchain` package in project venv |
| `langgraph` | `plugin_api.py` + `langgraph_mcp_server.py` | Also an MCP server; needs LangGraph API on `:2024` |
| `graphify` | `plugin_api.py` | Reads `llm-wiki/graphify-out/graph.json` |
| `kanban` | built-in | Kanban board |
| `achievements` | built-in | Achievement system |

## MCP vs dashboard plugins

MCP servers (e.g., `linear`, `n8n-mcp`, `langchain-mcp`) are configured in `config.yaml` under `mcp_servers:`. They appear on the dashboard **MCP** page, not the **Plugins** page, and require their own auth (OAuth for Linear, API key for n8n-mcp).

## Troubleshooting

- **Blank/black plugin page** — rewrite bundle to use `window.__HERMES_PLUGINS__.register`; avoid unsupported `Badge variant` props; check browser console for IIFE errors.
- **Plugin sidebar link missing** — check `dashboard/manifest.json` and that the plugin directory exists under `.hermes/plugins/<name>/dashboard/`.
- **"plugin script did not call register"** — the bundle crashed before `register()`; eval the bundle source in the console to see the exact error.
- **401 on plugin backend** — use `SDK.fetchJSON` or `SDK.authedFetch`; raw `fetch` lacks the dashboard session token.

## Desktop App File Tree Not Loading

- **Symptom:** Right sidebar stays blank or spinning; home-directory workspace causes `ignore()` path error.
- **Fix:** Clear renderer storage and ensure `project-dir.json` points to a sane repo root:
  ```bash
  pkill -f '/Applications/Hermes.app'
  printf '{"dir":"/Users/gilbertngai/Desktop/hermes/hermes-agent"}\n' > ~/Library/Application\ Support/Hermes/project-dir.json
  rm -rf ~/Library/Application\ Support/Hermes/Local\ Storage
  rm -rf ~/Library/Application\ Support/Hermes/Session\ Storage
  rm -rf ~/Library/Application\ Support/Hermes/Partitions
  open -a /Applications/Hermes.app
  ```
- **Windows equivalent:** `%APPDATA%\Hermes\Local Storage`, `Session Storage`, `Partitions`.

## Plugin Reality Check

- The dashboard **Graphify** tab (`/graphify`) is a status page only — binary health, node/edge counts, last-run log. It does **not** render the interactive graph.
- The actual graph visualization is `llm-wiki/graphify-out/graph.html`; open it directly or serve it separately.
