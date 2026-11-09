// Builds the Shopify product import CSV from ../../products.js.
// Images are referenced by public URL (the demo host); Shopify downloads them at import.
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const ROOT = new URL('../../', import.meta.url).pathname;
const IMG_BASE = process.env.IMG_BASE || 'https://demo.gosilex.com/sgdd-863f/';
const ctx = { window: {} };
vm.runInNewContext(readFileSync(ROOT + 'products.js', 'utf8'), ctx);
const { PRODUCTS, CATEGORIES } = ctx.window;

const catTag = id => CATEGORIES.find(c => c.id === id).short;           // used by automated collections
const GRAMS = { Hoodie: 600, Sweat: 550, 'T-shirt': 200, Veste: 800, Polo: 250, Casquette: 120, Accessoire: 150, Skate: 1500, Surf: 300, Déco: 300, 'Carte cadeau': 0 };
const GRAMS_BY_ID = { 'surfskate-wave': 3500, 'sticker-fanion': 10, 'fanion-sgdd': 80, 'ballon-harlem': 600, 'affiche-surf-chopper': 1200 };
// Which photo shows which colour (Variant Image).
const COLOR_IMG = {
  'hoodie-phare-chopper': { Rose: 'fb/hoodie-rose.jpg', 'Crème': 'crop-hoodie-creme.jpg' },
  'tee-phare-chopper': { Rose: 'fb/tee-rose.jpg', Ciel: 'fb/tee-ciel.jpg', 'Crème': 'fb/tee-creme-dos.jpg' },
  'tee-enfant': { Rose: 'fb/tee-enfant-rose.jpg', 'Crème': 'fb/tee-enfant-creme.jpg' },
  'sweat-sgdd-college': { Vert: 'fb/sweat-vert.jpg' }
};

const COLS = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value',
  'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
  'Variant Fulfillment Service', 'Variant Price', 'Variant Requires Shipping', 'Variant Taxable',
  'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card', 'SEO Title', 'SEO Description',
  'Variant Image', 'Variant Weight Unit', 'Status'];

const esc = v => {
  const s = String(v ?? '');
  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const html = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const url = p => p.startsWith('http') ? p : IMG_BASE + p;
const short = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();

const rows = [];
let variantCount = 0;
for (const p of PRODUCTS) {
  const gift = !!p.giftCard;
  const colorName = gift ? 'Montant' : 'Couleur';
  const sizes = gift || p.sizes.length === 1 ? null : p.sizes;
  const variants = [];
  for (const c of p.colors) {
    for (const sz of sizes || [null]) variants.push({ color: c.name, size: sz, price: c.price || p.price });
  }
  // Spread the demo stock over the variants (Marco recounts before launch).
  const per = Math.floor((p.stock || 0) / variants.length);
  let rest = (p.stock || 0) - per * variants.length;
  const imgs = (p.imgs || []).map(i => i.replace(/^assets\/photos\//, 'assets/photos/'));
  const tags = [catTag(p.cat), p.type, p.badge ? 'badge:' + p.badge : '', p.priceConfirmed === false ? 'prix-a-valider' : ''].filter(Boolean).join(', ');
  const body = `<p>${html(p.desc)}</p>` + (p.details?.length ? `<ul>${p.details.map(d => `<li>${html(d)}</li>`).join('')}</ul>` : '');
  const grams = GRAMS_BY_ID[p.id] ?? GRAMS[p.type] ?? 300;
  const n = Math.max(variants.length, imgs.length);
  for (let i = 0; i < n; i++) {
    const v = variants[i];
    const r = Object.fromEntries(COLS.map(c => [c, '']));
    r.Handle = p.id;
    if (i === 0) {
      Object.assign(r, {
        Title: p.name, 'Body (HTML)': body, Vendor: p.cat === 'jaym' ? "Jay'M Riding" : p.id === 'deck-santa-cruz' ? 'Santa Cruz' : p.id === 'ballon-harlem' ? 'Spalding' : 'SGDD Le Shop',
        Type: p.type, Tags: tags, Published: 'TRUE', 'Gift Card': gift ? 'TRUE' : 'FALSE',
        'SEO Title': `${p.name} | SGDD Le Shop`, 'SEO Description': p.desc.slice(0, 155), Status: 'active',
        'Option1 Name': colorName, 'Option2 Name': sizes ? 'Taille' : ''
      });
    }
    if (v) {
      variantCount++;
      const qty = per + (rest-- > 0 ? 1 : 0);
      Object.assign(r, {
        'Option1 Value': v.color, 'Option2 Value': v.size || '',
        'Variant SKU': ['SGDD', short(p.id).slice(0, 10), short(v.color).slice(0, 4), v.size ? short(v.size) : ''].filter(Boolean).join('-'),
        'Variant Grams': grams, 'Variant Inventory Tracker': gift ? '' : 'shopify', 'Variant Inventory Qty': gift ? '' : qty,
        'Variant Inventory Policy': 'deny', 'Variant Fulfillment Service': 'manual', 'Variant Price': v.price.toFixed(2),
        'Variant Requires Shipping': gift ? 'FALSE' : 'TRUE', 'Variant Taxable': gift ? 'FALSE' : 'TRUE', 'Variant Weight Unit': 'g',
        'Variant Image': COLOR_IMG[p.id]?.[v.color] ? url('assets/photos/' + COLOR_IMG[p.id][v.color]) : ''
      });
    }
    if (imgs[i]) Object.assign(r, { 'Image Src': url(imgs[i]), 'Image Position': i + 1, 'Image Alt Text': `${p.name}` });
    rows.push(r);
  }
}

const csv = [COLS.join(','), ...rows.map(r => COLS.map(c => esc(r[c])).join(','))].join('\n') + '\n';
writeFileSync(new URL('../import/produits-shopify.csv', import.meta.url), csv);
const allImgs = [...new Set(rows.flatMap(r => [r['Image Src'], r['Variant Image']]).filter(Boolean))];
writeFileSync(new URL('../import/image-urls.txt', import.meta.url), allImgs.join('\n') + '\n');
console.log(`${PRODUCTS.length} products, ${variantCount} variants, ${rows.length} rows, ${allImgs.length} image URLs`);
