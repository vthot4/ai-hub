#!/usr/bin/env node
// Construye la demo estática (sin servidor) en ./dist-demo:
//  1. copia src/, public/ y la config a .demo/ (sin API ni middleware, que necesitan servidor),
//  2. superpone demo/src (avisos en lugar de retos, excepciones, métricas y admin),
//  3. ejecuta `astro build` con PUBLIC_DEMO=true y mueve el resultado a dist-demo/.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stage = join(root, '.demo');
const out = join(root, 'dist-demo');

rmSync(stage, { recursive: true, force: true });
rmSync(out, { recursive: true, force: true });
mkdirSync(stage);

for (const f of ['src', 'public', 'package.json', 'astro.config.mjs', 'tsconfig.json']) {
  cpSync(join(root, f), join(stage, f), { recursive: true });
}
rmSync(join(stage, 'src/pages/api'), { recursive: true, force: true });
rmSync(join(stage, 'src/middleware.ts'), { force: true });
cpSync(join(root, 'demo/src'), join(stage, 'src'), { recursive: true });
symlinkSync(join(root, 'node_modules'), join(stage, 'node_modules'), 'dir');

const astro = join(root, 'node_modules/astro/bin/astro.mjs');
const run = spawnSync(process.execPath, [astro, 'build', '--root', stage], {
  stdio: 'inherit',
  env: { ...process.env, PUBLIC_DEMO: 'true' },
});
if (run.status !== 0 || !existsSync(join(stage, 'dist'))) {
  console.error('Demo build failed');
  process.exit(run.status ?? 1);
}
cpSync(join(stage, 'dist'), out, { recursive: true });
rmSync(stage, { recursive: true, force: true });
console.log(`Static demo written to ${out}`);
