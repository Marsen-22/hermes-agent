/**
 * AICompany desktop — shared types and small hooks.
 *
 * A single source of truth for the types that the preload script exposes via
 * `window.aicompany`, the shared `useApi` hook for fetch + loading + error
 * state, and a `<Panel>` wrapper that handles loading / error / empty / data
 * states uniformly across the four surfaces.
 */
import { useEffect, useState } from 'react';

/* IPC channel types (mirrors electron/preload.ts) */

export type AICompanyConnection = {
  defaultRemoteBaseUrl: string;
  effectiveRemoteBaseUrl: string;
  modeIsRemote: boolean;
  label: string;
};

export type AICompanyHealth = {
  ok: boolean;
  status?: number;
  body?: string;
  error?: string;
};

export type AICompanyStatus = {
  ok: boolean;
  status?: number;
  data?: any;
  error?: string;
  body?: string;
};

declare global {
  interface Window {
    aicompany: {
      connection: { get(): Promise<AICompanyConnection> };
      proxy: { health(): Promise<AICompanyHealth> };
      status: { fetch(): Promise<AICompanyStatus> };
    };
  }
}

/* Generic fetch hook — handles alive-flag, loading, error, JSON parse. */

export function useApi<T>(path: string, baseUrl: string | undefined): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!baseUrl) return;
    let alive = true;
    setLoading(true);
    fetch(`${baseUrl}${path}`, { credentials: 'include' })
      .then(async (r) => {
        if (!alive) return;
        if (!r.ok) {
          setError(`HTTP ${r.status}`);
          return;
        }
        setData(await r.json());
        setError(null);
      })
      .catch((e) => alive && setError(e.message || 'Network error'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [path, baseUrl]);

  return { data, loading, error };
}

/* Titlebar — single source of truth for the chrome across all states. */

export function Titlebar({
  baseUrl,
  health,
  user,
  onSignOut
}: {
  baseUrl: string;
  health: AICompanyHealth | null;
  user: { user_id: string; provider: string } | null;
  onSignOut?: () => void;
}) {
  const connected = health?.ok;
  return (
    <div className="titlebar">
      <div className="titlebar-title">AICompany</div>
      <div className="titlebar-spacer" />
      {baseUrl && (
        <div className={'titlebar-pill ' + (connected ? 'ok' : 'error')}>
          <div className="dot" />
          {connected ? `Connected: ${baseUrl}` : health?.error || 'Disconnected'}
        </div>
      )}
      {user && (
        <div className="titlebar-pill">
          <div className="dot" />
          {user.user_id} · {user.provider}
        </div>
      )}
      {onSignOut && (
        <button onClick={onSignOut} style={{ marginLeft: 8 }}>
          Sign out
        </button>
      )}
    </div>
  );
}

/* Panel — uniform loading / error / empty / data states. */

export function Panel({
  title,
  loading,
  error,
  errorDetail,
  empty,
  children
}: {
  title: string;
  loading?: boolean;
  error?: string | null;
  errorDetail?: React.ReactNode;
  empty?: boolean | string;
  children?: React.ReactNode;
}) {
  if (loading) {
    return (
      <div>
        <h1>{title}</h1>
        <div className="empty">Loading…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <h1>{title}</h1>
        <div className="card" style={{ borderColor: 'var(--error)' }}>
          <h3 style={{ color: 'var(--error)' }}>Failed to load</h3>
          <div className="card-row">
            <div className="card-label">Error</div>
            <div className="card-value">{error}</div>
          </div>
          {errorDetail}
        </div>
      </div>
    );
  }
  if (empty) {
    return (
      <div>
        <h1>{title}</h1>
        <div className="empty">{typeof empty === 'string' ? empty : 'Nothing to show'}</div>
      </div>
    );
  }
  return <div>{children}</div>;
}
