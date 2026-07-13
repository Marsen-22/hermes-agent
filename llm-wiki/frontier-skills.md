# Frontier Skills — Cross-Model Discipline Distillation

> 15 frontier cloud models were prompted with the Invariant Extraction Prompt, each producing a cognitive discipline skill. These were synthesized into a 3-layer logic circuit the orchestrator uses to guard lesser-model subagents.

---

## Overview

The frontier skills system captures how frontier-tier cloud models (70B+ parameters) think about tool discipline, then routes that discipline to lesser local models (≤30B) that need it. The approach: run a structured extraction prompt on each frontier model, distill the cognitive pattern into a skill, then cross-compare all captures to find invariant clusters — disciplines that multiple models independently surfaced.

## The 3-Layer Logic Circuit

```
Orchestrator (frontier-tier model)
    │
    ├─ frontier-logic (truth table)
    │  └─ 7 invariant clusters from 15 captures
    │     └─ Picks which parent skill to load
    │
    ├─ frontier-edge (output signal)
    │  └─ 5-line guardrail for subagent context
    │     └─ Prepended to delegate_task context
    │
    └─ frontier-<model> (transistors)
       └─ 15 individual model captures
          └─ The actual discipline that fires
```

## The 7 Invariant Clusters

| # | Cluster | Discipline | Models | Consensus |
|---|---------|-----------|--------|-----------|
| 1 | State-First | Verify current state before any action — file, cwd, config, process | M3, DeepSeek V4 Pro, Kimi K2.6, Kimi K2.7 | 4 models (cross-model consensus) |
| 2 | Constraint-Sharp | One-sentence success condition is the anchor. Tool calls that don't serve it are skipped. | M3, DeepSeek V4 Pro, Kimi K2.7 | 3 models (consensus) |
| 3 | Boundary-Safe | No write to unverified path. No command without cwd check. | M3, DeepSeek V4 Pro, Kimi K2.6 | 3 models (consensus) |
| 4 | Precondition-Checked | Never invoke a tool without verifying its preconditions hold. | Devstral 2 123B, Gemini 3 Flash, GPT-OSS 120B, GPT 5.5, Ministral 3 14B, Nemotron 3 Ultra, Qwen3 Coder 480B | **7 models (largest consensus)** |
| 5 | Source-Bound | Patch old_string must be retrieved by read_file, not paraphrased. | Kimi K2.6, Kimi K2.7 | 2 models (family signature) |
| 6 | Completion-Gated | "Done" gates on verification signal, not description. | GLM 5.2, Mistral Large 3 675B | 2 models (family signature) |
| 7 | Tool-Immediate | Never emit prose describing what you will do — make the call or return the result. | DeepSeek V4 Pro, Gemma4 31B, Mistral Large 3 675B, Nemotron 3 Super | 4 models (consensus) |

## The 15 Captured Models

| Model | Provider | Cluster(s) Surfaced | Key Discipline |
|-------|---------|---------------------|---------------|
| MiniMax-M3 | ollama-cloud | State-First, Constraint-Sharp, Boundary-Safe | Massive-context discipline — strongest enforcement |
| DeepSeek V4 Pro | ollama-cloud | State-First, Constraint-Sharp, Boundary-Safe, Tool-Immediate | 4-step verification with silent routing |
| Kimi K2.6 | ollama-cloud | State-First, Boundary-Safe, Source-Bound | Tool-binding — strictest path verification |
| Kimi K2.7 | ollama-cloud | State-First, Constraint-Sharp, Source-Bound | No-synthesized-state with post-patch verification |
| GLM 5.2 | ollama-cloud | Completion-Gated | 7-step Execution Kernel with completion gate |
| GPT-OSS 120B | ollama-cloud | Precondition-Checked | Runtime-safety for guarded trees |
| Devstral 2 123B | ollama-cloud | Precondition-Checked | 9-step matrix with production-system intercepts |
| Gemini 3 Flash | ollama-cloud | Precondition-Checked | Precondition enumeration before tool calls |
| Gemma4 31B | ollama-cloud | Tool-Immediate | Zero-human-execution discipline |
| GPT 5.5 | ollama-cloud | Precondition-Checked | Capability verification before invocation |
| Ministral 3 14B | ollama-cloud | Precondition-Checked | Compact precondition checking |
| Mistral Large 3 675B | ollama-cloud | Completion-Gated, Tool-Immediate | Tool-immediacy + verify-before-report |
| Nemotron 3 Super | ollama-cloud | Tool-Immediate | Pure silent-routing kernel |
| Nemotron 3 Ultra | ollama-cloud | Precondition-Checked | Single-invariant kernel — cleanest enforcement |
| Qwen3 Coder 480B | ollama-cloud | Precondition-Checked | 5-step matrix with clarify on ambiguous input |

## Skills Installed

### Meta-Skills (3)

| Skill | Role | When to Load |
|-------|------|-------------|
| `frontier-logic` | Truth table — which cluster → which skill | When dispatching a subagent to a ≤30B model doing tool/state work |
| `frontier-edge` | 5-line output signal for subagent context | When subagent needs guardrails but full skill is too token-heavy |
| `frontier-model-distillation` | Capture procedure for new models | When adding a new frontier model to the atlas |

### Individual Model Skills (15)

All under `~/.hermes/skills/frontier-skills/frontier-<model>/`:

`frontier-deepseek-v4-pro`, `frontier-devstral-2-123b`, `frontier-gemini-3-flash`, `frontier-gemma4-31b`, `frontier-glm-52`, `frontier-gpt-5-5`, `frontier-gpt-oss-120b`, `frontier-kimi-k26`, `frontier-kimi-k27`, `frontier-minimax-m3`, `frontier-ministral-3-14b`, `frontier-mistral-large-3-675b`, `frontier-nemotron-3-super`, `frontier-nemotron-3-ultra`, `frontier-qwen3-coder-480b`

### Workflow Skills (2)

| Skill | Purpose |
|-------|---------|
| `frontier-distillation-workflow` | End-to-end workflow for running extraction + synthesis |
| `frontier-model-distillation` | Step-by-step capture procedure for a new model |

## How the Orchestrator Uses It

1. **Identify the primary failure mode** in the work ahead (boundary drift? premature claim-done? prose-promise?)
2. **Find the cluster** in the frontier-logic truth table
3. **Load the parent skill** at full fidelity, or use `frontier-edge` for subagents
4. **If two clusters apply**, load the skill with the more specific kernel
5. **For subagents on ≤30B models**, prepend `frontier-edge` to the delegate_task context

## Anti-Triggers (Don't Load When...)

- Single read-only observation (overhead)
- Creative artifact (clusters are engineering disciplines, not creative rules)
- Subagent on 1B-3B model (full atlas eats context — use `frontier-edge` only)
- Research/exploration with no tool calls (most clusters are about tool discipline)

## Re-Derivation Triggers

The atlas is a living artifact. Re-derive when:
1. New cluster surfaces (16th capture produces a discipline that doesn't fit existing 7)
2. Cluster splits (a current cluster is actually two coupled clusters)
3. Cluster downgrades (a 3+ surface cluster turns out to be one model's idiosyncrasy)
4. Cluster upgrade (a 2-surface cluster reaches 3+ surfaces → cross-model consensus)
5. Re-categorization (a cluster is a special case of a larger cluster)

## Provenance

- **Captured:** 2026-06-30 through 2026-07-02 (sessions 20260702_033200, 20260702_031147, 20260702_033514, parent 20260630_221224)
- **Extraction prompt:** Invariant Extraction Prompt v3-strict (4-section schema + persona-override + continuation rule)
- **Synthesis:** 2026-07-02 — 7 clusters emerged from cross-comparing core invariants across all 15 captures
- **Installed:** 2026-07-11 — copied from synced/ to active skills + synced to all profiles
- **Total skills:** 17 (15 model + logic + edge) + 2 workflow = 19

## MOA Integration

The current MOA config in `~/.hermes/config.yaml` uses 4 of these frontier models as reference models:
- glm-5.2
- kimi-k2.7-code
- nemotron-3-ultra
- gpt-oss:120b

Aggregator: deepseek-v4-flash
Fanout: per_iteration

---
*Last updated: 2026-07-11*