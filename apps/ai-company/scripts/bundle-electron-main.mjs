#!/usr/bin/env node
/**
 * Bundle the AICompany electron main + preload into dist/.
 *
 * Uses esbuild + a tiny plugin to resolve `../desktop/electron/<module>`
 * imports (esbuild's `alias` rejects `..` paths and the source is `.ts`).
 */
import { build } from 'esbuild';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const isDev = process.argv.includes('--dev');

const desktopElectron = path.join(root, '..', 'desktop', 'electron');
if (!existsSync(desktopElectron)) {
  console.error(`[aicompany-build] FATAL: ${desktopElectron} does not exist`);
  process.exit(1);
}

const outdir = path.join(root, 'dist');
mkdirSync(outdir, { recursive: true });

const desktopResolver = {
  name: 'desktop-electron-resolver',
  setup(b) {
    // Match both `../desktop/electron/...` and `../../desktop/electron/...`
    // (the second form is correct from `apps/ai-company/electron/main.ts`).
    b.onResolve({ filter: /^(?:\.\.\/|\.\.\/\.\.\/)desktop\/electron\// }, (args) => {
      const sub = args.path.replace(/^(?:\.\.\/|\.\.\/\.\.\/)desktop\/electron\//, '');
      const abs = path.join(desktopElectron, sub);
      for (const ext of ['.ts', '/index.ts', '.js', '/index.js']) {
        const candidate = ext.startsWith('/') ? path.join(abs, ext.slice(1)) : abs + ext;
        if (existsSync(candidate)) return { path: candidate };
      }
      return { path: abs + '.ts' };
    });
  }
};

async function buildOne(entry, outfile, format, external) {
  const t0 = Date.now();
  const r = await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    platform: 'node',
    target: 'node20',
    format,
    sourcemap: isDev ? 'inline' : false,
    minify: !isDev,
    external,
    plugins: [desktopResolver],
    logLevel: 'info'
  });
  if (r.errors.length) {
    console.error(`[aicompany-build] errors in ${entry}:`, r.errors);
    process.exit(1);
  }
  console.log(`[aicompany-build] ${path.basename(outfile)}: ${((Date.now() - t0) / 1000).toFixed(2)}s`);
}

console.log(`[aicompany-build] Bundling (dev=${isDev}) → ${outdir}`);

try {
  await buildOne(
    path.join(root, 'electron', 'main.ts'),
    path.join(outdir, 'electron-main.mjs'),
    'esm',
    ['electron', 'fsevents', 'node-pty']
  );
  await buildOne(
    path.join(root, 'electron', 'preload.ts'),
    path.join(outdir, 'electron-preload.js'),
    'cjs',
    ['electron']
  );
} catch (e) {
  console.error('[aicompany-build] FATAL:', e);
  process.exit(1);
}
