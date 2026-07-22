/**
 * AICompany desktop — Overview.
 *
 * Fetches the dashboard's /api/status (which the proxy forwards from node4)
 * and renders a few KPI tiles + the raw status fields.
 */
import { Panel, useApi, type AICompanyStatus } from '../shared';

type Status = AICompanyStatus & { data?: { version: string; gateway_state: string; active_sessions: number; profiles: string[]; auth_required: boolean; hermes_home: string; release_date: string; config_version: number; latest_config_version: number; can_update_hermes: boolean } };

export function Overview({ baseUrl }: { baseUrl: string }) {
  const { data, loading, error } = useApi<Status['data']>('/api/status', baseUrl);

  return (
    <Panel
      title="Overview"
      loading={loading}
      error={error}
      empty={!data ? 'No data' : undefined}
    >
      <div className="grid-3">
        <KPI label="Version" value={data!.version} />
        <KPI label="Gateway" value={data!.gateway_state} status={data!.gateway_state === 'running' ? 'ok' : 'warn'} />
        <KPI label="Active sessions" value={String(data!.active_sessions)} />
      </div>
      <h2>Backend</h2>
      <div className="card">
        <Row label="Base URL" value={baseUrl} />
        <Row label="Hermes home" value={data!.hermes_home} />
        <Row label="Release date" value={data!.release_date} />
        <Row
          label="Config version"
          value={`${data!.config_version} (latest: ${data!.latest_config_version})${data!.can_update_hermes ? ' · update available' : ''}`}
        />
        <Row label="Auth" value={data!.auth_required ? 'required' : 'not required'} />
        <Row label="Profiles" value={data!.profiles.join(', ')} />
      </div>
    </Panel>
  );
}

function KPI({ label, value, status }: { label: string; value: string; status?: 'ok' | 'warn' }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className={'kpi-value' + (status ? ' ' + status : '')}>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-row">
      <div className="card-label">{label}</div>
      <div className="card-value" style={{ fontSize: 11 }}>{value}</div>
    </div>
  );
}
