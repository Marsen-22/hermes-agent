# Session Summary — 2026-07-11 (Early)

## LangGraph MCP Server — Built & Registered

**Problem:** No LangGraph MCP server was configured in Hermes. The `langgraph` plugin existed as a stub (plugin.yaml with aliases) but had no actual server code or config entry.

**Solution:** Built a custom FastMCP server wrapping `langgraph_sdk` that exposes the LangGraph Agent Server API as MCP tools.

### Server file
`~/.hermes/plugins/langgraph/langgraph_mcp_server.py`

### 5 tools exposed
| Tool | Purpose |
|------|---------|
| `check_server` | Health check on the LangGraph API server |
| `list_graphs` | List deployed LangGraph agents/assistants |
| `invoke_agent` | Run a LangGraph agent with input text (creates/resumes threads) |
| `list_threads` | List recent conversation threads |
| `get_thread_state` | Get checkpoint/state of a thread |

### Config
Registered in `~/.hermes/config.yaml` as a stdio MCP server:
```yaml
langgraph:
    command: python3
    args:
    - /Users/gilbertngai/Desktop/hermes/hermes-agent/.hermes/plugins/langgraph/langgraph_mcp_server.py
    env:
      LANGGRAPH_API_URL: http://127.0.0.1:2024
    enabled: true
```

### Verification
- `fastmcp inspect` — server parses cleanly, 5 tools detected
- `hermes mcp test langgraph` — connects in ~550ms, all 5 tools discovered
- Config YAML validated
- Note: `config.yaml` is gitignored (`.hermes/` excluded from version control), so the change is on-disk only

### Dependencies installed
- `fastmcp` (3.4.4)
- `langgraph`, `langgraph-sdk`, `langgraph-checkpoint`
- `httpx`

## hermes-agent-git Merged & Removed

**Problem:** Two copies of the Hermes source existed on disk — `hermes-agent/` (live runtime, git-initialized with 2 custom commits) and `hermes-agent-git/` (full-depth upstream clone, used for desktop app update detection). Duplicate disk usage and confusion about which was canonical.

**Solution:** Merged `hermes-agent-git` into `hermes-agent` by copying the only items unique to `hermes-agent-git`:
- `apps/bootstrap-installer/dist` — Tauri build output
- `apps/bootstrap-installer/src-tauri/gen/` — generated code
- `apps/bootstrap-installer/src-tauri/target/` — Rust build artifacts
- `venv/locales/` — locale files

**Verification:** `diff -rq` confirmed zero remaining differences (excluding gitignored/build/cache dirs). `hermes-agent-git/` was then deleted.

**Result:** Single canonical source tree at `~/Desktop/hermes/hermes-agent/`.

## Agentic Model Benchmark — Full Fleet + Profile Roles

**Problem:** No agentic benchmark existed for the local model fleet. Previous benchmarks only tested standard prompts (reasoning, coding, instruction, fact, summary), not agentic capabilities (tool calling, planning, structured output, complex instruction, reasoning).

**Solution:** Built and ran a unified agentic benchmark across all models in the LM Studio library, then pruned underperformers and assigned models to Hermes profiles by role.

### Benchmark Design

5 categories × 2 prompts, weighted scoring (0-10):
- **Tool calling** (0.25) — JSON function calls, multi-step tool chains
- **Planning** (0.25) — step decomposition, root cause analysis
- **Structured output** (0.25) — valid JSON generation
- **Complex instruction** (0.15) — precise formatting, bash one-liners
- **Reasoning** (0.10) — bat-and-ball, widget problems

Script: `.hermes/scripts/agentic-benchmark-unified.py`
- Stdlib only (urllib, no requests dependency)
- Reads both `content` and `reasoning_content` (for thinking models)
- Sampling: temperature=0.6, top_p=0.95 (per model card recommendation)

### Thinking Model Discovery

Qwen3 thinking models output to `reasoning_content` instead of `content`, causing the benchmark to score empty strings. Fixed by reading both fields.

More importantly: the GGUF chat templates support `enable_thinking: false` via LM Studio's chat template config. Disabling thinking via LM Studio UI dropped latency 16-40x with same or better agentic scores for most models.

| Model | ON score | ON lat | OFF score | OFF lat |
|-------|:------:|:------:|:------:|:------:|
| qwen3.6-27b-mtp | 8.58 | 82s | 9.00 | 2.5s |
| qwen27b-fable-mtp | 9.42 | 33s | 8.58 | 2s |
| ornith-35b-1m | 9.00 | 5.9s | 9.00 | 1.6s |
| ornith-35b-aeon | 8.92 | 12.5s | 9.00 | 1.4s |
| qwen35b-fable | 7.42 | 8.3s | 8.58 | 0.8s |

qwen3.5-27b-reasoning cannot disable thinking (no `enable_thinking` in its template) — stays at 9.00 / 20s. Thinking genuinely helps it on reasoning (7.50 vs 4.17 for all others).

### Final Leaderboard (17 scored)

| # | Model | Agentic | Latency | Role |
|---|-------|:------:|:-------:|------|
| 1 | qwen3.5-9b-highiq | 9.25 | 1.5s | Workhorse subagent |
| 2 | qwen3.5-27b-reasoning | 9.00 | 20s | Deep reasoner |
| 3 | ornith-35b-1m | 9.00 | 1.6s | Long-context heavy lifter |
| 4 | ornith-35b-aeon | 9.00 | 1.4s | (pruned — overlap with 1m) |
| 5 | qwen3.6-27b-mtp | 9.00 | 2.5s | 27B backup |
| 6 | ministral-3-3b | 8.92 | 1.2s | Scout / parallel |
| 7 | qwen3.6-35b-genesis | 8.58 | 1.5s | (pruned — overlap with fable) |
| 8 | qwen35b-fable | 8.58 | 0.8s | Fast batch worker |
| 9 | gemma-3-12b-polaris | 8.58 | 2.3s | Vision profile |
| 10 | openai-gpt-oss-20b | 8.33 | 2.3s | (pruned — ministral beats it) |
| 11 | llama3.3-8b-thinking | 8.33 | 4.2s | 8B thinking backup |
| 12 | lfm2.5-1.2b-instruct | 8.33 | 0.5s | Messaging bots |
| 13 | gemma-4-12b-coder | 8.33 | 4.2s | (pruned earlier) |
| 14 | llama-3.2-3b | 8.33 | 1.3s | (pruned earlier) |
| 15 | lfm2.5-8b-gaston | 8.25 | 1.5s | (pruned earlier) |
| 16 | gemma-4-12b-agentic | 7.92 | 5.5s | (pruned earlier) |
| 17 | qwythos-9b-mythos | 7.75 | 7.6s | (pruned earlier) |

Key findings:
- **Reasoning is the universal weak spot** — only qwen3.5-27b-reasoning scores above 5 (7.50)
- **Tool calling is solved** — 16/17 models score perfect 10.0
- **Best value**: qwen35b-fable at 8.58 / 787ms — fastest model in the fleet
- **Best overall**: qwen3.5-9b-highiq at 9.25 / 1.5s — top score, fast, small

### Model Pruning (~68GB freed)

Removed 4 overlapping models:
- ornith-35b-aeon (keep 1m for 1M context)
- qwen27b-fable-mtp (keep qwen3.6-27b-mtp, scores higher with thinking off)
- openai-gpt-oss-20b (ministral-3b beats it at 1/5 the size)
- qwen3.6-35b-genesis (keep qwen35b-fable, 2x faster)

LiteLLM config updated: 22 → 11 aliases.

### Profile Role Assignment

Created config.yaml for all 4 profiles, routed through LiteLLM proxy (localhost:4000):

| Profile | Model | Role | Reasoning | Max Turns |
|---------|-------|------|:---------:|:--------:|
| long-context | ornith-1.0-35b-1m | Heavy lifter, 1M context | medium | 150 |
| messaging-bots | lfm2.5-1.2b-instruct | Fast chat, low overhead | low | 50 |
| planner | qwen3.5-27b-reasoning | Deep reasoning, planning | high | 200 |
| vision | gemma-3-12b-polaris | Vision + multimodal | medium | 150 |

Default profile stays on glm-5.2 via ollama-cloud.

### Files Touched

| Path | Action |
|------|--------|
| `litellm_config.yaml` | Updated — 22→11 model aliases |
| `~/.hermes/profiles/long-context/config.yaml` | NEW — ornith-35b-1m via LiteLLM |
| `~/.hermes/profiles/messaging-bots/config.yaml` | NEW — lfm2.5-1.2b via LiteLLM |
| `~/.hermes/profiles/planner/config.yaml` | NEW — qwen3.5-27b-reasoning via LiteLLM |
| `~/.hermes/profiles/vision/config.yaml` | NEW — gemma-3-12b-polaris via LiteLLM |
| `.hermes/scripts/agentic-benchmark-unified.py` | Patched — reasoning_content fallback, temp 0.6/top_p 0.95, TIMEOUT 600 |
| `.hermes/scripts/benchmark-27b-mtp.py` | NEW — standalone 27B benchmark (direct to LM Studio) |
| `hermes-output/agentic-benchmark-*.csv` | 9 result files |
| `~/.lmstudio/.internal/.../Qwen3.6-27B-...gguf.json` | Updated — enable_thinking: false |
