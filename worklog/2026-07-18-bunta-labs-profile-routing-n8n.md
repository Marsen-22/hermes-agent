# 2026-07-18 — Bunta Labs ranking + profile routing + n8n→Hermes

## Problem

1. Optimization work was being treated as “one positive signal → done” instead of multi-layer exhaustion (engine → behavior → role → system).
2. n8n AI agent work confused **Bunta** (user brand / holdings tracks) with agent identity.
3. Need verified path: model land → classify/route suggest → **human review only**, delivery via **Hermes** not raw Telegram API when possible.

## Solution

### A. Optimization methodology (skill)

- Saved/refined skill: `bunta-labs-optimization` (`mlops/`)
- Concept: four layers — engine params, behavior/kernel, role assignment, system throughput
- Ranking ends in **suggestions for human review**, never silent reconfiguration
- Applies to any target (models, Hermes app), not just one bench

### B. Fleet / routing facts (this session)

| Profile | Model | Role |
|---|---|---|
| **orchestrator** (smart-routing **default**) | `qwen35b-agent-r2` | profile routing / role assignment |
| analyst | `qwen3.6-27b-claude-opus-deepseek-distilled-imatrix-mtp` | compare / benchmark / scores |
| deep-thinker | `qwen3.5-9b-deepseek-v4-flash-mtp` + frontier kernel | thinking 9B |
| vision | `qwen/qwen3-vl-30b` | vision (replacing weaker agents-a1 for agentic) |

**Bunta identity (corrected):**

| Term | Meaning |
|---|---|
| Bunta / Bunta_420 | User (Gilbert) on Telegram |
| Bunta Holdings | Parent org / repo |
| Bunta Labs | Track 3 — R&D, prediction, ranking methodology |
| Bunta Racing / Factory / Apps | Other tracks (kanban boards) |
| bunta-labs track binding (orchestrator SOUL) | intended `Qwen3.6-35B-A3B-MLX-8Bit` on node1 |

### C. n8n pipeline

Workflow: **Bunta Labs Model Onboarding Pipeline** (`60me4WHpZHHZ04rZ`)

```
Webhook hermes-benchmark
  → Prepare Payload
  → Profile Router (orchestrator)  [LM Studio: qwen35b-agent-r2]
       ├ language model: LM Studio OpenAI-compat @ host.docker.internal:8000/v1
       └ tool: run_parameter_sweep → /webhook/execute-sweep
  → Format
  → Sign HMAC → Deliver via Hermes (/webhooks/n8n-delivery)
  → Respond to Webhook
```

Credential: `LM Studio (OpenAI-compatible)` → `http://host.docker.internal:8000/v1`  
(n8n Docker cannot use host `127.0.0.1` for LM Studio)

### D. Hermes delivery bus

| Route | Behavior |
|---|---|
| `/webhooks/n8n-notify` | Agent-mediated intake (`Hermes Webhook → Hermes Agent`) |
| `/webhooks/n8n-delivery` | Direct deliver → Telegram home |

External entry: `POST http://127.0.0.1:5678/webhook/hermes-notify`

## Verification

| Check | Result |
|---|---|
| LM Studio from n8n Docker | `host.docker.internal:8000` OK |
| Profile router dry-run | `qwen3.5-9b-deepseek-v4-flash-mtp` → **deep-thinker**, no smart-routing change |
| `hermes-notify` → Hermes | HTTP **202** `route=n8n-notify`, gateway log inbound OK |
| Unsigned Hermes webhooks | **401** Invalid signature (expected) |
| Kernel A/B (earlier) | thinking models: latency −19–25s; deepseek reason +0.9 |
| Sweep full params on deepseek | defaults near-optimal; min_p=0.05 tiny reason gain / huge latency |

## Open loops

1. **Sweep executor** (`ZoZtqBNXjtKU5phM`) still host-Python-in-Docker fragile; not production onboard yet.
2. Bunta full E2E via `n8n-delivery` after agent success: wire proven; last failure was LM Studio JIT/engine abort mid-run.
3. SkillOpt long-term verification of ranking stack still pending.
4. Analyst model path for pure score-compare step not yet split from orchestrator router in n8n (routing-only path done).

## Related

- Skill: `bunta-labs-optimization`
- Session: `llm-wiki/session-summary-2026-07-18.md` (Late section)
- Prior same-day: n8n→Hermes delivery bus (session summary main section)
