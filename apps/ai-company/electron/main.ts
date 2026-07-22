/**
 * AICompany desktop — main process.
 *
 * Reuses the Hermes desktop baseline (apps/desktop/electron/) for one helper:
 *   - hostLabelFromBaseUrl: turns a URL into a short "host:port" label.
 *
 * Default backend is the Mac's Nginx proxy on http://127.0.0.1:9121, which
 * forwards to node4's dashboard. Override with AI_COMPANY_DEFAULT_URL.
 */
import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

// ESM equivalents of __filename / __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { hostLabelFromBaseUrl } from '../../desktop/electron/connection-config';

const DEFAULT_REMOTE_BASE_URL = process.env.AI_COMPANY_DEFAULT_URL || 'http://127.0.0.1:9121';

let mainWindow: BrowserWindow | null = null;

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'AICompany',
    backgroundColor: '#0d1117',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  const dev = process.env.AI_COMPANY_DEV_SERVER;
  void (dev ? win.loadURL(dev) : win.loadFile(path.join(__dirname, '..', 'dist', 'index.html')));
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });
  return win;
}

function httpGet(url: string, timeoutMs: number): Promise<{ ok: boolean; status?: number; body?: string; error?: string }> {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c.toString()));
      res.on('end', () => resolve({ ok: res.statusCode === 200, status: res.statusCode, body: body.trim() }));
    });
    req.on('error', (e: Error) => resolve({ ok: false, error: e.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'timeout' });
    });
  });
}

ipcMain.handle('aicompany:connection:get', () => ({
  defaultRemoteBaseUrl: DEFAULT_REMOTE_BASE_URL,
  effectiveRemoteBaseUrl: DEFAULT_REMOTE_BASE_URL,
  modeIsRemote: true,
  label: hostLabelFromBaseUrl(DEFAULT_REMOTE_BASE_URL)
}));

ipcMain.handle('aicompany:proxy:health', () => httpGet(`${DEFAULT_REMOTE_BASE_URL}/healthz`, 5000));

ipcMain.handle('aicompany:status:fetch', async () => {
  const r = await httpGet(`${DEFAULT_REMOTE_BASE_URL}/api/status`, 10000);
  if (!r.ok) return r;
  try {
    return { ok: true, status: r.status, data: JSON.parse(r.body || '') };
  } catch {
    return { ok: false, status: r.status, body: r.body };
  }
});

app.whenReady().then(() => {
  try {
    mainWindow = createMainWindow();
  } catch (e) {
    dialog.showErrorBox('AICompany', 'Failed to create window: ' + (e instanceof Error ? e.message : String(e)));
  }
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      try { mainWindow = createMainWindow(); } catch { /* ignore */ }
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
