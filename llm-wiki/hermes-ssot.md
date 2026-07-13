# Hermes SSOT (Single Source of Truth) — Multi-Node Knowledge Base

> Both node1 (Mac) and node4 (Windows) are read/write contributors to `llm-wiki/` and `worklog/`. The SSOT is the shared repo content, not any single node. Each node records what it did so the other node (and future agents) know where an action originated.

## Rule

- Every session summary and worklog entry must include a **`Node:`** field.
- Use `node1` for the Mac and `node4` for the Windows RTX 3090 box.
- When an action is performed on one node that affects the other, record it on **both** nodes' worklogs/session summaries, or in a shared node-aware document.
- Do not overwrite node-specific context with generic text. Preserve the `Node:` provenance.

## Node naming

| Node | Host | OS | Role |
|------|------|----|------|
| `node1` | 192.168.50.101 | macOS 26.5 | Primary Hermes/LM Studio/LiteLLM host |
| `node4` | 192.168.50.104 | Windows 11 | Hermes Windows / GPU node |

## Example header

```markdown
# 2026-07-13 — Hermes Desktop File Tree Fix + Dashboard Verification

**Node:** node1 (Mac)
**Type:** repair + verification
**Status:** complete
```

## Merging node contributions

When both nodes contribute to the same date's worklog or session summary, append sections rather than replacing. Use sub-headings like:

```markdown
## node1 (Mac)
...

## node4 (Windows)
...
```

## Files

- `worklog/YYYY-MM-DD.md` — daily activity per node, appended together.
- `llm-wiki/session-summary-YYYY-MM-DD.md` — high-level outcomes, node-aware.
- `llm-wiki/hermes-ssot.md` — this file.

## Current node-aware entries

- `llm-wiki/session-summary-2026-07-13.md` — node1 desktop fix; node4 Hermes home canonization.
- `worklog/2026-07-13.md` — node1 dashboard/tree fix; node4 consolidation/canonization.

## Future agent guidance

When asked to update worklog/llm-wiki, always:
1. Check if a node-specific version exists on the other node.
2. Preserve node provenance.
3. Merge by appending, not overwriting.
4. Commit to the personal fork so both nodes can pull the merged SSOT.
