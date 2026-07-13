# Session Summary — 2026-07-11 (Late)

## Dashboard + Desktop App Fixes — Three Cascading Issues

### 1. Desktop App Stuck on Connecting

**Problem:** Hermes Desktop app (Mac, local mode) stuck on "connecting" screen indefinitely.

**Root Cause:** Dashboard was bound to `0.0.0.0:9119` (auth engaged for node4 remote access). When auth is on, `__HERMES_SESSION_TOKEN__` is NOT injected into the dashboard HTML. The desktop app detects the dashboard on 9119, tries to adopt the session token from the HTML, but gets a 302 redirect to `/login` instead — no token to adopt.

**Solution:** Restart dashboard on `127.0.0.1` only (loopback = no auth gate). Session token is injected into HTML. Desktop app reads it and connects. Serve stays on `0.0.0.0:9120` with auth for node4 remote access.

### Key details

| Service | Before | After |
|---------|--------|-------|
| Dashboard (9119) | `0.0.0.0` (auth on, no token in HTML) | `127.0.0.1` (auth off, token in HTML) |
| Serve (9120) | `0.0.0.0` with auth | Unchanged — for node4 remote |
| Dashboard processes | 3 duplicate zombies | 1 clean process |
| `connection.json` | `mode: local` (correct for Mac) | Unchanged — local mode is right |

### 2. Dashboard Chat Reconnect Loop

**Problem:** Dashboard `/chat` tab stuck in a reconnect loop — PTY connects, WS connects, immediately disconnects (code=1005), reconnects every 5 seconds.

**Root Cause:** The gateway (launchd-managed) had crashed with `AttributeError: module 'yaml' has no attribute 'SafeDumper'`. Without a running gateway, the dashboard's PTY child connects to `/api/ws` but the gateway.ready frame send fails immediately. The PTY reconnects, creating a loop.

**Solution:** Restarted gateway manually from venv. Also updated the launchd plist:
- Added `HOME` env var (launchd doesn't set it by default)
- Added `PYTHONNOUSERSITE=1` to prevent user site-packages interference
- Changed `WorkingDirectory` from `.hermes` to source tree root
- Cleaned PATH to only include venv + system bins (removed Python 3.14 framework path)

### 3. Bot Sessions Overwriting Dashboard Chat

**Problem:** Dashboard chat session list shows Telegram/Discord bot sessions at the top, overwriting the user's TUI sessions in the sidebar view.

**Root Cause:** Telegram + Discord were running on the **default profile** — same profile as the dashboard chat. In multiplex mode without profile separation, all sessions (TUI, Telegram, Discord) share the same state.db and appear in the same session list. Bot sessions bubble to the top because they're the most recent.

**Solution:** Enabled `gateway.multiplex_profiles: true` and moved Telegram + Discord to the **messaging-bots profile**:
- Added `platforms.telegram.enabled: true` and `platforms.discord.enabled: true` to `~/.hermes/profiles/messaging-bots/config.yaml`
- Added `platforms.telegram.enabled: false` and `platforms.discord.enabled: false` to default, long-context, planner, and vision profiles
- Bot tokens stay in the shared `.env` — the gateway reads env vars regardless of profile
- Bot sessions now go to messaging-bots profile's state.db, not default's

### Key details

| Config file | Change |
|-------------|--------|
| `~/.hermes/config.yaml` | Added `gateway.multiplex_profiles: true`, `platforms.telegram.enabled: false`, `platforms.discord.enabled: false` |
| `~/.hermes/profiles/messaging-bots/config.yaml` | Added `platforms.telegram.enabled: true`, `platforms.discord.enabled: true` |
| `~/.hermes/profiles/long-context/config.yaml` | Added platforms disabled |
| `~/.hermes/profiles/planner/config.yaml` | Added platforms disabled |
| `~/.hermes/profiles/vision/config.yaml` | Added platforms disabled |
| `~/Library/LaunchAgents/ai.hermes.gateway.plist` | Added HOME, PYTHONNOUSERSITE, fixed WorkingDirectory, cleaned PATH |

### Verification

```
✓ telegram connected (profile: messaging-bots)
✓ discord connected (profile: messaging-bots)
✓ Gateway running with 2 platform(s)
✓ Dashboard status: gateway_running=True, auth_required=False
✓ Desktop app: 11 TCP connections to dashboard, past connecting screen
✓ No PTY reconnect loop in gui.log
```

### Caveats

- Gateway runs as manual background process (PID from `hermes gateway run --replace`). Launchd plist was updated but the launchd throttle (from repeated crashes) may need a full `launchctl bootout` + wait + `bootstrap` cycle to clear. The plist changes (HOME, PYTHONNOUSERSITE, clean PATH) should prevent the yaml.SafeDumper crash on reboot.
- Bot sessions are now in the messaging-bots profile. To view them in the dashboard, switch profile to "messaging-bots" in the sidebar dropdown.
- The dashboard must run on `127.0.0.1` (not `0.0.0.0`) for the desktop app to connect without auth. If remote dashboard access is needed, use the serve port (9120) with auth instead.