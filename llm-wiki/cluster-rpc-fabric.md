# Cluster Topology

> Last updated: 2026-07-11 (all nodes live-probed)

## Nodes

| Node | IP | Hostname | CPU | GPU | VRAM | RAM | OS | User | Status |
|------|-----|----------|-----|-----|------|-----|----|------|--------|
| node1 | 192.168.50.101 | Mac | M4 Max | M4 Max (unified) | 128 GB | 128 GB | macOS 26.5.1 | gilbertngai | ✅ Primary — LM Studio, Hermes, LiteLLM |
| node2 | 192.168.50.102 | 9950X3D2 | AMD Ryzen 9 9950X3D 16-Core | RTX 5090 | 32 GB | 96 GB | Windows 11 Pro | gngai | ✅ Online — iRacing driver POV |
| node3 | 192.168.50.103 | 7950X3D | AMD Ryzen 9 7950X3D 16-Core | RTX 4090 | 24 GB | 64 GB | Windows 11 Pro | user | ✅ Online — AI Cameraman |
| node4 | 192.168.50.104 | 5800X | AMD Ryzen 7 5800X 8-Core | RTX 3090 Strix | 24 GB | 128 GB | Windows 11 Pro | juns6 | ✅ Hermes desktop (MSI) |

**SSH from Mac:** `ssh -i ~/.ssh/id_ed25519_jarvis <user>@<ip>` — works for all nodes.
**All Windows nodes:** ASUS motherboards, Windows 11 Pro (build 10.0.26200).
**Aggregate VRAM:** 128 + 32 + 24 + 24 = 208 GB (all nodes online).
**Total system RAM:** 128 + 96 + 64 + 128 = 416 GB.

**Network fabric:** MikroTik 25GbE switch (MTU 9000), routing `10.25.0.0/24`. Each GPU node has NIC 1 (internet/updates, 2.5G/10G) + NIC 2 (25GbE swarm fabric).

## Services on Mac (node1)

| Service | Port | Status | Purpose |
|---------|------|--------|---------|
| LM Studio | 8000 | ✅ | Local model inference (11 models) |
| LiteLLM Proxy | 4000 | ✅ | Model routing layer |
| Hermes Dashboard / Serve (canonical) | 9119 | ✅ | Single gateway for TUI, dashboard, Mac desktop, and Node4; bind `0.0.0.0`, `--lan-no-auth` |
| Hermes Serve (legacy) | 9120 | ⚠️ | Superseded by canonical 9119; may still be used by old configs |
| TencentDB Memory | 8420 | ✅ | 4-layer memory system |
| n8n | 5678 | ✅ | Workflow automation |
| n8n MCP Bridge | 5679 | ✅ | MCP server for n8n |
| LangGraph MCP | stdio | ✅ | Agent orchestration |
| Linear MCP | stdio | ✅ | Issue tracking |
| llama.cpp RPC | 50052 | ✅ | VRAM pool for dedicated instances — all 4 nodes |

## Services on node4

| Service | Port | Purpose |
|---------|------|---------|
| Hermes Desktop | — | Electron app (MSI-installed) |
| LM Studio | — | Available but not primary inference |

## RPC Connectivity

- All four nodes can reach each other's RPC ports on `:50052`
- rpc-server on node4 confirmed on `0.0.0.0:50052`
- node3's rpc-server shows `127.0.0.1:50052` in netstat but is reachable from LAN
- node2: AMD Ryzen 9 9950X3D, RTX 5090 32GB, 96GB RAM, hostname 9950X3D2

## Usage Modes

- **RPC split**: `llama-server --rpc <node_ip>:50052 --model <model>.gguf` distributes layers across GPUs
- **Independent servers**: Each node runs its own `llama-server` on a unique port, registered in LiteLLM as separate backends
- **Hybrid**: RPC-split biggest models across all GPUs, serve smaller models independently
- **LM Studio (primary)**: Mac runs LM Studio as the main inference backend; LiteLLM proxy routes to it

## Model Weights Location

- Mac: `~/Desktop/ModelWeights/llm/`
- LM Studio config: `~/.lmstudio/`
- Model directory: 11 models, ~228 GB total (after 2026-07-11 pruning freed 68 GB)

## LiteLLM Config

`~/Desktop/hermes/hermes-agent/litellm_config.yaml` — 10 aliases routing to LM Studio at 192.168.50.101:8000

## Hermes Profiles

| Profile | Model | Provider | Role | Platforms |
|---------|-------|---------|------|----------|
| default | glm-5.2 | ollama-cloud | General + final integration | None (dashboard/CLI only) |
| planner | qwen3.5-27b-opus-reasoning | LiteLLM :4000 | Decompose, architecture, deep reasoning | None |
| long-context | ornith-1.0-35b-1m | LiteLLM :4000 | Heavy reading, codebase analysis, 1M context | None |
| coder | qwen3.5-9b-highiq | LiteLLM :4000 | Code generation, PR review, debugging | None |
| researcher | qwen35b-fable | LiteLLM :4000 | Fast research, data gathering, batch | None |
| scout | ministral-3-3b | LiteLLM :4000 | Quick lookups, triage, routing | None |
| analyst | qwen3.6-27b-mtp | LiteLLM :4000 | Architecture review, evaluation, audit | None |
| vision | gemma-3-12b-polaris | LiteLLM :4000 | Image, multimodal | None |
| messaging-bots | lfm2.5-1.2b-instruct | LiteLLM :4000 | Telegram + Discord chat | Telegram + Discord |

## History

- **2026-07-09**: Cluster RPC fabric documented. 19 models in LiteLLM, expanded to 25.
- **2026-07-10**: 5 new models added, native context benchmark run.
- **2026-07-11**: Full agentic benchmark (18 models). Thinking on/off discovery. Pruned 4 models (68GB freed). Profile role assignments created. LiteLLM: 22→11 aliases.
- **2026-07-11 (late)**: Dashboard/desktop/app fixes. Dashboard moved to 127.0.0.1 (no auth for desktop app). Gateway launchd plist fixed (HOME, PYTHONNOUSERSITE). Multiplex profiles enabled — Telegram+Discord moved to messaging-bots profile.
- **2026-07-11 (night)**: Kanban multi-profile automation verified. TUI rebuild fix (lockfile sync). 4 new specialist profiles created (coder, researcher, scout, analyst) with SOUL.md for all 8 non-default profiles. LiteLLM: removed dead llama3.3-8b (11→10), added router_settings + litellm_settings. 9 profiles total.
- **2026-07-11 (late night)**: llama.cpp RPC cluster build. Mac: built llama-server + ggml-rpc-server with RPC+Metal (arm64, commit c92e806). Node4: fresh build with CUDA. Nodes 2+3: copied node4 binaries (no VS Build Tools). All 4 nodes on :50052. 4-node RPC split verified — 208GB pooled VRAM.
- **2026-07-12 (early AM)**: DeepSeek-V4-Flash Q2_K_XL (90GB) loaded on Mac alone (port 8097). 284B params, 13B active, 1M context. Lightning Indexer breaks RPC split (tensor copy crashes) — Mac-only deployment. Thinking modes work: `enable_thinking:false` for direct, `reasoning_effort:"high"/"max"` for thinking. Service-mode rpc-server startup on Windows nodes (scheduled tasks) — survives SSH disconnects.