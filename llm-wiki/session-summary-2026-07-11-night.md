# Session Summary — 2026-07-11 (Night)

## Kanban Multi-Profile Automation — Specialist Fleet + Profile Creation

### Problem

The Hermes cluster had 9 chat models but only 5 profiles. Models like qwen3.5-9b-highiq (top agentic score 9.25) and qwen35b-fable (fastest at 787ms) had no dedicated profile — they were unused by the kanban board. A multi-profile kanban pipeline was created to test cross-profile collaboration, but it triggered an npm rebuild that killed the dashboard.

### Solution

Fixed the TUI rebuild trigger, verified the kanban pipeline, then created 4 new specialist profiles with dedicated SOUL.md files.

### 1. TUI Rebuild Fix

**Root Cause:** Kanban workers spawn a TUI process. The `_tui_need_npm_install` function compared `package-lock.json` against `node_modules/.package-lock.json` — they differed, triggering `npm install` on every worker spawn.

**Fix:**
- Ran `npm install` at workspace root to install missing dependencies
- Ran `npm run build` in `ui-tui/` to rebuild the TUI bundle
- Synced `package-lock.json` → `node_modules/.package-lock.json` so the content comparison passes
- `_tui_need_npm_install` now returns `False` — no more rebuilds

### 2. Kanban Pipeline Verification

The test pipeline ran successfully across 4 profiles:

| Task | Profile | Status | Finding |
|------|---------|--------|---------|
| t_56cdf342 — Decompose goal | planner | ✅ done | Created subtasks on the board |
| t_df462391 — Review model fleet | long-context | ✅ done | Found 5 gaps, 4 overlaps in profile assignments |
| t_f0c44bce — Analyze LiteLLM routing | long-context | ✅ done | 6 of 11 models unused by profiles |
| t_38cf6718 — 3-bullet summary | messaging-bots | ✅ done | Summarized: gaps, unused models, missing failover |
| t_4ba2f4c8 — Final report | default | ready | Dispatcher will pick up |

The workers' findings directly identified the gaps we then fixed by creating new profiles.

### 3. New Specialist Profiles

Created 4 new profiles, each with a dedicated SOUL.md:

| Profile | Model | Agentic | Latency | Turns | Role |
|---------|-------|:-------:|:-------:|:-----:|------|
| `coder` | qwen3.5-9b-claude-4.6-highiq | 9.25 | 1.5s | 100 | Code generation, PR review, debugging |
| `researcher` | qwen35b-a3b-fable | 8.58 | 0.8s | 80 | Web search, data gathering, batch |
| `scout` | ministral-3-3b-instruct-2512 | 8.92 | 1.2s | 30 | Quick lookups, triage, routing |
| `analyst` | qwen3.6-27b-claude-opus-mtp | 9.00 | 2.5s | 120 | Architecture review, evaluation, audit |

### 4. SOUL.md for All Profiles

Written for all 8 non-default profiles (default uses the base Hermes SOUL.md):

| Profile | SOUL.md Focus |
|---------|---------------|
| planner | Strategic decomposition, orchestrating the kanban board, deep reasoning |
| long-context | Heavy reading, full-codebase analysis, 1M context |
| messaging-bots | Fast chat for Telegram/Discord, short and efficient |
| vision | Image/screenshot analysis, multimodal reasoning |
| coder | Surgical code edits, read-before-write, verify-after-edit |
| researcher | Fast information gathering, parallel queries, structured output |
| scout | Minimal fast lookups, triage, routing decisions |
| analyst | Methodical evaluation, trade-off analysis, risk assessment |

### 5. LiteLLM Config Cleanup

- Removed dead `llama3.3-8b-thinking` model from `litellm_config.yaml` (not loaded in LM Studio anymore)
- LiteLLM now has 10 model aliases (8 chat + audio + embedding)

### Key details

| File | Change |
|------|--------|
| `~/.hermes/profiles/coder/config.yaml` | NEW — qwen3.5-9b-highiq, 100 turns, medium reasoning |
| `~/.hermes/profiles/researcher/config.yaml` | NEW — qwen35b-fable, 80 turns, low reasoning |
| `~/.hermes/profiles/scout/config.yaml` | NEW — ministral-3-3b, 30 turns, low reasoning |
| `~/.hermes/profiles/analyst/config.yaml` | NEW — qwen3.6-27b-mtp, 120 turns, high reasoning |
| `~/.hermes/profiles/*/SOUL.md` | NEW — 8 role-specific identity files |
| `litellm_config.yaml` | UPDATED — removed llama3.3-8b (10→10 models, was 11) |
| `node_modules/.package-lock.json` | SYNCED — matches package-lock.json to prevent npm rebuild |

### Verification

- ✅ All 4 new profiles verified via live LiteLLM chat completions (all returned "OK")
- ✅ All 9 profiles registered as kanban assignees
- ✅ Kanban pipeline ran: planner → long-context (×2) → messaging-bots → default (ready)
- ✅ `_tui_need_npm_install` returns `False` — no rebuilds on worker spawn
- ✅ YAML lint passed on all 4 new config files

### Final Profile Fleet

| Profile | Model | Provider | Role | Platforms |
|---------|-------|----------|------|-----------|
| default | glm-5.2 | ollama-cloud | General + final integration | None |
| planner | qwen3.5-27b-opus-reasoning | LiteLLM :4000 | Decompose, architecture | None |
| long-context | ornith-1.0-35b-1m | LiteLLM :4000 | Heavy reading, codebase | None |
| coder | qwen3.5-9b-highiq | LiteLLM :4000 | Code, PRs, debugging | None |
| researcher | qwen35b-fable | LiteLLM :4000 | Fast research, batch | None |
| scout | ministral-3-3b | LiteLLM :4000 | Quick lookups, triage | None |
| analyst | qwen3.6-27b-mtp | LiteLLM :4000 | Evaluation, audit | None |
| vision | gemma-3-12b-polaris | LiteLLM :4000 | Image, multimodal | None |
| messaging-bots | lfm2.5-1.2b-instruct | LiteLLM :4000 | Telegram + Discord | ✅ both |