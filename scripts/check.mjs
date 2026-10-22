import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const base = `/${(process.env.SITE_BASE_PATH || '/').split('/').filter(Boolean).join('/')}${(process.env.SITE_BASE_PATH || '/') === '/' ? '' : '/'}`;
const pages = [];
async function walk(folder) {
  for (const item of await readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, item.name);
    if (item.isDirectory()) await walk(file);
    else if (item.name.endsWith('.html')) pages.push(file);
  }
}
await walk(dist);
const errors = [];
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const [, attr, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(value)) continue;
    if (value.startsWith('#')) {
      if (!ids.has(value.slice(1))) errors.push(`${page}: missing #${value.slice(1)}`);
      continue;
    }
    const [pathname, fragment] = value.split('#');
    if (!pathname.startsWith(base)) { errors.push(`${page}: path outside base ${value}`); continue; }
    let target = path.join(dist, pathname.slice(base.length));
    try { if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html'); await stat(target); }
    catch { errors.push(`${page}: missing ${value}`); continue; }
    if (fragment && target.endsWith('.html')) {
      const targetHtml = await readFile(target, 'utf8');
      if (!targetHtml.includes(`id="${fragment}"`)) errors.push(`${page}: missing target ${value}`);
    }
  }
  if (!html.includes('name="description"') || !html.includes('<main id="main">')) errors.push(`${page}: required metadata/landmark missing`);
  for (const [, img] of html.matchAll(/<img\b([^>]+)>/g)) if (!/\balt="[^"]*"/.test(img)) errors.push(`${page}: image missing alt`);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Checked ${pages.length} HTML pages, local links, images, anchors and metadata.`);
