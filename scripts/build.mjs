#!/usr/bin/env node
// Build del sitio: copia el sitio a dist/, genera las zonas de proyectos
// desde content/proyectos/ y crea las páginas de caso nuevas.
//
//   npm run build          → dist/ listo para publicar (Vercel lo ejecuta solo)
//   npm run check          → solo valida el contenido, sin escribir nada

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent } from './lib/content.mjs';
import { createImagePipeline } from './lib/images.mjs';
import { workPage, workItemList, CARD_WIDTHS } from './lib/render-work.mjs';
import { homeWork, homeMore, cvCards, cvMore, cvList } from './lib/render-home.mjs';
import { casePage } from './lib/render-case.mjs';
import { updateSitemap, updateLlms } from './lib/seo.mjs';
import { loadArticles, buildArticles, sitemapArticles, llmsArticles } from './lib/articles.mjs';
import { loadReviews, reviewsBlock } from './lib/reviews.mjs';
import { createOgMaker } from './lib/og.mjs';
import { BuildError, numberWord } from './lib/util.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist');
const CACHE = path.join(ROOT, 'node_modules/.cache/ac-images');
const CHECK_ONLY = process.argv.includes('--check');

// Lo que vive en el repositorio pero no se publica.
const EXCLUDE = new Set([
  'node_modules', 'dist', 'scripts', 'content', 'uploads', '.git', '.github', '.vercel', '.cache',
  '__pycache__', '.gitignore', 'package.json', 'package-lock.json', 'vercel.json', 'README.md',
  'CAMBIOS.md', 'GUIA.md', '.DS_Store',
]);
const EXCLUDE_EXT = new Set(['.py', '.md']);

const t0 = Date.now();
const log = (...a) => console.log(...a);

function copySite(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    if (src === ROOT && e.isFile() && EXCLUDE_EXT.has(path.extname(e.name))) continue;
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) copySite(s, d);
    else if (e.isFile()) fs.copyFileSync(s, d);
  }
}

function htmlFiles(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const MARKER = /<!--\s*@auto:([a-z0-9-]+)(?::[^>]*?)?\s*-->[\s\S]*?<!--\s*\/@auto:\1\s*-->/g;

async function main() {
  const content = loadContent(ROOT);
  log(`✓ Contenido: ${content.published.length} proyectos publicados (${content.all.length} en total)`);
  const articles = loadArticles(ROOT);
  const reviews = loadReviews(ROOT);
  log(`✓ Artículos: ${articles.length} publicados`);
  if (CHECK_ONLY) return;

  // Un proyecto con página automática reemplaza la página hecha a mano que
  // tenga en trabajo/<slug>/ (esa carpeta puede quedarse en el repositorio).
  const replacedByTemplate = content.published.filter(
    (p) => p.pagina === 'plantilla' && ['', 'en/'].some((pre) => fs.existsSync(path.join(ROOT, pre, 'trabajo', p.slug, 'index.html'))),
  );
  if (replacedByTemplate.length)
    log(`· Con diseño de plantilla (reemplazan la página hecha a mano): ${replacedByTemplate.map((p) => p.slug).join(', ')}`);

  fs.rmSync(OUT, { recursive: true, force: true });
  copySite(ROOT, OUT);

  const images = createImagePipeline({ root: ROOT, outDir: OUT, cacheDir: CACHE });
  const og = createOgMaker({ root: ROOT, outDir: OUT, cacheDir: CACHE });

  // Imagen de portada de cada proyecto, en el tamaño de tarjeta.
  const cardImgs = new Map();
  for (const p of content.published) {
    if (p.portada.estilo === 'foto' && p.portada.imagen)
      cardImgs.set(p.slug, await images.get(p.portada.imagen, { slug: p.slug, widths: CARD_WIDTHS }));
  }

  // Pie de página real del sitio (para las páginas generadas)
  const footerOf = (lang) => {
    const src = fs.readFileSync(path.join(ROOT, lang === 'en' ? 'en/trabajo/index.html' : 'trabajo/index.html'), 'utf8');
    const m = /<footer[\s\S]*?<\/footer>/.exec(src);
    return m ? m[0] : '';
  };

  const lists = content.lists;
  const renderers = {
    trabajo: (lang) => workPage(lists.trabajo, lang, cardImgs),
    'trabajo-schema': (lang) => workItemList(lists.trabajo, lang),
    inicio: (lang) => homeWork(lists.inicio, lang, cardImgs),
    'inicio-mas': (lang) => homeMore(lists.trabajo.length, lang),
    'trabajo-n': () => String(lists.trabajo.length),
    cv: (lang) => cvCards(lists.cv, lang, cardImgs),
    'cv-dental': (lang) => cvCards(lists.cv_dental, lang, cardImgs, { dental: true }),
    'cv-dental-n': (lang) => numberWord(lists.cv_dental.length, lang),
    'cv-mas': (lang) => cvMore(lists.trabajo.length, lang),
    'cv-lista': (lang) => cvList([...lists.cv_dental, ...lists.cv], lang),
    resenas: (lang) => reviewsBlock(reviews, lang),
  };

  // 1. Zonas marcadas en las páginas existentes
  let replaced = 0;
  for (const file of htmlFiles(OUT)) {
    const rel = path.relative(OUT, file);
    const lang = rel.startsWith('en' + path.sep) ? 'en' : 'es';
    const src = fs.readFileSync(file, 'utf8');
    if (!src.includes('@auto:')) continue;
    let out = src;
    for (const m of [...src.matchAll(MARKER)]) {
      const fn = renderers[m[1]];
      if (!fn) throw new BuildError(`${rel}: zona automática desconocida "@auto:${m[1]}".`);
      out = out.replace(m[0], () => fn(lang));
      replaced++;
    }
    fs.writeFileSync(file, out);
  }
  log(`✓ Zonas automáticas actualizadas: ${replaced}`);

  // 2. Páginas de caso generadas
  const order = lists.trabajo.length ? lists.trabajo : content.published;
  let pages = 0;
  for (const p of content.published.filter((x) => x.pagina === 'plantilla')) {
    const i = order.indexOf(p);
    const next = i >= 0 ? order[(i + 1) % order.length] : order[0];
    for (const lang of ['es', 'en']) {
      const html = await casePage({
        p,
        lang,
        next: next && next !== p ? next : null,
        images,
        footer: footerOf(lang),
        slugToImg: (q) => cardImgs.get(q.slug) || null,
        og,
      });
      const dir = path.join(OUT, lang === 'en' ? 'en' : '', 'trabajo', p.slug);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), html);
      pages++;
    }
  }
  log(`✓ Páginas de caso generadas: ${pages}`);

  // 2b. Artículos (páginas, índice y RSS)
  const artPages = await buildArticles({ out: OUT, articles, images, footerOf, projects: content, ogMaker: og });
  log(`✓ Páginas de artículos generadas: ${artPages}`);

  // 3. SEO: sitemap y llms.txt
  updateSitemap(OUT, content);
  updateLlms(OUT, content);
  sitemapArticles(OUT, articles);
  llmsArticles(OUT, articles);

  // 4. Verificación final
  const problems = [];
  for (const file of htmlFiles(OUT)) {
    const s = fs.readFileSync(file, 'utf8');
    if (/@auto:/.test(s)) problems.push(`${path.relative(OUT, file)}: quedó una zona automática sin generar.`);
    for (const m of s.matchAll(/href="(\/(?:en\/)?trabajo\/[a-z0-9-]+\/)"/g)) {
      if (!fs.existsSync(path.join(OUT, m[1], 'index.html'))) problems.push(`${path.relative(OUT, file)}: enlace roto a ${m[1]}`);
    }
    for (const m of s.matchAll(/(?:src|srcset)="(\/assets\/proyectos\/[^"\s]+)/g)) {
      if (!fs.existsSync(path.join(OUT, m[1]))) problems.push(`${path.relative(OUT, file)}: imagen inexistente ${m[1]}`);
    }
    for (const m of s.matchAll(/<(?:source|video)\b[^>]*?\b(?:src|poster)="(\/[^"]+)"/g)) {
      if (!fs.existsSync(path.join(OUT, decodeURI(m[1])))) problems.push(`${path.relative(OUT, file)}: archivo inexistente ${m[1]}`);
    }
  }
  if (problems.length) throw new BuildError('La verificación encontró problemas:\n  · ' + [...new Set(problems)].join('\n  · '));

  const st = images.stats();
  log(`✓ Imágenes: ${st.processed} nuevas, ${st.fromCache} desde caché`);
  log(`✓ Imágenes para compartir: ${og.summary()}`);
  log(`✓ Listo en ${((Date.now() - t0) / 1000).toFixed(1)} s → dist/`);
}

main().catch((e) => {
  if (e instanceof BuildError) {
    console.error('\n✗ ' + e.message + '\n');
    process.exit(1);
  }
  console.error(e);
  process.exit(1);
});
