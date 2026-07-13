# Graph Report - .  (2026-07-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 70 nodes · 85 edges · 9 communities (8 shown, 1 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `79c08064`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_frontier-logic (Truth Table)|frontier-logic (Truth Table)]]
- [[_COMMUNITY_Skills Index Document|Skills Index Document]]
- [[_COMMUNITY_Working Environment Document|Working Environment Document]]
- [[_COMMUNITY_Session Log June 22 to July 11|Session Log June 22 to July 11]]
- [[_COMMUNITY_Model Fleet Index|Model Fleet Index]]
- [[_COMMUNITY_Inference Stack Document|Inference Stack Document]]
- [[_COMMUNITY_Desktop Update Troubleshooting|Desktop Update Troubleshooting]]
- [[_COMMUNITY_ComfyUI Local Image Generation Stack|ComfyUI Local Image Generation Stack]]

## God Nodes (most connected - your core abstractions)
1. `frontier-logic (Truth Table)` - 8 edges
2. `Inference Stack Document` - 8 edges
3. `Skills Index Document` - 8 edges
4. `Working Environment Document` - 8 edges
5. `Model Fleet Index` - 6 edges
6. `User Preferences Document` - 5 edges
7. `Hermes Pitfalls & Lessons Learned` - 5 edges
8. `Desktop Update Troubleshooting` - 4 edges
9. `Hermes Folder Sync Architecture` - 4 edges
10. `LiteLLM Proxy Layer` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Working Environment Document` --references--> `Inference Stack Document`  [INFERRED]
  working-environment.md → inference-stack.md
- `llama-cpp-rpc-cluster Skill` --conceptually_related_to--> `llama.cpp RPC Cluster Layer`  [INFERRED]
  skills-index.md → inference-stack.md
- `Session Summary 2026-07-11` --references--> `Model Fleet Index`  [INFERRED]
  session-summary-2026-07-11.md → model-fleet-index.md
- `Hermes Pitfalls & Lessons Learned` --conceptually_related_to--> `Session Summary — 2026-07-11 (Late Night)`  [INFERRED]
  pitfalls-and-lessons.md → session-summary-2026-07-11-late-night.md
- `Hermes Pitfalls & Lessons Learned` --conceptually_related_to--> `Session Summary — 2026-07-12`  [INFERRED]
  pitfalls-and-lessons.md → session-summary-2026-07-12.md

## Hyperedges (group relationships)
- **3-Layer Logic Circuit for Subagent Routing** — frontier_skills_logic, frontier_skills_edge, frontier_skills_minimax_m3, frontier_skills_deepseek_v4_pro, frontier_skills_glm_52 [EXTRACTED 0.90]
- **4-Layer Inference Stack Flow** — inference_stack_litellm, inference_stack_lm_studio, inference_stack_rpc_cluster, inference_stack_ollama_cloud [EXTRACTED 1.00]
- **Fleet Benchmarking and Optimization** — model_fleet_index, cluster_optimization_report, session_summary_2026_07_11_night, session_summary_2026_07_12_fleet_optimization [EXTRACTED 0.90]

## Communities (9 total, 1 thin omitted)

### Community 0 - "frontier-logic (Truth Table)"
Cohesion: 0.17
Nodes (15): Frontier Skills Document, Invariant Cluster: Boundary-Safe, Invariant Cluster: Completion-Gated, Invariant Cluster: Constraint-Sharp, Invariant Cluster: Precondition-Checked, Invariant Cluster: Source-Bound, Invariant Cluster: State-First, Invariant Cluster: Tool-Immediate (+7 more)

### Community 1 - "Skills Index Document"
Cohesion: 0.17
Nodes (12): Session Summary 2026-07-10, Skills Index Document, fastmcp Skill, graphify Skill, hermes-agent Skill, hermes-web-dashboard Skill, llama-cpp-rpc-cluster Skill, llm-wiki Skill (+4 more)

### Community 2 - "Working Environment Document"
Cohesion: 0.18
Nodes (11): Hermes Folder Sync Architecture, Legacy assemble.sh (Deprecated), load_config() mtime-based cache, Obsidian Sync Mechanism, User Preferences Document, Communication Style Preferences, Profile Assignments, Quality Standards (+3 more)

### Community 3 - "Session Log June 22 to July 11"
Cohesion: 0.20
Nodes (10): Session Log June 22 to July 11, Bunta Holdings Org Structure, July 9 Session: RPC Cluster & DeepSeek V4, July 11 Session: Benchmarks & Pruning, June 22 Session: MAOS Bootstrap, Session Summary 2026-07-09, Session Summary 2026-07-11, agentic-benchmark-unified.py (+2 more)

### Community 4 - "Model Fleet Index"
Cohesion: 0.33
Nodes (9): Cluster Optimization Report, Cluster RPC Fabric, Model Fleet Index, Hermes Pitfalls & Lessons Learned, Session Summary — 2026-07-11 (Late), Session Summary — 2026-07-11 (Late Night), Session Summary — 2026-07-11 (Night), Session Summary — 2026-07-12 (+1 more)

### Community 5 - "Inference Stack Document"
Cohesion: 0.53
Nodes (6): Inference Stack Document, LiteLLM Proxy Layer, litellm_config.yaml, LM Studio Layer, ollama-cloud Layer, llama.cpp RPC Cluster Layer

### Community 6 - "Desktop Update Troubleshooting"
Cohesion: 0.60
Nodes (4): Desktop Update Troubleshooting, applyUpdatesPosixInApp(), cmd_gui() in hermes_cli/main.py, apps/desktop/electron/main.cjs

## Knowledge Gaps
- **23 isolated node(s):** `Dashboard Auth Gate`, `Dashboard REST Endpoints`, `frontier-edge (Output Signal)`, `Invariant Cluster: Precondition-Checked`, `Invariant Cluster: Source-Bound` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Working Environment Document` connect `Working Environment Document` to `frontier-logic (Truth Table)`, `Skills Index Document`, `Session Log June 22 to July 11`, `Inference Stack Document`?**
  _High betweenness centrality (0.535) - this node is a cross-community bridge._
- **Why does `MOA (Mixture of Agents) Config` connect `frontier-logic (Truth Table)` to `Working Environment Document`?**
  _High betweenness centrality (0.286) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Working Environment Document` (e.g. with `Inference Stack Document` and `User Preferences Document`) actually correct?**
  _`Working Environment Document` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Dashboard Auth Gate`, `Dashboard REST Endpoints`, `frontier-edge (Output Signal)` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._