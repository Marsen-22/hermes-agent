# Session Worklog — 2026-07-12 (fleet optimization)

## Per-Model Sampling Configuration

**What:** Applied model-card-recommended sampling parameters (temperature, top_p) to each model's LM Studio per-model config.

**Why:** The benchmark was using flat `temperature=0.6, top_p=0.95` for all models. The model cards specify different values:
- Qwen3.5/3.6 family: temp=0.6, top_p=0.95 (default)
- qwen3.5-9b-deepseek-flash: temp=0.7-1.0 (creative reasoning)
- ornith-35b-1m: temp=0 (deterministic for needle-in-haystack testing)
- ministral-3b: temp<0.1 (production)
- lfm2-1.2b: temp=0.3 (LiquidAI verified)

**How:** Updated `~/.lmstudio/.internal/user-concrete-model-default-config/<publisher>/<model>/*.json` with `llm.prediction.temperature` and `llm.prediction.topPSampling` keys in `operation.fields`.

**Verification:** Fleet benchmark v2 (per-model config, no request overrides) — results saved to `agentic-benchmark-production-20260712-02*.csv`.

## Fleet Pruning (~38GB reclaimed)

**Removed:**
- 3× gemma4 12b variants (czocelot, franklynical, satgeze) — all scored 8.17
- 1× qwen27b-abliterated-fable-mtp (hotdogs) — scored 9.0 but redundant with 27B opus

**Kept:** 11 models in LiteLLM (9 chat + audio + embedding).

## DeepSeek-V4-Flash Experiment — DEAD END

**What:** Tried loading DeepSeek-V4-Flash Q2_K_XL (~90GB) across the 4-node RPC cluster.

**Findings:**
- llama.cpp commit c92e806 supports DeepSeek-V4's Lightning Indexer
- Model loaded successfully on the Mac alone (90GB / 128GB unified)
- **Lightning Indexer tensor copy crashes the RPC transport** — cluster split doesn't work
- **384K+ context is required** for the model's main value, but 90GB model + 384K KV cache = 414GB, far beyond 128GB Mac
- **Conclusion: unusable for its intended purpose on this hardware**

**Actions:**
- Downloaded model to `~/Desktop/ModelWeights/llm/unsloth/DeepSeek-V4-Flash-GGUF/`
- Verified loading and chat template kwargs (`enable_thinking`, `reasoning_effort`)
- Deleted model files (90GB reclaimed)
- Removed LiteLLM entry

## Benchmark v2 Results (per-model LM Studio config)

| Model | Old | New | Δ |
|-------|:---:|:---:|:---:|
| qwen3.5-9b-claude-heretic | 9.75 | 9.58 | -0.17 |
| qwen3.5-9b-deepseek-flash | 9.42 | 9.42 | 0.00 |
| qwen3.6-27b-opus-deepseek | 9.00 | 9.00 | 0.00 |
| ornith-35b-1m | 9.00 | 9.00 | 0.00 |
| **ministral-3b** | 8.42 | **8.92** | **+0.50** |
| qwen35b-fable | 9.00 | 8.58 | -0.42 |
| qwen3.5-27b-opus-reasoning | 9.58 | 8.42 | -1.16 |
| gemma-3-12b-polaris | 9.00 | 8.33 | -0.67 |
| lfm2-1.2b | 7.92 | 7.92 | 0.00 |

**Key insights:**
- ministral-3b improved with temp=0.05 (less verbose)
- 27B opus-reasoning regressed — instruction-following issue, not sampling
- Most models within ±0.5 — sampling params are secondary to model quality

## Key Files

- `/Users/gilbertngai/Desktop/hermes/hermes-agent/litellm_config.yaml` — 11 models
- `/tmp/bench-production.py` — per-model config benchmark script
- `/tmp/update_lmstudio_sampling.py` — LM Studio config updater
- `~/Desktop/hermes/hermes-output/agentic-benchmark-production-20260712-02*.csv` — v2 results

## Fleet State

- **11 models in LiteLLM, 9 chat**
- **4-node RPC cluster:** all OPEN on :50052 (Mac + 3 Windows)
- **Per-model sampling:** set in LM Studio configs (no request-time overrides)
- **Disk:** 38% (down from 39%, ~38GB reclaimed from pruning)
