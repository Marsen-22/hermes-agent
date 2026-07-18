# Session Summary — 2026-07-18

## n8n → Hermes default delivery bus — Done

**Problem:** n8n workflows posted straight to Telegram Bot API; user wanted Hermes as the default delivery path (“route back to Hermes” / Hermes as default delivery).

**Solution:**
1. Enabled/confirmed Hermes webhook platform (`:8644`).
2. Created dynamic routes:
   - `n8n-delivery` — deliver-only → Telegram home `844317264` (zero LLM)
   - `n8n-notify` — agent-processed events → Telegram
3. Rewired n8n workflows off `api.telegram.org` onto Hermes:
   - Mesh Health Monitor → Hermes
   - Graphify Complete → Seed Skills + Hermes Notify
   - Graphify → SkillOpt Seed Generator (Hermes)
   - Bunta Labs Model Onboarding Pipeline
   - Hermes Webhook → Hermes Agent (agent route)
4. Docker note: n8n container uses `host.docker.internal:8644` (not `127.0.0.1`).
5. HMAC-SHA256 pure-JS in n8n Code nodes (`require('crypto')` disallowed).

### Key details
| Item | Value |
|------|--------|
| Hermes delivery bus | `POST http://host.docker.internal:8644/webhooks/n8n-delivery` |
| Hermes agent intake | `POST …/webhooks/n8n-notify` |
| External n8n entry | `POST http://127.0.0.1:5678/webhook/hermes-notify` |
| Secret | global webhook secret in `platforms.webhook.extra.secret` |
| Signature header | `X-Hub-Signature-256: sha256=<hex>` |
| Default chat | `844317264` |

### Verification
- Direct Hermes: `{"status":"delivered","route":"n8n-delivery","target":"telegram"}`
- n8n → Hermes agent: `{"ok":true,"routed_to":"hermes","hermes_status":202}`
- Gateway log: `direct-deliver event=… route=n8n-delivery target=telegram`

### Caveats
- Bot tokens were previously hardcoded in n8n HTTP nodes; prefer Hermes bus going forward.
- Health checks from n8n Docker must use `host.docker.internal` for host services.

---

# Session Summary — 2026-07-18 (Late)

## Bunta Labs ranking + profile routing (orchestrator) — Done

**Problem:** (1) Optimization treated as one-signal done; (2) “Bunta” misused as agent identity; (3) onboard pipeline needed **profile routing** suggestions for human review, via Hermes delivery.

**Solution:**
1. Refined skill `bunta-labs-optimization` as multi-layer methodology (engine → behavior → role → system), human-review only.
2. Corrected identity: **Bunta** = user/brand; **Bunta Labs** = R&D track; agent = Hermes **orchestrator** for routing.
3. n8n workflow `60me4WHpZHHZ04rZ` agent node → **Profile Router (orchestrator)** on LM Studio `qwen35b-agent-r2`.
4. LM Studio credential in n8n: `host.docker.internal:8000/v1`.
5. Delivery path: Sign HMAC → Hermes `/webhooks/n8n-delivery` (not raw Telegram as preferred default).

### Key details
| Item | Value |
|------|--------|
| Profile for routing | `orchestrator` |
| Model | `qwen35b-agent-r2` |
| Profile for score/compare | `analyst` / `qwen3.6-27b-claude-opus-deepseek-distilled-imatrix-mtp` |
| Smart-routing default | orchestrator / agent-r2 |
| Webhook | `POST /webhook/hermes-benchmark` |
| Worklog | `worklog/2026-07-18-bunta-labs-profile-routing-n8n.md` |

### Verification
- Dry-run: deepseek-9b-mtp → **deep-thinker**, no routing change needed.
- `hermes-notify` → Hermes **202** accepted; gateway log shows `n8n-notify` inbound.
- agent-r2 chat OK on LM Studio before n8n dry-run.

### Caveats / open loops
- Sweep executor still not Docker-safe for full onboard sweeps.
- Do not call the n8n agent “Bunta”; track name ≠ agent.
