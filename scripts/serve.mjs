#!/usr/bin/env node
// Vista previa local del sitio generado.
//
//   npm run preview   → construye y sirve dist/ en http://localhost:4321
//   npm run dev       → igual, y reconstruye solo cuando cambias contenido,
//                       fotos o archivos del sitio.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 4321;
const WATCH = process.argv.includes('--watch');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.yml': 'text/yaml; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.pdf': 'application/pdf',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4',
};

const build = () =>
  new Promise((resolve) => {
    const p = spawn(process.execPath, [path.join(ROOT, 'scripts/build.mjs')], { stdio: 'inherit' });
    p.on('exit', (code) => resolve(code === 0));
  });

await build();

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(DIST, p);
    if (!file.startsWith(DIST)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!p.endsWith('/')) return res.writeHead(301, { Location: p + '/' }).end();
      file = path.join(file, 'index.html');
    }
    if (!fs.existsSync(file)) {
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      return fs.createReadStream(path.join(DIST, '404.html')).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`\n→ Vista previa en http://localhost:${PORT}  (Ctrl+C para salir)\n`));

if (WATCH) {
  const IGNORE = /(^|[\\/])(dist|node_modules|\.git)([\\/]|$)/;
  let timer = null;
  let running = false;
  let again = false;
  const rebuild = async () => {
    if (running) return void (again = true);
    running = true;
    console.log('\n↻ Cambios detectados, reconstruyendo…');
    await build();
    running = false;
    if (again) {
      again = false;
      rebuild();
    }
  };
  fs.watch(ROOT, { recursive: true }, (_, name) => {
    if (!name || IGNORE.test(name)) return;
    clearTimeout(timer);
    timer = setTimeout(rebuild, 250);
  });
  console.log('Observando cambios en content/, uploads/ y las páginas del sitio.');
}
