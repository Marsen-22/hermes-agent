/**
 * AICompany desktop — preload.
 *
 * Exposes a small typed IPC surface to the renderer. Pattern matches
 * apps/desktop/electron/preload.ts: whitelist of channels, no nodeIntegration.
 */
import { contextBridge, ipcRenderer } from 'electron';

const api = {
  connection: {
    get: () => ipcRenderer.invoke('aicompany:connection:get') as Promise<{
      defaultRemoteBaseUrl: string;
      effectiveRemoteBaseUrl: string;
      modeIsRemote: boolean;
      label: string;
    }>
  },
  proxy: {
    health: () => ipcRenderer.invoke('aicompany:proxy:health') as Promise<{
      ok: boolean;
      status?: number;
      body?: string;
      error?: string;
    }>
  },
  status: {
    fetch: () => ipcRenderer.invoke('aicompany:status:fetch') as Promise<{
      ok: boolean;
      status?: number;
      data?: any;
      error?: string;
      body?: string;
    }>
  }
};

contextBridge.exposeInMainWorld('aicompany', api);

export type AICompanyAPI = typeof api;
