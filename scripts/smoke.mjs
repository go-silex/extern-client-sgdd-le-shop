// Contrôle automatique du site : node scripts/smoke.mjs (vérifie le catalogue, les photos et la syntaxe).
// Checks: app.js parses, catalog loads, every product is complete and its image exists.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const fail = [];
for (const f of ['app.js', 'admin.js']) execFileSync(process.execPath, ['--check', f]);

const ctx = { window: {} };
vm.runInNewContext(readFileSync('products.js', 'utf8'), ctx);
const { PRODUCTS, CATEGORIES, PHOTO_LIBRARY } = ctx.window;
if (!Array.isArray(PRODUCTS) || PRODUCTS.length === 0) fail.push('no products');
const cats = new Set((CATEGORIES || []).map(c => c.id));
const ids = new Set();

for (const p of PRODUCTS || []) {
  if (ids.has(p.id)) fail.push(`duplicate id ${p.id}`);
  ids.add(p.id);
  for (const k of ['id', 'cat', 'type', 'name', 'desc']) if (!p[k]) fail.push(`${p.id}: missing ${k}`);
  if (!cats.has(p.cat)) fail.push(`${p.id}: unknown category ${p.cat}`);
  if (typeof p.price !== 'number' || p.price <= 0) fail.push(`${p.id}: bad price`);
  if (!p.colors?.length || !p.sizes?.length) fail.push(`${p.id}: no colors or sizes`);
  if (typeof p.stock !== 'number') fail.push(`${p.id}: no stock`);
  if (!p.giftCard && !p.imgs?.length) fail.push(`${p.id}: no images`);
  for (const img of p.imgs || []) if (!existsSync(img)) fail.push(`${p.id}: image not found ${img}`);
}

for (const img of PHOTO_LIBRARY || []) if (!existsSync(img)) fail.push(`library: image not found ${img}`);

// Every literal asset path used in the views must exist.
for (const f of ['app.js', 'admin.js']) for (const m of readFileSync(f, 'utf8').matchAll(/assets\/photos\/[a-z0-9/-]+\.jpg/g)) if (!existsSync(m[0])) fail.push(`${f}: missing ${m[0]}`);

const html = readFileSync('index.html', 'utf8');
for (const ref of html.match(/(?:src|href)="(?!https?:|#|data:)([^"]+)"/g) || []) {
  const path = ref.split('"')[1].split('?')[0];
  if (!existsSync(path)) fail.push(`index.html: missing ${path}`);
}

if (fail.length) { console.error(fail.join('\n')); process.exit(1); }
console.log(`smoke ok: ${PRODUCTS.length} products, ${cats.size} categories`);
