# Hermes Working Environment

## Overview

This is the agent's understanding of its own runtime environment — hardware, services, network topology, tools, and operational conventions. Maintained as a living reference; update when the setup changes.

## Physical Nodes

| Node | SSoT ID | IP | Hostname | CPU | GPU | RAM | OS | User | Role |
|------|---------|----|----------|-----|-----|-----|----|------|------|
| Node1 | P-01 | 192.168.50.101 | Mac | M4 Max | M4 Max (unified) | 128GB | macOS 26.5.1 | gilbertngai | Primary — all core services, LiteLLM, n8n, Telemetry Router |
| Node2 | P-02 | 192.168.50.102 | 9950X3D2 | AMD Ryzen 9 9950X3D 16-Core | RTX 5090 32GB | 96GB | Windows 11 Pro | gngai | iRacing driver POV / Bunta Racing |
| Node3 | P-03 | 192.168.50.103 | 7950X3D | AMD Ryzen 9 7950X3D 16-Core | RTX 4090 24GB | 64GB | Windows 11 Pro | user | AI Cameraman / spec cam / AI spotter |
| Node4 | P-04 | 192.168.50.104 | 5800X | AMD Ryzen 7 5800X 8-Core | RTX 3090 Strix 24GB | 128GB | Windows 11 Pro | juns6 | Bunta Factory + AI Crew Chief — 24/7 dedicated anchor |

**SSH access:** Mac connects to all nodes using `~/.ssh/id_ed25519_jarvis` key. Node4 has SSH config with host aliases (node1/2/3). Node4's bridge key (`id_mac-to-node4-bridge`) is not authorized on node2/3 — use the Mac's jarvis key directly.

**Different usernames across nodes:** Mac = `gilbertngai`, Node2 = `gngai`, Node3 = `user`, Node4 = `juns6`. All Windows nodes are ASUS motherboards, Windows 11 Pro (build 10.0.26200). SSH from Mac: `ssh -i ~/.ssh/id_ed25519_jarvis <user>@<ip>`.

**Network fabric:** MikroTik 25GbE switch (MTU 9000), routing `10.25.0.0/24`. Each GPU node has NIC 1 (internet/updates, 2.5G/10G) + NIC 2 (25GbE swarm fabric).

**Total system RAM:** 128 + 96 + 64 + 128 = 416GB across all nodes.
**VRAM pool (current):** 128GB (Mac unified) + 32GB (node2) + 24GB (node3) + 24GB (node4) = 208GB when all nodes online.

**Node roles (Bunta org hierarchy):**
- **Node1 (Mac):** Hermes orchestrator, LM Studio, LiteLLM, Prediction Engine, API Gateway, n8n, Telemetry Router
- **Node2:** Bunta Racing — iRacing driver POV @ 10320x1440 @ 145fps, live session workload, 100% local during active racing
- **Node3:** AI Cameraman — spectator view, spec cam, AI spotter, sustained decode/context caching, data refinery
- **Node4:** Bunta Factory (3D printer + laser scanner) + AI Crew Chief (iRacing SDK + SimHub SDK) + 24/7 dedicated CaaS anchor. Target: dual RTX 3090 Ti LC for 48GB.

## Network Topology

```
Internet
  │
  ├── Ollama Cloud (ollama.com) ← primary inference (glm-5.2)
  ├── OpenRouter ← MOA reference models
  ├── LM Studio ← Mac:8000 (local GGUF inference, fallback)
  │
  ├── Mac (192.168.50.101)
  │     ├── LM Studio              :8000  local model inference
  │     ├── LiteLLM Proxy          :4000  model routing (launchd: ai.hermes.litellm)
  │     ├── Hermes Gateway         :8642  API server
  │     ├── Hermes Serve (canonical) :9119  single gateway for TUI, dashboard, Mac desktop, Node4
  │     │                            bind `0.0.0.0`, `--lan-no-auth` on trusted LAN
  │     ├── Hermes Dashboard       :9119  web UI (loopback; no-auth on LAN with `--lan-no-auth`)
  │     ├── Hermes Serve (legacy)  :9120  superseded by canonical 9119
  │     ├── TencentDB Memory       :8420  memory provider (Node.js gateway)
  │     ├── n8n                    :5678  workflow automation (Homebrew v2.26.9)
  │     ├── LangGraph API          :2024  LangGraph MCP server
  │     └── ComfyUI                ~/Desktop/comfyui/  image generation
  │
  └── Node4 (192.168.50.104)
        └── Hermes Desktop (MSI-installed, CLI hermes update only)
```

## Inference Stack

### Primary Model
- **Model:** glm-5.2
- **Provider:** ollama-cloud
- **Base URL:** https://ollama.com/v1
- This is the default for the `default` profile. Set in `config.yaml` under `model:`.

### Local Fallback (LM Studio)
- **Endpoint:** http://192.168.50.101:8000/v1
- **API Key:** lm-studio (literal string, not a real key)
- Runs GGUF models on the Mac's M4 Max
- LiteLLM proxy on :4000 wraps LM Studio with alias names (dots → dashes, e.g. `ornith-1.0-35b-1m` → `ornith-1-0-35b-1m`). Profile configs must use LiteLLM alias names.
- LiteLLM is a launchd service (`ai.hermes.litellm`), auto-starts on boot.

### MOA (Mixture of Agents)
- Configured with multiple reference models via ollama-cloud (glm-5.2, kimi-k2.7-code, nemotron-3-ultra, gpt-oss:120b)
- Aggregator: deepseek-v4-flash
- Fanout: per_iteration

### Thinking Models
- Qwen3.x 27B/35B: thinking can be disabled via LM Studio UI if GGUF chat template has `enable_thinking` Jinja var. Drops latency 10-40x. Check with: `python3 -c "import gguf; r=gguf.GGUFReader(path); ..."`

## Memory

- **Provider:** memory_tencentdb (preferred)
- **Backend:** LM Studio (192.168.50.101:8000) for embeddings
- **Four-layer system:** L0 conversation recording → L1 episodic extraction → L2 scene blocks → L3 persona synthesis
- **Tools:** `memory_tencentdb_memory_search` (structured memories), `memory_tencentdb_conversation_search` (raw dialogue)
- Also uses Hermes built-in `memory` tool for compact durable facts (2,200 char budget)

## Cross-Node Sync

- `~/.hermes` lives inside an Obsidian vault (`~/Desktop/hermes/`)
- Obsidian sync propagates config, skills, plugins, profiles across nodes automatically
- Config hot-reload: mtime-based cache in `load_config()` — most settings picked up next turn; model/provider set once in `AIAgent.__init__` needs restart
- Legacy `assemble.sh` / `assemble.ps1` scripts deprecated (were manual rsync-style sync)
- See [hermes-folder-sync.md](hermes-folder-sync.md) for full details

## Plugins (User-Installed, Enabled)

| Plugin | Description | MCP Server? |
|--------|-------------|-------------|
| n8n | Workflow automation dashboard tile + MCP | Yes (n8n-mcp via npx) |
| langgraph | LangGraph MCP server (3 procs, stdio) | Yes (python3, LangGraph API :2024) |
| langchain | LangChain Python library status dashboard | No (dashboard only) |
| memory_tencentdb | Four-layer memory system | Yes (Node.js gateway) |
| hermes-setup-provider | In-app update driver (hermes-setup binary) | No |

### Bundled Plugins (Enabled)
- telegram-platform (gateway adapter)
- web-ddgs (DuckDGo search)
- disk-cleanup (auto temp file cleanup)

### MCP Servers (External)
- **Linear:** https://mcp.linear.app/mcp (OAuth)
- **n8n:** npx n8n-mcp (stdio, N8N_API_URL + N8N_API_KEY env)
- **LangGraph:** python3 langgraph_mcp_server.py (stdio, LANGGRAPH_API_URL env)
## Dashboard

- **Local URL:** http://127.0.0.1:9119 (loopback, no auth; session token injected)
- **Remote URL:** http://192.168.50.101:9120 (basic auth: `jarvis-local` / `bunta`)
- **Theme:** cyberpunk
- **Plugin SDK:** registration is on `window.__HERMES_PLUGINS__`; fetch/React helpers are on `window.__HERMES_PLUGIN_SDK__`
- Dashboard tiles load from `plugins/<name>/dashboard/manifest.json` (separate from `plugin.yaml` loading)
- Plugin API backends in `plugins/<name>/dashboard/plugin_api.py` (FastAPI routers)

### Active dashboard plugins
| Plugin | Route | Backend | Status |
|--------|-------|---------|--------|
| Kanban | `/kanban` | built-in | OK |
| n8n Workflows | `/n8n` | `plugin_api.py` + iframe to `127.0.0.1:5678` | OK (REST list 401 until valid owner API key) |
| LangChain | `/langchain` | `plugin_api.py` | OK after installing `langchain` into project venv |
| LangGraph | `/langgraph` | `plugin_api.py` + `langgraph_mcp_server.py` + LangGraph API `:2024` | OK |
| Graphify | `/graphify` | `plugin_api.py` | OK |
| Achievements | `/achievements` | built-in | OK |

### Dashboard venv rule
All Python dashboard/plugin backend code uses the project venv: `~/Desktop/hermes/hermes-agent/venv/bin/python3`. Node-based MCP servers (`n8n-mcp`, `langchain-mcp`, `linear-mcp`) run via `npx` and do not need their own Python venvs.

## n8n

- **URL:** http://127.0.0.1:9119
- **Auth:** Basic auth, scrypt-hashed password in config.yaml
- **Theme:** cyberpunk
- **Auth env vars:** `HERMES_DASHBOARD_BASIC_AUTH_USERNAME`, `HERMES_DASHBOARD_BASIC_AUTH_PASSWORD`
- Dashboard tiles loaded from `plugins/<name>/dashboard/manifest.json` (separate from plugin.yaml loading)
- Plugin API backends in `plugins/<name>/dashboard/plugin_api.py` (FastAPI routers)

## n8n

- **URL:** http://127.0.0.1:5678
- **Version:** 2.26.9 (Homebrew)
- **Owner:** gngai8@gmail.com
- **Data:** ~/.n8n/database.sqlite (SQLite)
- **API Key:** configured in Hermes config.yaml (n8n MCP env block) and ~/.hermes/.env
- **Known issue:** n8n-mcp SSRF strict mode blocks localhost access. MCP tools can't reach the instance currently.
- **Password reset:** `N8N_USER_FOLDER=~/.n8n n8n user-management:reset` then recreate owner via API or bcrypt hash update in SQLite
- **Dashboard plugin:** `.hermes/plugins/n8n/dashboard/` loads plugin-local `.env`; REST workflow list returns 401 with current key (iframe editor still works)

## LangGraph

- **LangGraph API:** http://127.0.0.1:2024 (in-memory mode via `langgraph dev`)
- **MCP server:** `.hermes/plugins/langgraph/langgraph_mcp_server.py` (raw `mcp.server.Server` stdio implementation)
- **Config entry:** `mcp_servers.langgraph.command` uses project venv Python
- **Dummy graph:** `.hermes/plugins/langgraph/dummy_graph.py`
- **Caveat:** several orphaned `langgraph_mcp_server` processes remain from earlier gateway crashes; cleanup pending

## Linear

- **MCP server:** https://mcp.linear.app/mcp
- **Auth:** OAuth (not yet authorized)
- **Status:** Listed on dashboard MCP page; unusable until OAuth completed or switched to API-key auth

## Skills

- All 102 official Nous Research skills installed in default profile
- Synced to all other profiles (jarvis, long-context, messaging-bots, planner)
- Skills index: see [skills-index.md](skills-index.md)
- llm-wiki serves as second brain: skills, models, prefs, cluster, session summaries

## Key Directories

| Path | Purpose |
|------|---------|
| `~/Desktop/hermes/hermes-agent/` | Hermes source repo + venv |
| `~/Desktop/hermes/hermes-agent/.hermes/` | Active Hermes config (symlinked from ~/.hermes) |
| `~/Desktop/hermes/hermes-agent/llm-wiki/` | Second brain knowledge base |
| `~/Desktop/comfyui/` | ComfyUI image generation (moved from ~/Desktop/hermes/comfyui on 2026-07-10) |
| `~/.n8n/` | n8n data (SQLite, config, logs) |
| `~/.hermes/synced/` | Legacy sync overlays + Obsidian vault backups |
| `~/.hermes/plugins/` | User-installed plugins |
| `~/.hermes/skills/` | Installed skills (32 categories) |

## Gateway Platforms

- **Telegram:** enabled (primary messaging)
- **Discord:** enabled
- **Webhook:** enabled (:8644)
- **API Server:** enabled (:8642, key-based auth)

## Python Environment

- `python3` = 3.14.5 (system)
- `python` = missing (use `python3`)
- `pip` → python3.11 (version mismatch, use `pip3` or `uv`)
- `uv` = installed
- Hermes venv at `~/Desktop/hermes/hermes-agent/venv/`

## Operational Conventions

- **Communication:** Lead with results, not plans. Act, don't describe. No permission asks on low-stakes.
- **Verification:** Everything must be verified end-to-end. Don't claim something works without exercising it.
- **Model fleet:** User knows models intimately — check HuggingFace model cards for correct sampling parameters before benchmarking. Don't use defaults.
- **Model pruning:** Each model must have a distinct role. Aggressive pruning.
- **Config changes:** After `hermes update`, verify `ls ~/.hermes/plugins/*/plugin.yaml` — updates can wipe plugin manifests.
- **llm-wiki:** This is the second brain. Update it when infrastructure changes, new models are added, or significant sessions complete.

---
*Last updated: 2026-07-11*