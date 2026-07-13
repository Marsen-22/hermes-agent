# Hermes Folder Sync Architecture

## Overview

The `~/.hermes` directory on each node is synced across machines via **Obsidian sync**. The Hermes folder lives inside an Obsidian vault, so config, skills, plugins, and profile changes made on one node propagate automatically to all other nodes.

## Nodes

| Node | OS | Hermes Path | Notes |
|------|-----|-------------|-------|
| Mac (node1) | macOS (M4 Max 128GB) | `~/Desktop/hermes/hermes-agent/.hermes` | Primary. LM Studio :8000, LiteLLM :4000, Dashboard :9119, Serve :9120 |
| Node4 | Windows (5800X, RTX 3090) | `C:\Users\juns6\Desktop\hermes\hermes-agent\.hermes` | Hermes Desktop MSI-installed. CLI `hermes update` only. |

## What Syncs

- `config.yaml` — model/provider settings, MOA, plugins, MCP servers, platforms
- `skills/` — all installed skills
- `plugins/` — plugin.yaml manifests, dashboard tiles, plugin_api.py
- `profiles/` — per-profile configs (jarvis, default, messaging-bots, etc.)
- `.env` — API keys and secrets (node-specific overlays apply after sync)
- `auth.json` — platform credentials

## Config Hot-Reload Behavior

Hermes uses an mtime-based config cache (`load_config()` in `hermes_cli/config.py`). Every call `stat()`s `config.yaml` — if mtime or size changed (which Obsidian sync triggers on write), it re-reads and re-parses the YAML.

| Change type | Picked up live (same session)? |
|---|---|
| MOA config, fallback chains, display settings, tool configs | ✅ Yes — next turn |
| Model name, provider, base_url, API key | ❌ No — set once in `AIAgent.__init__`, needs restart |
| New sessions after sync | ✅ Yes — fresh `AIAgent` reads updated config |

**Practical flow:** Change config on Mac → Obsidian syncs to node4 → new sessions on node4 use updated model/provider. Ongoing conversations keep their original model until restart.

## Legacy Sync Scripts (Deprecated)

The `synced/scripts/assemble.sh` (Mac) and `assemble.ps1` (node4) scripts were the previous manual sync mechanism. They copied from `repo/` + `nodes/<node>/` overlays into the runtime `.hermes` directory. With Obsidian sync now handling propagation, these are no longer needed for routine config updates but remain as fallback.

## Known Issues

- **Hermes updates can wipe `plugin.yaml`**: The `hermes update` command rebuilds `~/.hermes/plugins/` but may not recreate top-level `plugin.yaml` files. Dashboard tiles still appear (loaded from `dashboard/manifest.json` separately) but the plugin loader silently skips plugins without `plugin.yaml`. After any update: `ls ~/.hermes/plugins/*/plugin.yaml` and restore from `synced/profiles/default/plugins/` if missing.
- **Obsidian sync may have latency**: Changes propagate on Obsidian's sync schedule, not instantly. For immediate updates, trigger a manual Obsidian sync.

## Setup Details

- Obsidian vault root: `~/Desktop/hermes/` (contains both `hermes-agent/` and the `.hermes` config tree)
- The `~/.hermes` symlink points into the vault, making it visible to Obsidian
- Node4's vault is at `C:\Users\juns6\Desktop\hermes\` with the same structure

---
*Last updated: 2026-07-11*