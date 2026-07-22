/**
 * AICompany desktop — Kanban view.
 *
 * The dashboard exposes /api/kanban/tasks if the kanban plugin is enabled.
 * Otherwise we render an empty state with a hint to use the full Hermes UI.
 */
import { Panel, useApi } from '../shared';

const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--text-dim)',
  running: 'var(--accent)',
  done: 'var(--success)',
  blocked: 'var(--warn)',
  failed: 'var(--error)',
  crashed: 'var(--error)',
  timed_out: 'var(--warn)',
  released: 'var(--text-dim)'
};

type Task = {
  id: string;
  title: string;
  body?: string | null;
  assignee?: string | null;
  status: string;
  priority?: number;
  created_at: number;
  branch_name?: string | null;
};

const STATUS_ORDER = ['running', 'pending', 'blocked', 'failed', 'crashed', 'timed_out', 'released', 'done'];

export function KanbanView({ baseUrl }: { baseUrl: string }) {
  const { data, loading, error } = useApi<{ tasks?: Task[] } | Task[]>('/api/kanban/tasks', baseUrl);
  const tasks: Task[] = Array.isArray(data) ? data : (data?.tasks ?? []);
  const sorted = tasks.slice().sort((a, b) => {
    const sa = STATUS_ORDER.indexOf(a.status);
    const sb = STATUS_ORDER.indexOf(b.status);
    return sa !== sb ? sa - sb : b.created_at - a.created_at;
  });

  return (
    <Panel
      title="Kanban"
      loading={loading}
      error={error}
      empty={sorted.length === 0 ? 'No tasks (or kanban API not exposed by the dashboard). Use the full Hermes dashboard UI to manage tasks.' : undefined}
    >
      <div style={{ marginBottom: 8, color: 'var(--text-dim)', fontSize: 12 }}>
        {sorted.length} task{sorted.length !== 1 ? 's' : ''}
      </div>
      <div className="list">
        {sorted.map((t) => (
          <div key={t.id} className="list-item">
            <div>
              <div className="list-item-title">{t.title}</div>
              <div className="list-item-subtitle">
                {t.id} {t.assignee ? ` · ${t.assignee}` : ''} {t.branch_name ? ` · ${t.branch_name}` : ''}
              </div>
              {t.body && (
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4, maxWidth: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.body}
                </div>
              )}
            </div>
            <div className="list-item-meta">
              <div style={{ color: STATUS_COLORS[t.status] || 'var(--text-dim)' }}>{t.status}</div>
              {t.priority ? <div>p={t.priority}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
