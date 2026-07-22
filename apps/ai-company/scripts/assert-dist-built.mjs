// Build-time guard: refuse to package if the renderer bundle is missing.
// Mirrors apps/desktop/scripts/assert-dist-built.mjs (kept self-contained —
// no cross-app import). Run as `postbuild` so any packaging path inherits it.
import { existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = resolve(fileURLToPath(import.meta.url), '..', '..', 'dist');

const checks = [
  { cond: !existsSync(distDir) || !statSync(distDir).isDirectory(), msg: `no dist/ at ${distDir}` },
  { cond: !existsSync(join(distDir, 'index.html')), msg: 'dist/index.html missing' },
  { cond: existsSync(join(distDir, 'index.html')) && statSync(join(distDir, 'index.html')).size === 0, msg: 'dist/index.html is empty' },
  { cond: !existsSync(join(distDir, 'assets')) || !readdirSync(join(distDir, 'assets')).some((f) => f.endsWith('.js')), msg: 'dist/assets/ has no .js bundle' }
];

const failed = checks.find((c) => c.cond);
if (failed) {
  console.error(`\n✗ assert-dist-built: ${failed.msg}`);
  console.error('  Re-run the build: cd apps/ai-company && npm run build\n');
  process.exit(1);
}
console.log('✓ assert-dist-built: dist/index.html + assets present');
