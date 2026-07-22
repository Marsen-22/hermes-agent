/**
 * AICompany desktop — Models list.
 *
 * Tries the proxy first, then falls back to LM Studio on the Mac (which is
 * the source of truth). Stops at the first endpoint that returns ≥ 1 model.
 */
import { Panel, useApi } from '../shared';

type ModelsResp = { data: Array<{ id: string; object?: string; owned_by?: string }> };

const FALLBACKS = [
  (baseUrl: string) => `${baseUrl}/v1/models`,
  () => 'http://127.0.0.1:8000/v1/models',
  () => 'http://10.0.0.1:8000/v1/models'
];

export function ModelsList({ baseUrl }: { baseUrl: string }) {
  // We probe sequentially; the first hook to return ≥ 1 model wins.
  const a = useApi<ModelsResp>('/v1/models', baseUrl);
  const b = useApi<ModelsResp>('/v1/models', baseUrl === 'http://127.0.0.1:8000/v1/models' ? undefined : 'http://127.0.0.1:8000/v1/models');
  const c = useApi<ModelsResp>('/v1/models', baseUrl === 'http://10.0.0.1:8000/v1/models' ? undefined : 'http://10.0.0.1:8000/v1/models');

  const tried = [a, b, c];
  const models =
    tried.find((r) => (r.data?.data?.length ?? 0) > 0)?.data?.data ?? [];

  const errors = tried.map((r) => r.error).filter(Boolean);
  const error = errors.length === tried.length ? tried[0].error : null;
  const loading = tried.some((r) => r.loading);

  return (
    <Panel
      title="Models"
      loading={loading}
      error={error}
      errorDetail={error ? <div className="card-row" style={{ marginTop: 8, color: 'var(--text-dim)', fontSize: 12 }}>Tried: {FALLBACKS.map((f, i) => <code key={i} style={{ marginRight: 8 }}>{f(baseUrl)}</code>)}</div> : undefined}
      empty={models.length === 0 ? 'No models available' : undefined}
    >
      <div style={{ marginBottom: 8, color: 'var(--text-dim)', fontSize: 12 }}>
        {models.length} model{models.length !== 1 ? 's' : ''} from the cluster
      </div>
      <div className="list">
        {models.map((m) => (
          <div key={m.id} className="list-item">
            <div>
              <div className="list-item-title">{m.id}</div>
              <div className="list-item-subtitle">{m.object || 'model'}</div>
            </div>
            <div className="list-item-meta">{m.owned_by || 'unknown'}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
