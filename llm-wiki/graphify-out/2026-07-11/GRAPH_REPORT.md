# Graph Report - .  (2026-07-11)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 107 nodes · 154 edges · 9 communities
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dabae386`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Node1 (Mac M4 Max)|Node1 (Mac M4 Max)]]
- [[_COMMUNITY_Model Fleet Index|Model Fleet Index]]
- [[_COMMUNITY_frontier-logic (Truth Table)|frontier-logic (Truth Table)]]
- [[_COMMUNITY_Pitfalls and Lessons|Pitfalls and Lessons]]
- [[_COMMUNITY_Hermes Second Brain README|Hermes Second Brain README]]
- [[_COMMUNITY_Agentic Benchmark Scoring Methodology|Agentic Benchmark Scoring Methodology]]
- [[_COMMUNITY_Skills Index Document|Skills Index Document]]
- [[_COMMUNITY_Inference Stack Document|Inference Stack Document]]
- [[_COMMUNITY_Desktop Update Troubleshooting|Desktop Update Troubleshooting]]

## God Nodes (most connected - your core abstractions)
1. `Node1 (Mac M4 Max)` - 12 edges
2. `Working Environment Document` - 12 edges
3. `Hermes Second Brain README` - 11 edges
4. `Cluster RPC Fabric` - 11 edges
5. `Model Fleet Index` - 11 edges
6. `frontier-logic (Truth Table)` - 8 edges
7. `Inference Stack Document` - 8 edges
8. `Pitfalls and Lessons` - 8 edges
9. `Skills Index Document` - 8 edges
10. `llama.cpp RPC Cluster Layer` - 7 edges

## Surprising Connections (you probably didn't know these)
- `llama-cpp-rpc-cluster Skill` --conceptually_related_to--> `llama.cpp RPC Cluster Layer`  [INFERRED]
  skills-index.md → inference-stack.md
- `Working Environment Document` --references--> `Inference Stack Document`  [INFERRED]
  working-environment.md → inference-stack.md
- `Pitfall: LiteLLM Model Name Dots to Dashes` --conceptually_related_to--> `LiteLLM Proxy Layer`  [INFERRED]
  pitfalls-and-lessons.md → inference-stack.md
- `Session Summary 2026-07-11` --references--> `Model Fleet Index`  [INFERRED]
  session-summary-2026-07-11.md → model-fleet-index.md
- `July 9 Session: RPC Cluster & DeepSeek V4` --conceptually_related_to--> `Session Summary 2026-07-09`  [INFERRED]
  session-log-2026-06-22-to-2026-07-11.md → session-summary-2026-07-09.md

## Hyperedges (group relationships)
- **4-Layer Inference Stack Flow** — inference_stack_litellm, inference_stack_lm_studio, inference_stack_rpc_cluster, inference_stack_ollama_cloud [EXTRACTED 1.00]
- **3-Layer Logic Circuit for Subagent Routing** — frontier_skills_logic, frontier_skills_edge, frontier_skills_minimax_m3, frontier_skills_deepseek_v4_pro, frontier_skills_glm_52 [EXTRACTED 0.90]
- **4-Node RPC Cluster Fabric** — cluster_rpc_fabric_node1, cluster_rpc_fabric_node2, cluster_rpc_fabric_node3, cluster_rpc_fabric_node4, cluster_rpc_fabric_llama_cpp_rpc [EXTRACTED 1.00]

## Communities (9 total, 0 thin omitted)

### Community 0 - "Node1 (Mac M4 Max)"
Cohesion: 0.19
Nodes (19): Cluster RPC Fabric, Hermes Gateway API Server, Hermes Serve Backend, LiteLLM Proxy Service, llama.cpp RPC Server, LM Studio Service, n8n Workflow Automation, Node1 (Mac M4 Max) (+11 more)

### Community 1 - "Model Fleet Index"
Cohesion: 0.15
Nodes (17): Profile: default (glm-5.2), Profile: long-context (ornith-1.0-35b-1m), Profile: messaging-bots (lfm2.5-1.2b), Profile: planner (qwen3.5-27b-reasoning), Profile: vision (gemma-3-12b-polaris), Model Fleet Index, gemma-3-12b-polaris (Score 8.58), lfm2.5-1.2b-instruct (Score 8.33) (+9 more)

### Community 2 - "frontier-logic (Truth Table)"
Cohesion: 0.17
Nodes (15): Frontier Skills Document, Invariant Cluster: Boundary-Safe, Invariant Cluster: Completion-Gated, Invariant Cluster: Constraint-Sharp, Invariant Cluster: Precondition-Checked, Invariant Cluster: Source-Bound, Invariant Cluster: State-First, Invariant Cluster: Tool-Immediate (+7 more)

### Community 3 - "Pitfalls and Lessons"
Cohesion: 0.18
Nodes (12): TencentDB Memory Provider, Pitfalls and Lessons, Pitfall: Hermes Config Path Mismatch, Pitfall: LM Studio MLX Backend Broken, Pitfall: n8n MCP SSRF Blocks Localhost, Pitfall: Hermes Update Wipes plugin.yaml, Pitfall: state.db Corruption, Pitfall: TencentDB Memory Plugin Not Wired (+4 more)

### Community 4 - "Hermes Second Brain README"
Cohesion: 0.17
Nodes (12): Hermes Second Brain README, Cluster RPC Fabric Reference, Desktop Update Troubleshooting Reference, Hermes Folder Sync Reference, Frontier Skills Reference, Inference Stack Reference, Model Fleet Index Reference, Pitfalls and Lessons Reference (+4 more)

### Community 5 - "Agentic Benchmark Scoring Methodology"
Cohesion: 0.18
Nodes (11): Agentic Benchmark Scoring Methodology, Pitfall: Thinking Models Output to reasoning_content, Session Log June 22 to July 11, July 9 Session: RPC Cluster & DeepSeek V4, July 11 Session: Benchmarks & Pruning, June 22 Session: MAOS Bootstrap, Session Summary 2026-07-11, agentic-benchmark-unified.py (+3 more)

### Community 6 - "Skills Index Document"
Cohesion: 0.20
Nodes (10): Hermes Dashboard Service, Skills Index Document, fastmcp Skill, hermes-agent Skill, hermes-web-dashboard Skill, llama-cpp-rpc-cluster Skill, llm-wiki Skill, Hermes Web Dashboard Doc (+2 more)

### Community 7 - "Inference Stack Document"
Cohesion: 0.47
Nodes (6): Inference Stack Document, LiteLLM Proxy Layer, litellm_config.yaml, LM Studio Layer, ollama-cloud Layer, Pitfall: LiteLLM Model Name Dots to Dashes

### Community 8 - "Desktop Update Troubleshooting"
Cohesion: 0.60
Nodes (4): Desktop Update Troubleshooting, applyUpdatesPosixInApp(), cmd_gui() in hermes_cli/main.py, apps/desktop/electron/main.cjs

## Knowledge Gaps
- **31 isolated node(s):** `Skills Index Reference`, `Model Fleet Index Reference`, `Cluster RPC Fabric Reference`, `Inference Stack Reference`, `Frontier Skills Reference` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Working Environment Document` connect `Node1 (Mac M4 Max)` to `Model Fleet Index`, `frontier-logic (Truth Table)`, `Pitfalls and Lessons`, `Agentic Benchmark Scoring Methodology`, `Skills Index Document`, `Inference Stack Document`?**
  _High betweenness centrality (0.352) - this node is a cross-community bridge._
- **Why does `MOA (Mixture of Agents) Config` connect `frontier-logic (Truth Table)` to `Node1 (Mac M4 Max)`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Working Environment Document` (e.g. with `Inference Stack Document` and `User Preferences Document`) actually correct?**
  _`Working Environment Document` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Skills Index Reference`, `Model Fleet Index Reference`, `Cluster RPC Fabric Reference` to the rest of the system?**
  _34 weakly-connected nodes found - possible documentation gaps or missing edges._