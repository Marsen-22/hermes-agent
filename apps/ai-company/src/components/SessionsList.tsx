/**
 * AICompany desktop — Sessions list.
 */
import { Panel, useApi } from '../shared';

type SessionsResp = { sessions: Array<{
  id: string;
  source?: string;
  display_name?: string | null;
  model?: string | null;
  started_at?: number;
}> };

export function SessionsList({ baseUrl }: { baseUrl: string }) {
  const { data, loading, error } = useApi<SessionsResp>('/api/sessions', baseUrl);
  const sessions = (data?.sessions ?? []).slice().sort((a, b) => (b.started_at || 0) - (a.started_at || 0));

  return (
    <Panel title="Sessions" loading={loading} error={error} empty={sessions.length === 0 ? 'No sessions yet' : undefined}>
      <div style={{ marginBottom: 8, color: 'var(--text-dim)', fontSize: 12 }}>
        {sessions.length} session{sessions.length !== 1 ? 's' : ''} from <code style={{ fontSize: 11 }}>{baseUrl}</code>
      </div>
      <div className="list">
        {sessions.map((s) => (
          <div key={s.id} className="list-item">
            <div>
              <div className="list-item-title">{s.display_name || s.id}</div>
              <div className="list-item-subtitle">
                {s.id}{s.model ? ` · ${s.model}` : ''}
              </div>
            </div>
            <div className="list-item-meta">
              {s.source && <div>{s.source}</div>}
              {s.started_at && <div>{new Date(s.started_at * 1000).toLocaleString()}</div>}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
