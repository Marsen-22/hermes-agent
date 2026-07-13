# Model Fleet Index

> Local model fleet — last benchmarked 2026-07-12 (v2 with per-model LM Studio config). 11 models via LiteLLM proxy (localhost:4000) → LM Studio (192.168.50.101:8000).

## Chat Models (v2 Benchmark 2026-07-12)

| Model | Size | Agentic | Latency | Role | Profile | Thinking | Sampling |
|-------|------|:-------:|:-------:|------|---------|:--------:|----------|
| **qwen3.5-9b-claude-4.6-highiq** | 9B | **9.58** | 2.9s | Workhorse — code, PRs, debugging | coder | n/a | temp=0.6, top_p=0.95 |
| qwen3.5-9b-deepseek-v4-flash | 9B | 9.42 | 16.2s | Deep reasoning batch jobs | deepseek | ON | temp=0.7, top_p=0.95 |
| qwen3.6-27b-claude-opus-mtp | 27B | 9.00 | 2.8s | Architecture review, evaluation | orchestrator | OFF | temp=0.6, top_p=0.95 |
| ornith-1.0-35b-1m | 35B | 9.00 | 1.0s | Long context, heavy reading | long-context | n/a | **temp=0, top_p=1.0** (deterministic) |
| ministral-3-3b-instruct-2512 | 3B | 8.92 | 1.5s | Quick lookups, triage | scout | n/a | **temp=0.05, top_p=0.95** (Mistral prod) |
| qwen35b-a3b-fable | 35B | 8.58 | 2.7s | Fast research, batch | researcher | n/a | temp=0.6, top_p=0.95 |
| qwen3.5-27b-claude-opus-reasoning | 27B | 8.42 | 23.9s | Decompose, deep reasoning | analyst | n/a | temp=0.6, top_p=0.95 |
| gemma-3-12b-polaris | 12B | 8.33 | 2.0s | Vision + multimodal | vision | n/a | temp=0.6, top_p=0.95 |
| lfm2.5-1.2b-instruct | 1.2B | 7.92 | 0.5s | Telegram/Discord chat | messaging-bots | n/a | **temp=0.3, top_p=0.9** (LiquidAI) |

## Utility Models

| Model | Type | Purpose |
|-------|------|---------|
| lfm2.5-audio-1.5b | Audio | Audio generation |
| text-embedding-nomic-embed-text-v1.5 | Embedding | Vector embeddings |

## Profile Fleet (9 profiles)

| Profile | Model | Provider | Role | Max Turns | Reasoning | Platforms |
|---------|-------|----------|------|:---------:|:---------:|:---------:|
| default | glm-5.2 | ollama-cloud | General + final integration | 150 | medium | none |
| planner | qwen3.5-27b-opus-reasoning | LiteLLM :4000 | Decompose, architecture | 200 | high | none |
| long-context | ornith-1.0-35b-1m | LiteLLM :4000 | Heavy reading, 1M context | 150 | medium | none |
| coder | qwen3.5-9b-highiq | LiteLLM :4000 | Code, PRs, debugging | 100 | medium | none |
| researcher | qwen35b-fable | LiteLLM :4000 | Fast research, batch | 80 | low | none |
| scout | ministral-3-3b | LiteLLM :4000 | Quick lookups, triage | 30 | low | none |
| analyst | qwen3.6-27b-mtp | LiteLLM :4000 | Evaluation, audit | 120 | high | none |
| vision | gemma-3-12b-polaris | LiteLLM :4000 | Image, multimodal | 150 | medium | none |
| messaging-bots | lfm2.5-1.2b-instruct | LiteLLM :4000 | Telegram + Discord | 50 | low | TG + Discord |

## Subagent Routing Guide

| Task Type | Profile | Why |
|-----------|---------|-----|
| General leaf delegations | coder | Best score (9.25), fast (1.5s) |
| High-throughput batch | researcher | Fastest model (787ms) |
| Debugging, architecture | planner | Best reasoning (7.50), thinking ON |
| Quick lookups, triage | scout | Tiny (3B), fast (1.2s), cheapest |
| Heavy reading, large docs | long-context | 1M context, fast (1.6s) |
| Evaluation, audit | analyst | 27B, high reasoning, thorough |
| Vision tasks | vision | Only vision model |
| Messaging chat | messaging-bots | Smallest (1.2B), fastest (458ms) |
| Final integration | default | Cloud-backed, general purpose |

## Kanban Task Assignment Guide

| Task Pattern | Assignee | Notes |
|--------------|----------|-------|
| Decompose a complex goal | planner | Use `--goal` for open-ended |
| Code generation, PRs | coder | Use `--workspace worktree` for git |
| Research, web search | researcher | Fast, batch-friendly |
| Quick file check, triage | scout | Cheapest, use for routing |
| Architecture review | analyst | High reasoning, thorough |
| Read large codebase | long-context | 1M context |
| Image analysis | vision | Only multimodal |
| Summary, quick chat | messaging-bots | Fast, lightweight |
| Final report, integration | default | General purpose |

## Scoring Methodology

5 categories × 2 prompts, weighted:
- Tool calling (0.25) — JSON function calls, multi-step tool chains
- Planning (0.25) — step decomposition, root cause analysis
- Structured output (0.25) — valid JSON generation
- Complex instruction (0.15) — precise formatting, bash one-liners
- Reasoning (0.10) — bat-and-ball, widget problems

Sampling: temperature=0.6, top_p=0.95 (per model card for Qwen3 distill models)

## Thinking Models

Qwen3 GGUF chat templates support `enable_thinking: false` via LM Studio's chat template config. Disabling thinking:
- Drops latency 16-40x
- Same or better agentic scores for most models
- qwen3.5-27b-reasoning cannot disable thinking (no support in template) — but thinking genuinely helps it (reasoning 7.50 vs 4.17 for others)

## Pruned Models (2026-07-12)

| Model | Reason |
|-------|--------|
| czocelot/gemma4-12b-fable5lora-merged | Scored 8.17, redundant with other 12B tier |
| franklynical/gemma-4-12b-agentic-fable5 | Scored 8.17, redundant |
| satgeze/Gemma4-12B-Uncensored-HauhauCS-1M | Scored 8.17, redundant |
| hotdogs/qwen27b-abliterated-Fable-MTP | Scored 9.0, redundant with 27B opus (higher quality) |

**Total disk reclaimed: ~38GB** (3× gemma4 + 1× qwen27b)

## Per-Model Sampling Configuration

**Where:** `~/.lmstudio/.internal/user-concrete-model-default-config/<publisher>/<model>/*.json`

**Format:** Add to `operation.fields`:
```json
{
  "operation": {
    "fields": [
      {"key": "llm.prediction.temperature", "value": 0.6},
      {"key": "llm.prediction.topPSampling", "value": 0.95}
    ]
  }
}
```

**Why per-model (not request-time):** LM Studio reads these at model load time. Request-time params override them, but having them at the model level means:
- LM Studio UI respects the settings
- API requests without explicit params use the model's defaults
- No risk of per-request override forgetting

**To apply changes:** Reload the model in LM Studio (`lms unload --all && lms load <model>`).

## Profile Provider Configuration

Most profiles use `provider: openai` with `base_url: http://localhost:4000/v1` — Hermes aliases "openai" to "openrouter" but the base_url override makes it route to LiteLLM.

**The deepseek profile uses `provider: custom`** instead. This is a leftover from the DeepSeek-V4-Flash llama.cpp experiment (where it pointed directly at the standalone llama.cpp server on :8097). Now that the model is served via LiteLLM, `provider: custom` still works because custom is a valid OpenAI-compatible endpoint class. Both work — leaving as-is.

## DeepSeek-V4-Flash Experiment (2026-07-12) — DEAD END

**Tried:** Loading DeepSeek-V4-Flash Q2_K_XL (~90GB) across 4-node RPC cluster.

**Findings:**
- llama.cpp commit c92e806 supports DeepSeek-V4's Lightning Indexer (chat template kwargs: `enable_thinking`, `reasoning_effort`)
- Model loaded successfully on Mac alone (90GB / 128GB unified)
- **Lightning Indexer tensor copy crashes RPC transport** — cluster split doesn't work
- **384K+ context is required** for the model's value — but 90GB model + 384K KV = 414GB, beyond 128GB Mac
- **Conclusion:** unusable for intended purpose on this hardware

**Reclaimed:** 90GB model files deleted, LiteLLM entry removed.

## Pruned Models (2026-07-11)

| Model | Reason |
|-------|--------|
| ornith-35b-aeon | Overlap with 1m (keep 1M context) |
| qwen27b-fable-mtp | qwen3.6-27b-mtp scores higher with thinking off |
| openai-gpt-oss-20b | ministral-3b beats it at 1/5 the size |
| qwen3.6-35b-genesis | qwen35b-fable 2x faster, same score |
| huihui-deepseek-v4-flash | Failed to load in LM Studio |
| gemma-4-12b-coder | Overlap with gemma-3-12b-polaris |
| gemma-4-12b-agentic | Overlap with gemma-3-12b-polaris |
| lfm2.5-8b-gaston | Overlap with lfm2.5-1.2b |
| llama-3.2-3b | Overlap with ministral-3-3b |
| qwythos-9b-mythos | Only model failing tool calls (5.0) |
| llama3.3-8b-thinking | Removed from LM Studio (2026-07-11 night) |