# Cluster Optimization Report

> Generated 2026-07-11. Integrates findings from model fleet analysis (t_df462391), LiteLLM routing analysis (t_f0c44bce), and 3-bullet summary (t_38cf6718).

## Executive Summary

The cluster runs 5 Hermes profiles across 12 models (11 local via LiteLLM + 1 cloud via ollama-cloud). The fleet was pruned from 25 to 11 models on 2026-07-11 (68GB VRAM freed). LiteLLM routes 11 models but only 5 are actively used by profiles — 6 are dead weight. The active LiteLLM config is missing critical routing, failover, and timeout settings that already exist in a synced but inactive config. Five fleet gaps and four overlaps remain after the prune.

---

## 1. Model Fleet Inventory

### Profile → Model Assignments

| Profile | Primary Model | Size | Agentic Score | Latency | Provider | Role |
|---------|---------------|------|:------------:|:-------:|----------|------|
| default | glm-5.2 | — | — | — | ollama-cloud | General tasks (cloud) |
| long-context | ornith-1.0-35b-1m | 35B | 9.00 | 1.6s | LiteLLM :4000 | Heavy lifter, 1M context |
| planner | qwen3.5-27b-reasoning | 27B | 9.00 | 20s | LiteLLM :4000 | Deep reasoning (thinking ON) |
| vision | gemma-3-12b-polaris | 12B | 8.58 | 2.3s | LiteLLM :4000 | Vision + multimodal |
| messaging-bots | lfm2.5-1.2b-instruct | 1.2B | 8.33 | 0.5s | LiteLLM :4000 | Fast chat (TG + Discord) |

### Default Profile Subagent Pool

| Model | Size | Score | Latency | Role |
|-------|------|:-----:|:-------:|------|
| qwen3.5-9b-highiq | 9B | 9.25 | 1.5s | Workhorse subagent (best overall) |
| qwen3.6-27b-mtp | 27B | 9.00 | 2.5s | 27B backup |
| ministral-3-3b | 3B | 8.92 | 1.2s | Scout / parallel |
| qwen35b-fable | 35B | 8.58 | 0.8s | Fast batch worker |
| llama3.3-8b-thinking | 8B | 8.33 | 4.2s | 8B thinking backup |

### Utility Models

| Model | Type | Purpose |
|-------|------|---------|
| lfm2.5-audio-1.5b | Audio (1.5B) | Audio generation |
| text-embedding-nomic-embed-text-v1.5 | Embedding | Vector embeddings |

---

## 2. Fleet Gaps (5)

1. **No dedicated coding model.** The 2026-07-11 prune removed gemma-4-12b-coder (cited as overlap). No model specializes in code generation. General-purpose models handle coding by default but none excel at it. A qwen3-coder or similar would fill this gap.

2. **Vision single point of failure.** gemma-3-12b-polaris is the only vision-capable model. If it fails to load or is busy, vision tasks have no fallback. The pruned gemma-4-12b-agentic/coder were candidates but were removed.

3. **messaging-bots has no fallback.** lfm2.5-1.2b (1.2B, score 8.33) is the only model. For complex user queries on TG/Discord, there's no escalation path to a larger model within the profile.

4. **default profile primary is cloud-dependent.** glm-5.2 via ollama-cloud means the main profile goes down if the cloud API is unavailable. The 5 local subagent models serve only delegation, not as primary fallback.

5. **No embedding model assigned to a profile.** nomic-embed-text-v1.5 is available but not profile-assigned. Memory and graphify users configure it ad-hoc, connecting directly to LM Studio (:8000) and bypassing LiteLLM entirely.

---

## 3. Fleet Overlaps (4)

1. **General-purpose 27B/35B redundancy.** qwen3.6-27b-mtp (27B, score 9.00) and qwen35b-fable (35B, score 8.58) overlap significantly in the default subagent pool — both are large general-purpose models. Could trim to 3 models (9B workhorse, 3B scout, 35B batch) without losing capability.

2. **Reasoning model overlap.** llama3.3-8b-thinking (default, 8B, thinking ON, score 8.33) overlaps with qwen3.5-27b-reasoning (planner, 27B, thinking ON, score 9.00). The 27B is strictly better at reasoning. The 8B thinking backup adds marginal value.

3. **Two 27B Qwens with identical scores.** qwen3.6-27b-mtp (default, thinking OFF, 9.00) and qwen3.5-27b-reasoning (planner, thinking ON, 9.00). Same size, same score — differentiated only by thinking mode. Could consolidate if thinking-off 27B handles planning adequately.

4. **Two 35B models.** ornith-1.0-35b-1m (long-context, 9.00) and qwen35b-fable (default, 8.58). ornith wins on score and context (1M). qwen35b-fable's only advantage is speed (0.8s vs 1.6s) for batch work.

---

## 4. LiteLLM Routing Analysis

### Active Config

Path: `~/Desktop/hermes/hermes-agent/litellm_config.yaml`
Backend: single — `http://192.168.50.101:8000/v1` (LM Studio on Mac)
Models routed: 11 (all single-backend, no failover)

### Model Usage (5 used / 6 unused)

| # | LiteLLM Alias | Size | Used? |
|---|---|---|---|
| 1 | ornith-1-0-35b-1m | 35B | YES — long-context, memory_tencentdb |
| 2 | qwen3-5-27b-claude-4-6-opus-reasoning-distilled | 27B | YES — planner |
| 3 | gemma-3-12b-it-vl-polaris-... | 12B | YES — vision |
| 4 | ministral-3-3b-instruct-2512 | 3B | YES — default subagent pool |
| 5 | lfm2-5-1-2b-instruct | 1.2B | YES — messaging-bots |
| 6 | qwen3-6-27b-claude-opus-deepseek-distilled-imatrix-mtp | 27B | NO — very slow (~2min/prompt), no profile |
| 7 | llama3-3-8b-instruct-thinking-heretic-... | 8B | NO — no profile assigns it |
| 8 | qwen3-5-9b-claude-4-6-highiq-instruct-heretic-uncensored | 9B | NO — benchmarking only |
| 9 | qwen35b-a3b-fable-sft-abliterated | 35B MoE | NO — graphify docs mention but no profile uses |
| 10 | lfm2-5-audio-1-5b | 1.5B | NO — no audio routing via LiteLLM |
| 11 | text-embedding-nomic-embed-text-v1-5 | — | NO — memory/graphify bypass LiteLLM |

### Missing Routing Features in Active Config

- **router_settings** — no routing strategy (simplest-passthrough), no `allowed_fails`, no `num_retries`
- **litellm_settings** — no `drop_params`, no `request_timeout`, no `disable_reasoning`
- **general_settings** — no `master_key`
- **Failover/redundancy** — all 11 models point to the same backend. If LM Studio is down, everything fails.
- **Multi-backend support** — no node4 (192.168.50.104:8091) or localhost:8092 entries

### Synced (Inactive) Config

Path: `~/.hermes/synced/cluster/litellm_config.yaml`

Has everything the active config is missing:
- `router_settings` with `usage-based-routing-v2`
- `litellm_settings` with `drop_params`, `request_timeout`, `disable_reasoning`
- Multi-backend support (3 backends: LM Studio, node4, localhost)
- Failover duplicates for critical models

**Bug in synced config:** The alias `openai-gpt-oss-20b-abliterated-uncensored-neo-imatrix` actually routes to `qwen3.5-9b-claude-4.6-highiq-instruct-heretic-uncensored` — a completely different model. This will cause confusion if activated as-is.

**Naming inconsistency:** Synced config uses dots (`lfm2.5-1.2b-instruct`) while active config uses dashes (`lfm2-5-1-2b-instruct`). LiteLLM normalizes dots→dashes, but this is a maintenance hazard.

---

## 5. Recommendations

### Immediate (config-only, no model changes)

1. **Add router_settings to the active config:**
   ```yaml
   router_settings:
     routing_strategy: usage-based-routing-v2
     allowed_fails: 3
     num_retries: 2
   ```

2. **Add litellm_settings:**
   ```yaml
   litellm_settings:
     drop_params: true
     request_timeout: 120
     disable_reasoning: true
   ```

3. **Remove 6 unused model entries** from the active config (qwen3-6-27b, llama3-3-8b-thinking, qwen3-5-9b, qwen35b-a3b-fable, lfm2-5-audio, text-embedding-nomic). Shrinks from 11 to 5 entries, reducing LM Studio model-load contention.

4. **Add multi-backend failover** — port node4 (192.168.50.104:8091) and localhost:8092 backends from the synced config. Add duplicate entries for critical models (ornith, gemma) with secondary api_base.

### Short-term (config consolidation)

5. **Consolidate the two LiteLLM configs.** The synced config is strictly more capable. Fix the alias bug (rename `openai-gpt-oss-20b-abliterated` to match its actual underlying model), fix the naming inconsistency (use dashes everywhere), then promote it as the active config. Delete the current minimal one.

6. **Promote qwen3.5-9b-highiq to a profile.** It scored 9.25 (2nd best overall, best among sub-30B models at 1.5s latency). Currently wasted — it's in the active LiteLLM config and the default subagent pool but has no profile of its own. Good candidate for a coding/analysis profile.

### Medium-term (fleet changes)

7. **Add a dedicated coding model.** A qwen3-coder or similar would fill the most impactful gap in the fleet.

8. **Add vision backup.** Either re-add a pruned gemma model or add a second vision-capable model to eliminate the single point of failure.

9. **Add messaging-bots escalation path.** Configure a fallback to a larger model (e.g., qwen3.5-9b-highiq at 9.25) for complex TG/Discord queries that exceed lfm2.5-1.2b's capability.

10. **Trim default subagent pool from 5 to 3.** Keep qwen3.5-9b-highiq (workhorse), ministral-3-3b (scout), qwen35b-fable (batch). Remove qwen3.6-27b-mtp (redundant with 35B ornith in long-context) and llama3.3-8b-thinking (redundant with planner's 27B reasoning).

11. **Add a local fallback model for the default profile primary.** If glm-5.2 (cloud) is unavailable, fall back to a local model (e.g., ornith-1.0-35b-1m or qwen3.5-9b-highiq) via LiteLLM failover rather than going down entirely.

---

## 6. Priority Matrix

| Priority | Action | Effort | Impact |
|:--------:|--------|:-----:|:------:|
| P0 | Add router_settings + litellm_settings to active config | Low | High |
| P0 | Remove 6 unused model entries | Low | Medium |
| P1 | Add multi-backend failover | Medium | High |
| P1 | Consolidate configs (fix alias bug, promote synced) | Medium | High |
| P2 | Promote qwen3.5-9b-highiq to a profile | Low | Medium |
| P2 | Trim default subagent pool 5→3 | Low | Low |
| P3 | Add dedicated coding model | High | High |
| P3 | Add vision backup model | Medium | High |
| P3 | Add messaging-bots fallback | Low | Medium |
| P3 | Add local fallback for default primary | Medium | High |

---

## 7. Cluster Architecture Reference

4-node cluster connected via ed25519_jarvis SSH key:

| Node | IP | Host | CPU | GPU | VRAM | RAM |
|------|----|------|-----|-----|------|-----|
| Node1 | 192.168.50.101 | gilbertngai | M4Max | — | — | 128GB |
| Node2 | 192.168.50.102 | gngai | 9950X3D | RTX5090 | 32GB | 96GB |
| Node3 | 192.168.50.103 | user | 7950X3D | RTX4090 | 24GB | 64GB |
| Node4 | 192.168.50.104 | juns6 | 5800X | RTX3090 | 24GB | 128GB |
| **Total** | | | | | **80GB** | **416GB** |

LM Studio runs on Node1 (:8000). LiteLLM proxy on Node1 (:4000, launchd service `ai.hermes.litellm`). LiteLLM replaces dots with dashes in model names (e.g., `ornith-1.0-35b-1m` → `ornith-1-0-35b-1m`). Profile configs must use LiteLLM alias names (dashes), not LM Studio names (dots).

---

*Sources: llm-wiki/model-fleet-index.md, llm-wiki/cluster-rpc-fabric.md, ~/Desktop/hermes/hermes-agent/litellm_config.yaml, ~/.hermes/synced/cluster/litellm_config.yaml*