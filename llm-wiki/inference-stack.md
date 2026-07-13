# Inference Stack: LiteLLM → LM Studio → llama.cpp RPC

> Consolidated history of the multi-layer inference architecture: how LiteLLM, LM Studio, and llama.cpp RPC cluster were layered for VRAM pooling and load-balancing across 4 nodes.

---

## Architecture Overview

```
Hermes (all profiles)
        │
        ▼
┌──────────────────────────────────────────┐
│  LiteLLM Proxy :4000 (Mac, launchd)      │
│  routing_strategy: usage-based-routing   │
│                                          │
│  Tier 1: Local models → LM Studio :8000  │
│  Tier 2: RPC cluster → llama-server :8095│
│  Tier 3: Cloud fallback → ollama-cloud   │
└──────────────────────────────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐    ┌──────────────────────┐
│ LM Studio :8000  │    │ llama-server :8095   │
│ (Mac, M4 Max)    │    │ (Mac orchestrator)   │
│ 11 GGUF models  │    │  --rpc node2:50052   │
│ JIT loading      │    │  --rpc node3:50052   │
│                  │    │  --rpc node4:50052   │
└─────────────────┘    └──────────────────────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ Node2    │ │ Node3    │ │ Node4    │
              │ RTX 5090 │ │ RTX 4090 │ │ RTX 3090 │
              │ 32GB     │ │ 24GB     │ │ 24GB     │
              │rpc-server│ │rpc-server│ │rpc-server│
              │ :50052   │ │ :50052   │ │ :50052   │
              └──────────┘ └──────────┘ └──────────┘
```

## Layer 1: LM Studio (Mac, :8000)

**Role:** Primary local inference backend. Runs on M4 Max with 128GB unified memory. JIT-loads one model at a time from the GGUF library.

- **Model directory:** `~/Desktop/ModelWeights/llm/`
- **Config:** `~/.lmstudio/`
- **API:** `http://192.168.50.101:8000/v1` (OpenAI-compatible)
- **API key:** `lm-studio` (placeholder, not real auth)
- **Current fleet:** 11 chat models + 2 utility (embedding, audio), ~228GB total
- **Limitation:** One model loaded at a time (JIT). Switching models takes 5-30s depending on size.

## Layer 2: LiteLLM Proxy (Mac, :4000)

**Role:** Model routing layer. Sits in front of LM Studio and llama-server, presenting a unified OpenAI-compatible API to all Hermes profiles.

- **Config:** `~/Desktop/hermes/hermes-agent/litellm_config.yaml`
- **Launchd service:** `ai.hermes.litellm` (auto-starts on boot)
- **Current aliases:** 11 (was 22, pruned after agentic benchmark)
- **Routing strategy:** `usage-based-routing-v2` (round-robin with failover)

### Model Name Translation

LiteLLM replaces dots with dashes in `model_name` (the alias). The `model` field under `litellm_params` keeps the original LM Studio ID with dots.

| LM Studio ID | LiteLLM Alias |
|---|---|
| `ornith-1.0-35b-1m` | `ornith-1-0-35b-1m` |
| `qwen3.5-27b-claude-4.6-opus-reasoning-distilled` | `qwen3-5-27b-claude-4-6-opus-reasoning-distilled` |

**Pitfall:** Profile configs must use LiteLLM alias names (dashes), not LM Studio names (dots). This caused "model not found" errors when first setting up profile routing.

### Config Generation

Auto-generate LiteLLM config from LM Studio's model list:

```bash
curl -s http://192.168.50.101:8000/v1/models | python3 -c "
import json, sys
d = json.load(sys.stdin)
models = [m['id'] for m in d['data']]
lines = ['model_list:']
for m in models:
    safe = m.replace('.', '-').replace('_', '-')
    lines.append(f'  - model_name: {safe}')
    lines.append(f'    litellm_params:')
    lines.append(f'      model: openai/{m}')
    lines.append(f'      api_base: http://192.168.50.101:8000/v1')
    lines.append(f'      api_key: lm-studio')
print('\n'.join(lines))
"
```

### LiteLLM Pitfalls

- **No hot-reload** — config changes require killing and restarting the process
- **Port conflicts** — check `lsof -i :4000` before starting
- **Model name translation** — dots → dashes in aliases
- **API key placeholder** — LM Studio doesn't require auth but LiteLLM needs a non-empty `api_key`

## Layer 3: llama.cpp RPC Cluster

**Role:** VRAM pooling for models too large for a single GPU. Distributes model layers across all 4 nodes.

### How It Works

The orchestrator (Mac) runs `llama-server` with `--rpc` flags pointing at each Windows node's `rpc-server.exe`. Model layers are split: some run on the Mac's M4 Max, others are offloaded to remote GPUs via RPC.

```
llama-server \
  --model /path/to/model.gguf \
  --port 8095 \
  --rpc 192.168.50.102:50052 \
  --rpc 192.168.50.103:50052 \
  --rpc 192.168.50.104:50052
```

Each Windows node runs:
```
rpc-server.exe --host 0.0.0.0 --port 50052 --device CUDA0
```

### RPC Cluster Topology

| Node | IP | GPU | VRAM | RPC Server | User |
|------|-----|-----|------|------------|------|
| Mac (node1) | 192.168.50.101 | M4 Max | 128GB | llama-server :8092+ (orchestrator) | gilbertngai |
| node2 | 192.168.50.102 | RTX 5090 | 32GB | rpc-server :50052 | gngai |
| node3 | 192.168.50.103 | RTX 4090 | 24GB | rpc-server :50052 | user |
| node4 | 192.168.50.104 | RTX 3090 | 24GB | rpc-server :50052 | juns6 |

**Aggregate VRAM pool:** 128 + 32 + 24 + 24 = 208GB

### Build Requirements

- **Mac:** `cmake -B build -DGGML_METAL=ON -DGGML_CUDA=OFF -DCMAKE_BUILD_TYPE=Release`
- **Windows:** `cmake -B build -DGGML_RPC=ON -DGGML_CUDA=ON -DCMAKE_BUILD_TYPE=Release` (full CUDA build, 5-10+ min)
- Both `llama-server` and `rpc-server` must be from the **same llama.cpp version** — version mismatch causes "Remote RPC server crashed or returned malformed response"

### Windows Firewall

```powershell
New-NetFirewallRule -DisplayName "llama-rpc-server" -Direction Inbound `
  -Protocol TCP -LocalPort 50052 -Action Allow -Profile Any
```

### RPC Performance Numbers

| Model | Mode | Tok/s | Notes |
|-------|------|-------|-------|
| Ornith 35B (13.6GB) | RPC cluster | 13.6 | Good throughput |
| Qwen Genesis 35B | RPC cluster | 11.0 | Usable |
| GPT-OSS 20B | RPC cluster | — | Registered in LiteLLM |
| DeepSeek V4 Flash 284B (81GB) | Mac only | 11.1 | RPC failed (version mismatch) |
| DeepSeek V4 Flash 284B | RPC with node4 | 4.5 | RPC overhead significant for 284B |

### LiteLLM RPC Aliases

Three RPC cluster backends were registered in LiteLLM:
- `openai-gpt-oss-20b-rpc-cluster`
- `qwen3.6-35b-genesis-rpc-cluster`
- `ornith-1.0-35b-rpc-cluster`

These pointed to `llama-server` on :8095 instead of LM Studio :8000.

### RPC Pitfalls

- **Version mismatch is fatal** — all nodes must run the same llama.cpp build. DeepSeek V4 (`deepseek4` architecture) required commit `8c146a836`. Old Windows rpc-servers couldn't handle new architectures.
- **RPC overhead for huge models** — DeepSeek V4 Flash (284B) got 4.5 tok/s via RPC vs 11.1 tok/s Mac-only. For models that fit on the Mac alone, RPC can be slower.
- **node3 binding issue** — rpc-server showed `127.0.0.1:50052` in netstat but was still reachable from LAN. Cosmetic issue, not functional.
- **Windows build time** — full CUDA build of llama.cpp on Windows takes 5-10+ minutes. `cmake --build build --target rpc-server` alone failed with MSBuild project errors; full `cmake --build build --config Release` is required.
- **node2/3 need rebuilds** — their rpc-servers are from June 26 / July 3 builds, too old for DeepSeek V4. Need rebuilding from current llama.cpp source.

## Layer 4: ollama-cloud (Primary for default profile)

**Role:** Cloud inference for the default Hermes profile. Bypasses the entire local stack.

- **Model:** glm-5.2
- **Provider:** ollama-cloud
- **Base URL:** `https://ollama.com/v1`
- **API key:** stored in `~/.hermes/.env` as `OLLAMA_API_KEY`
- **Available models:** 33+ including glm-5.2, deepseek-v4-pro, kimi-k2.7-code, nemotron-3-ultra, gpt-oss:120b, minimax-m3, gemini-3-flash-preview

## Hermes Profile Routing

| Profile | Model | Provider | Layer |
|---------|-------|---------|-------|
| default | glm-5.2 | ollama-cloud | Cloud |
| long-context | ornith-1.0-35b-1m | LiteLLM :4000 | LM Studio |
| messaging-bots | lfm2.5-1.2b-instruct | LiteLLM :4000 | LM Studio |
| planner | qwen3.5-27b-reasoning | LiteLLM :4000 | LM Studio |
| vision | gemma-3-12b-polaris | LiteLLM :4000 | LM Studio |

## Load-Balanced Architecture (earlier design, 2026-07-03)

An earlier design used LiteLLM's `usage-based-routing-v2` to load-balance the same model across multiple backends:

```yaml
# Tier 1: gemma-4-12b — primary on node4 llama.cpp, fallback on Mac LM Studio
- model_name: gemma-4-12b-it-uncensored
  litellm_params:
    model: openai/gemma-4-12b-it-uncensored
    api_base: http://192.168.50.104:8092/v1  # node4 llama-server
- model_name: gemma-4-12b-it-uncensored
  litellm_params:
    model: openai/gemma-4-12b-it-uncensored
    api_base: http://127.0.0.1:8000/v1      # Mac LM Studio (fallback)

router_settings:
  routing_strategy: usage-based-routing-v2
  allowed_fails: 3
  num_retries: 2
```

This design was superseded by the simpler single-backend approach (all via LM Studio) after the model pruning on 2026-07-11 reduced the fleet to 11 models.

## Timeline

- **2026-07-03:** LiteLLM load-balanced architecture designed. Multi-backend routing with node4 llama.cpp + Mac LM Studio fallback.
- **2026-07-08:** LiteLLM proxy expanded from 19 to 25 aliases. Full fleet benchmark (19 models). Agentic benchmark script created.
- **2026-07-09:** RPC cluster fabric documented. llama.cpp rebuilt with DeepSeek V4 support. RPC aliases added to LiteLLM. DeepSeek V4 Flash (284B) loaded — 11.1 tok/s on Mac alone, 4.5 tok/s via RPC (overhead too high).
- **2026-07-10:** 5 new models added. Native context benchmark. state.db corruption fixed. Hermes update wiped plugin.yaml files.
- **2026-07-11:** Full agentic benchmark (17 models). Thinking on/off discovery. Model pruning (22→11 aliases, 68GB freed). Profile role assignments. Cluster node specs live-probed.

## Current State (2026-07-11)

- LiteLLM :4000 → 11 aliases, all routing to LM Studio :8000
- LM Studio :8000 → 11 chat models + 2 utility, JIT loading, M4 Max
- llama.cpp RPC cluster → available but RPC aliases removed from active LiteLLM config (pruned)
- node2/3 rpc-servers need rebuilding (too old for new architectures)
- node4 rpc-server rebuilt with GGML_RPC=ON + CUDA (July 10 build)
- ollama-cloud (glm-5.2) is primary for default profile
- Local models via LiteLLM used by long-context, messaging-bots, planner, vision profiles

## What Worked

1. **LiteLLM as a unified API gateway** — single endpoint for all profiles, transparent model switching
2. **LM Studio as primary local backend** — M4 Max 128GB handles most models well, JIT loading is convenient
3. **ollama-cloud for primary inference** — glm-5.2 is high quality, no local resource cost, instant availability
4. **Profile-based model routing** — each profile gets the right model for its task

## What Didn't Work (Yet)

1. **RPC VRAM pooling for huge models** — DeepSeek V4 Flash (284B) via RPC was 2.5x slower than Mac-only. RPC overhead negates the VRAM benefit for models that fit on the Mac.
2. **Multi-backend load-balancing** — the earlier design was over-engineered for the workload. Single backend (LM Studio) is simpler and sufficient after pruning.
3. **Cross-architecture RPC** — version mismatch between Mac and Windows builds caused failures. All nodes need synchronized rebuilds.
4. **node2/3 rpc-servers stale** — not yet rebuilt from current llama.cpp source

## Key Files

| File | Purpose |
|------|---------|
| `~/Desktop/hermes/hermes-agent/litellm_config.yaml` | Active LiteLLM config (11 aliases) |
| `~/.hermes/.env` | OLLAMA_API_KEY for ollama-cloud |
| `~/.lmstudio/` | LM Studio config and model registry |
| `~/Desktop/ModelWeights/llm/` | GGUF model files (~228GB) |
| `~/Desktop/hermes/hermes-agent/bin/llama/` | llama.cpp binaries (Mac build) |
| `~/.hermes/skills/devops/llama-cpp-rpc-cluster/` | RPC cluster setup skill |
| `llm-wiki/model-fleet-index.md` | Model benchmark scores and roles |
| `llm-wiki/cluster-rpc-fabric.md` | Current cluster topology |

---
*Last updated: 2026-07-11*