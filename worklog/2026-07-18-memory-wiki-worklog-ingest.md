# 2026-07-18 — Memory-wiki ingest from recent worklogs

**Cron:** extract key updates from `worklog/` (last 7 days) → `.hermes/memory-wiki.md`

## Sources scanned
- `2026-07-16-desktop-model-switch-lmstudio-context.md` (already largely in wiki)
- `2026-07-17-shared-backend-gateway-events-repair.md` (already in wiki)
- `2026-07-17-second-brain-mesh-e2e.md`
- `2026-07-17-n8n-cleanup-workflows-telegram-webhook.md`
- `2026-07-17-n8n-failure-rate-fix.md`
- `2026-07-17-canonical-synced-consolidation.md`
- `2026-07-17-hermes-folder-upkeep.md`
- `2026-07-18-hermes-folder-upkeep.md`

## Updates applied to `.hermes/memory-wiki.md`
- **§1 Projects:** second-brain mesh, repo folder hygiene, n8n reliability
- **§2 Decisions:** repo SSoT only; Supabase stopped; daily folder upkeep; n8n env-block; cron→n8n Telegram; graphify path; OV MCP ingest
- **§3 Outputs:** n8n workflows, upkeep worklogs/prompt, consolidation + failure-rate logs, AGENTS.md surfaces
- **§4 Workflows:** 4.15 n8n Telegram, 4.16 folder upkeep, 4.17 mesh health
- **§5 Skills:** opencode-coder-delegation, hermes-app-troubleshooting, SOPs; removed duplicate worklog row
- **§6 Open loops:** closed bulk bak prune / graphify root / synced+canonical; opened human-confirm deletes and large bak reclaim
- **§7 Safety:** no reintroduce synced/canonical; no auto-delete recovery artifacts; n8n `$env` rule; no root graphify-out
- **Quick ref:** LangGraph :2024, webhooks, SSoT, Supabase stopped
- Header date → **2026-07-18**

## Verification
- Targeted patches only (no full rewrite)
- Existing accurate Desktop/gateway content preserved
