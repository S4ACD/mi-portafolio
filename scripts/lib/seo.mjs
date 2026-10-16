// SEO: añade al sitemap las páginas de caso nuevas y mantiene en llms.txt
// la lista de proyectos.

import fs from 'node:fs';
import path from 'node:path';
import { SITE, plain, projectUrl } from './util.mjs';

export function updateSitemap(out, content) {
  const file = path.join(out, 'sitemap.xml');
  if (!fs.existsSync(file)) return;
  let xml = fs.readFileSync(file, 'utf8');
  const entries = [];
  let latest = '';
  for (const p of content.published) {
    if (p.fecha > latest) latest = p.fecha;
    const es = projectUrl(p.slug, 'es', true);
    const en = projectUrl(p.slug, 'en', true);
    for (const loc of [es, en]) {
      if (xml.includes(`<loc>${loc}</loc>`)) continue;
      entries.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${p.fecha}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="es" href="${es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>
  </url>`);
    }
  }
  // Las páginas que listan proyectos cambian cuando entra uno nuevo.
  for (const loc of [`${SITE}/trabajo/`, `${SITE}/en/trabajo/`, `${SITE}/`, `${SITE}/en/`, `${SITE}/cv/`, `${SITE}/en/cv/`]) {
    xml = xml.replace(
      new RegExp(`(<loc>${loc.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}</loc>\\s*<lastmod>)([^<]+)(</lastmod>)`),
      (m, a, d, b) => (latest > d ? a + latest + b : m),
    );
  }
  if (entries.length) xml = xml.replace('</urlset>', entries.join('\n') + '\n\n</urlset>');
  fs.writeFileSync(file, xml);
}

const LLMS = /<!--\s*@auto:llms-(es|en)\s*-->[\s\S]*?<!--\s*\/@auto:llms-\1\s*-->/g;

export function updateLlms(out, content) {
  const file = path.join(out, 'llms.txt');
  if (!fs.existsSync(file)) return;
  const src = fs.readFileSync(file, 'utf8');
  const list = content.lists.trabajo;
  const txt = src.replace(LLMS, (_, lang) => {
    const lines = list.map((p) => {
      const d = p[lang];
      const tag = p.concepto ? (lang === 'en' ? ' (own concept)' : ' (concepto propio)') : '';
      const r = d.resultado?.cifra ? ` ${lang === 'en' ? 'Result' : 'Resultado'}: ${d.resultado.cifra} ${plain(d.resultado.texto)}.` : '';
      return `- [${plain(d.nombre)}](${projectUrl(p.slug, lang, true)})${tag}: ${plain(d.resumen)}${r}`;
    });
    return lines.join('\n');
  });
  fs.writeFileSync(file, txt);
}
