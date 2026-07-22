/**
 * AICompany desktop — Login panel.
 */
import { useState } from 'react';

type Props = {
  baseUrl: string;
  onLogin: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
};

export function LoginPanel({ baseUrl, onLogin }: Props) {
  const [username, setUsername] = useState('bunta');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    const r = await onLogin(username, password);
    setBusy(false);
    if (!r.ok) setErr(r.error || 'Login failed');
  };

  return (
    <div className="login-panel">
      <h1>AICompany</h1>
      <p>Sign in to <code style={{ fontSize: 12 }}>{baseUrl}</code></p>
      <form className="login-form" onSubmit={submit}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus disabled={busy} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" disabled={busy} />
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        {err && <div className="error-msg">{err}</div>}
      </form>
    </div>
  );
}
