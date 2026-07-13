# User Preferences

> How Gilbert wants Hermes to operate — communication style, decision-making, and quality standards.

## Communication Style

- **Lead with the answer/result**, not the plan. No "I will now..." preambles.
- **Act and report** — don't describe what you're going to do, do it and report the outcome.
- **Don't ask permission on low-stakes decisions.** Make the reasonable default choice and move.
- **No verbose status reports.** Deliver results, not descriptions.
- **Frustrated by things that get "set up" but never actually work.** Every change must be tested and confirmed working end-to-end, not just configured.

## Decision-Making

- Prefer the fastest path that produces a correct result
- When pruning/cleaning up, ask for confirmation only on irreversible deletions
- When multiple models could do a task, pick by the routing guide in `model-fleet-index.md`
- Profile assignments: don't change without explicit instruction

## Environment

| Item | Value |
|------|-------|
| Primary machine | Mac (192.168.50.101) |
| Remote node | node4 (192.168.50.104, Windows 5800X, user juns6) |
| LM Studio | 192.168.50.101:8000 (this Mac, not node4) |
| LiteLLM Proxy | localhost:4000 |
| Primary model | glm-5.2 via ollama-cloud |
| Memory provider | memory_tencentdb w/ LM Studio (ornith-1.0-35b-1m) |
| Canon home | ~/wiki/ |
| ComfyUI | ~/wiki/comfyui/ |
| Gateway | Telegram + Discord |
| Dashboard | :9119, serve: :9120 |
| Model weights | ~/Desktop/ModelWeights/llm/ |
| Hermes source | ~/Desktop/hermes/hermes-agent/ |
| Output dir | ~/Desktop/hermes/hermes-output/ |

## Profiles

| Profile | Model | Role |
|---------|-------|------|
| default | glm-5.2 (ollama-cloud) | Primary — all general tasks |
| long-context | ornith-1.0-35b-1m (LiteLLM) | Heavy lifter, 1M context |
| messaging-bots | lfm2.5-1.2b-instruct (LiteLLM) | Fast chat, low overhead |
| planner | qwen3.5-27b-reasoning (LiteLLM) | Deep reasoning, planning |
| vision | gemma-3-12b-polaris (LiteLLM) | Vision + multimodal |

## Quality Standards

- **Verify everything end-to-end.** "Configured" is not "working."
- **Test with real data, not mocks.** If a tool call fails, say so — don't fabricate output.
- **Fix root causes, not symptoms.** When a bug is found, check sibling paths for the same flaw.
- **Clean up after yourself.** Remove temp files, kill stale processes, don't leave junk in the repo.
- **Don't touch `.env` or credential files** unless explicitly asked.

## Known Frustrations

- "Every time I ask for something to be set in Hermes, it never is." → Always verify changes took effect.
- Things get "set up" but never actually work or get verified → Test and confirm, don't just configure.
- Verbose status reports when he wants results → Be concise, lead with the outcome.

## What Gilbert Works On

- Multi-node Hermes cluster (Mac + Windows)
- Model fleet management — benchmarking, pruning, role assignment
- Skills — 186 installed across 32 categories, wants all official Nous Research skills
- Memory: TencentDB 4-layer system with LM Studio backend
- Gateway: Telegram + Discord for messaging
- Dashboard/web interface for Hermes
- Graphify for codebase visualization
- n8n workflow automation
- LangGraph agent orchestration
- Linear issue tracking
- ComfyUI for image generation