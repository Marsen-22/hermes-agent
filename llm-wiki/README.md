# Hermes Second Brain

> llm-wiki is the persistent knowledge base for Hermes Agent — not just a session log, but a living index of everything the agent knows: skills, models, infrastructure, and decisions.

## Structure

| Document | Purpose |
|----------|---------|
| [user-preferences.md](user-preferences.md) | How Gilbert wants Hermes to operate — communication style, decisions, quality standards |
| [skills-index.md](skills-index.md) | All 186 skills across 32 categories with descriptions, platforms, and tags |
| [model-fleet-index.md](model-fleet-index.md) | Local model fleet — agentic benchmark scores, roles, routing guide |
| [cluster-rpc-fabric.md](cluster-rpc-fabric.md) | Multi-node llama.cpp RPC cluster setup |
| [hermes-ssot.md](hermes-ssot.md) | Multi-node SSOT conventions — how worklog/llm-wiki are shared across nodes |
| [hermes-web-dashboard.md](hermes-web-dashboard.md) | Dashboard setup and troubleshooting |
| [hermes-desktop-update-troubleshooting.md](hermes-desktop-update-troubleshooting.md) | Desktop app update issues |
| [hermes-folder-sync.md](hermes-folder-sync.md) | Cross-node Hermes folder sync via Obsidian, config hot-reload behavior |
| [working-environment.md](working-environment.md) | Full runtime environment — hardware, services, network, tools, conventions |
| [pitfalls-and-lessons.md](pitfalls-and-lessons.md) | 14 issues encountered since June 2026 — root causes, fixes, recurring patterns |
| [inference-stack.md](inference-stack.md) | LiteLLM → LM Studio → llama.cpp RPC fabric, VRAM pooling, profile routing |
| [comfyui.md](comfyui.md) | Local ComfyUI image/video generation stack, models, workflows, commands |
| [frontier-skills.md](frontier-skills.md) | Frontier model discipline distillation + integration rules |
| [frontier-skills.md](frontier-skills.md) | 15 frontier model discipline captures → 7 invariant clusters → 3-layer logic circuit for subagent routing |
| [session-summary-2026-07-09.md](session-summary-2026-07-09.md) | Session log — model fleet benchmarking, LiteLLM expansion |
| [session-summary-2026-07-10.md](session-summary-2026-07-10.md) | Session log — 5 new models, native context benchmark |
| [session-summary-2026-07-11.md](session-summary-2026-07-11.md) | Session log — agentic benchmark, thinking on/off, model pruning, profile roles |

## How to Use This Knowledge Base

### For the agent
- **Before starting a task**: check `skills-index.md` to see if a skill exists for the task type
- **When delegating**: check `model-fleet-index.md` for the right model for the task
- **When troubleshooting**: check session summaries for past solutions to similar problems
- **When someone asks "what can you do?"**: the skills index is the answer

### For the user
- **Adding new skills**: run `hermes skills install` then regenerate the index
- **Adding new models**: benchmark with `.hermes/scripts/agentic-benchmark-unified.py`, then update `model-fleet-index.md`
- **Session summaries**: auto-generated at end of significant sessions, stored as `session-summary-YYYY-MM-DD.md`

## Regenerating the Skills Index

```python
# Run from the hermes-agent directory
python3 -c "
import yaml
from pathlib import Path
from collections import defaultdict

skills_root = Path.home() / '.hermes' / 'skills'
categories = defaultdict(list)
for skill_md in sorted(skills_root.rglob('SKILL.md')):
    rel = skill_md.relative_to(skills_root)
    cat = rel.parts[0]
    text = skill_md.read_text()
    fm = {}
    if text.startswith('---'):
        end = text.find('---', 3)
        if end > 0:
            fm = yaml.safe_load(text[3:end]) or {}
    categories[cat].append({
        'name': fm.get('name', skill_md.parent.name),
        'desc': fm.get('description', '')[:80],
        'path': str(rel),
        'platforms': fm.get('platforms', []),
    })
# ... write to llm-wiki/skills-index.md
"
```

## Infrastructure Quick Reference

| Service | Endpoint | Purpose |
|---------|----------|---------|
| LM Studio | http://192.168.50.101:8000 | Local model inference |
| LiteLLM Proxy | http://localhost:4000 | Model routing layer |
| Hermes Gateway | http://localhost:8642 | API server |
| Hermes Dashboard / Serve (canonical) | http://192.168.50.101:9119 | Single shared gateway for TUI, dashboard, desktop, and Node4; bind `0.0.0.0:9119`, `--lan-no-auth` on trusted LAN |
| Hermes Dashboard (legacy local) | http://127.0.0.1:9119 | Loopback-only dashboard when no `--lan-no-auth` |
| Hermes Dashboard (legacy remote/node4) | http://192.168.50.101:9120 | Old remote desktop port; superseded by canonical 9119 |
| TencentDB Memory | http://localhost:8420 | Memory provider |
| n8n | http://localhost:5678 | Workflow automation |
| n8n MCP Bridge | http://localhost:5679 | MCP server for n8n |

**Note on ports 9119 vs 9120**
- `127.0.0.1:9119` is the local Mac dashboard. Because it is loopback-only, the auth gate stays off and the desktop app can adopt the injected `__HERMES_SESSION_TOKEN__`.
- `0.0.0.0:9120` is the remote-facing Mac dashboard for node4. A non-loopback bind engages the auth gate; the basic-auth provider is registered via `HERMES_DASHBOARD_BASIC_AUTH_*` env vars. The node4 Hermes app connects in Remote mode and signs in with those credentials; session cookies then persist in the Electron OAuth partition.
- The Hermes desktop app's `connection.json` keeps `"mode": "local"` as default while preserving the saved `"remote"` block for switching to the Mac gateway.

**Node4 remote `connection.json` snippet**
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

**See also**
- `llm-wiki/session-summary-2026-07-11-late.md` — original dashboard/gateway split and bot-profile separation.
- `worklog/2026-07-12.md` — node4 remote connection restoration details.

