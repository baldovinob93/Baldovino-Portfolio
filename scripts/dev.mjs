import { createServer } from 'node:http';
import { existsSync, watch } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const build = () => import(`./build.mjs?at=${Date.now()}`);
await build();

let timer;
for (const folder of ['src', 'public']) {
  watch(path.join(root, folder), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => build().catch(console.error), 180);
  });
}

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };
const port = Number(process.env.PORT || 4173);
createServer(async (request, response) => {
  try {
    const rawPath = decodeURIComponent(new URL(request.url, `http://localhost:${port}`).pathname);
    const clean = path.normalize(rawPath).replace(/^([/\\]|\.\.(?:[/\\]|$))+/, '');
    let target = path.resolve(dist, clean);
    if (!target.startsWith(`${dist}${path.sep}`) && target !== dist) throw Error('Forbidden');
    if (existsSync(target) && !path.extname(target)) target = path.join(target, 'index.html');
    const body = await readFile(target);
    response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('No encontrado');
  }
}).listen(port, '127.0.0.1', () => console.log(`Portfolio listo en http://127.0.0.1:${port}/`));
