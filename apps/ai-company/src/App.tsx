/**
 * AICompany desktop — root.
 *
 * Surfaces (mirroring the Hermes desktop): Overview, Sessions, Models, Kanban.
 * Auth: bunta/bunta via node4 dashboard's /auth/password-login.
 */
import { useEffect, useState } from 'react';
import { Overview } from './components/Overview';
import { SessionsList } from './components/SessionsList';
import { ModelsList } from './components/ModelsList';
import { KanbanView } from './components/KanbanView';
import { LoginPanel } from './components/LoginPanel';
import { Titlebar, useApi, type AICompanyConnection, type AICompanyHealth } from './shared';

type View = 'overview' | 'sessions' | 'models' | 'kanban';
const VIEWS: { id: View; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'models', label: 'Models' },
  { id: 'kanban', label: 'Kanban' }
];

export function App() {
  const [view, setView] = useState<View>('overview');
  const [conn, setConn] = useState<AICompanyConnection | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<{ user_id: string; provider: string } | null>(null);

  useEffect(() => {
    void window.aicompany.connection.get().then(setConn);
  }, []);

  // Health probe — drives the titlebar pill color.
  const health = usePoll<AICompanyHealth>(async () => window.aicompany.proxy.health(), 5000);

  // Session probe — fires once after conn lands.
  const me = useApi<{ user_id: string; provider: string }>('/api/auth/me', conn?.effectiveRemoteBaseUrl);
  useEffect(() => {
    if (me.data?.user_id) {
      setUser(me.data);
      setLoggedIn(true);
    } else if (me.data === null && !me.loading) {
      setLoggedIn(false);
    }
  }, [me.data, me.loading]);

  const handleLogin = async (username: string, password: string) => {
    if (!conn) return { ok: false, error: 'No connection' };
    try {
      const r = await fetch(`${conn.effectiveRemoteBaseUrl}/auth/password-login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'basic', username, password })
      });
      if (r.status !== 200) return { ok: false, error: `HTTP ${r.status}` };
      const data = await r.json();
      if (!data.ok) return { ok: false, error: 'Server rejected login' };
      // Trigger a re-fetch of /api/auth/me
      setLoggedIn(true);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message || 'Network error' };
    }
  };

  const handleLogout = async () => {
    if (!conn) return;
    try {
      await fetch(`${conn.effectiveRemoteBaseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // ignore
    }
    setLoggedIn(false);
    setUser(null);
  };

  if (!conn) {
    return (
      <div className="app">
        <Titlebar baseUrl="" health={null} user={null} />
        <div className="content">
          <div className="empty">Initializing…</div>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="app">
        <Titlebar baseUrl={conn.label} health={health.data} user={null} />
        <LoginPanel baseUrl={conn.effectiveRemoteBaseUrl} onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app">
      <Titlebar
        baseUrl={conn.label}
        health={health.data}
        user={user}
        onSignOut={handleLogout}
      />
      <div className="main">
        <div className="sidebar">
          <div className="sidebar-section">
            <h3>Navigation</h3>
            {VIEWS.map((v) => (
              <button
                key={v.id}
                className={'sidebar-item ' + (view === v.id ? 'active' : '')}
                onClick={() => setView(v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="sidebar-section">
            <h3>Backend</h3>
            <div className="card-row" style={{ padding: '4px 0' }}>
              <div className="card-label">URL</div>
              <div className="card-value" style={{ fontSize: 11 }}>{conn.effectiveRemoteBaseUrl}</div>
            </div>
          </div>
        </div>
        <div className="content">
          {view === 'overview' && <Overview baseUrl={conn.effectiveRemoteBaseUrl} />}
          {view === 'sessions' && <SessionsList baseUrl={conn.effectiveRemoteBaseUrl} />}
          {view === 'models' && <ModelsList baseUrl={conn.effectiveRemoteBaseUrl} />}
          {view === 'kanban' && <KanbanView baseUrl={conn.effectiveRemoteBaseUrl} />}
        </div>
      </div>
    </div>
  );
}

/* Tiny polling hook — calls `fn` every `ms` while mounted. */
function usePoll<T>(fn: () => Promise<T>, ms: number): { data: T | null } {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    let alive = true;
    const tick = () => fn().then((d) => alive && setData(d));
    void tick();
    const id = setInterval(() => void tick(), ms);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [fn, ms]);
  return { data };
}
