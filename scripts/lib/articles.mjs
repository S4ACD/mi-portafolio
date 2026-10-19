// Artículos: content/articulos/*.yml → /articulos/<slug>/ y /en/articulos/<slug>/,
// más el índice /articulos/, el feed RSS y sus entradas en el sitemap.
//
// Cada archivo trae español e inglés juntos (como los proyectos). Si un
// artículo no tiene título y texto en inglés, solo se publica en español.

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { marked } from 'marked';
import { BuildError, SITE, esc, attr, inline, plain, projectUrl } from './util.mjs';
import { pictureHtml } from './images.mjs';

const T = {
  es: {
    index: 'Artículos',
    indexLead: 'Lo que aprendo diseñando y programando para marcas reales: velocidad web, SEO, identidad visual y contenido. Escrito para dueños de negocio, sin tecnicismos de más.',
    min: (n) => `${n} min de lectura`,
    back: 'Artículos',
    home: 'Inicio',
    author: 'Escrito por Alexander Caro, diseñador y desarrollador web en Bogotá. Diseña y programa marcas, sitios y contenido para negocios de Colombia y del exterior.',
    authorLink: 'Conoce mi trabajo',
    related: 'El caso detrás de este artículo',
    seeCase: 'Ver el caso completo',
    more: 'Más artículos',
    ctaTitle: '¿Quieres que revise tu caso?',
    ctaText: 'Cuéntame qué necesitas y te respondo en menos de 24 horas con lo que yo haría primero.',
    ctaWa: 'Escríbeme por WhatsApp',
    wa: (t) => `¡Hola Alexander! Leí tu artículo «${t}» y quiero hablar de mi proyecto.`,
    empty: 'Muy pronto, el primer artículo.',
    locale: 'es_CO',
    months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    date: (d, m, y, M) => `${d} de ${M[m]} de ${y}`,
    feed: 'Artículos de Alexander Caro',
  },
  en: {
    index: 'Articles',
    indexLead: 'What I learn designing and coding for real brands: web speed, SEO, visual identity and content. Written for business owners, without unnecessary jargon.',
    min: (n) => `${n} min read`,
    back: 'Articles',
    home: 'Home',
    author: 'Written by Alexander Caro, a web designer and developer in Bogotá. He designs and builds brands, websites and content for businesses in Colombia and abroad.',
    authorLink: 'See my work',
    related: 'The case behind this article',
    seeCase: 'See the full case',
    more: 'More articles',
    ctaTitle: 'Want me to look at your case?',
    ctaText: "Tell me what you need and I'll reply within 24 hours with what I would do first.",
    ctaWa: 'Message me on WhatsApp',
    wa: (t) => `Hi Alexander! I read your article "${t}" and I'd like to talk about my project.`,
    empty: 'The first article is coming soon.',
    locale: 'en_US',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    date: (d, m, y, M) => `${M[m]} ${d}, ${y}`,
    feed: 'Articles by Alexander Caro',
  },
};

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
const isEmpty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
const merge = (base, over) => {
  if (!isObj(base) || !isObj(over)) return isEmpty(over) ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = merge(base[k], v);
  return out;
};
const day = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v || '').slice(0, 10));
export const articleUrl = (slug, lang, abs = false) => (abs ? SITE : '') + (lang === 'en' ? '/en' : '') + `/articulos/${slug}/`;
const indexUrl = (lang, abs = false) => (abs ? SITE : '') + (lang === 'en' ? '/en' : '') + '/articulos/';

export function loadArticles(root) {
  const dir = path.join(root, 'content/articulos');
  if (!fs.existsSync(dir)) return [];
  const errors = [];
  const list = [];
  for (const f of fs.readdirSync(dir).filter((x) => /\.ya?ml$/.test(x)).sort()) {
    const slug = f.replace(/\.ya?ml$/, '');
    let raw;
    try {
      raw = (yaml.safeLoad || yaml.load)(fs.readFileSync(path.join(dir, f), 'utf8')) ?? {};
    } catch (e) {
      throw new BuildError(`YAML inválido en content/articulos/${f}: ${e.message}`);
    }
    const es = raw.es || raw;
    const enOwn = raw.en || {};
    const a = {
      slug,
      file: f,
      publicado: es.publicado !== false,
      fecha: day(es.fecha),
      es,
      en: merge(es, enOwn),
      hasEn: !!(enOwn.titulo && enOwn.cuerpo),
    };
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) errors.push(`content/articulos/${f}: el nombre del archivo debe ir en minúsculas con guiones.`);
    if (!es.titulo) errors.push(`content/articulos/${f}: falta el título.`);
    if (!es.cuerpo) errors.push(`content/articulos/${f}: falta el texto del artículo.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.fecha)) errors.push(`content/articulos/${f}: la fecha debe ser AAAA-MM-DD.`);
    list.push(a);
  }
  if (errors.length) throw new BuildError('Hay errores en los artículos:\n  · ' + errors.join('\n  · '));
  return list.filter((a) => a.publicado).sort((x, y) => (x.fecha < y.fecha ? 1 : -1));
}

const words = (s) => String(s || '').replace(/[#>*_`\[\]()!-]/g, ' ').split(/\s+/).filter(Boolean).length;
const readMin = (d) => Math.max(1, Math.round(words(d.cuerpo) / 220));
const fmtDate = (iso, lang) => {
  const [y, m, d] = iso.split('-').map(Number);
  return T[lang].date(d, m - 1, y, T[lang].months);
};

/** Markdown del cuerpo → HTML, con imágenes optimizadas y enlaces externos seguros. */
async function bodyHtml(md, { images, slug }) {
  let html = marked.parse(String(md || ''), { async: false, gfm: true, breaks: false });
  // Imágenes: las locales y de Cloudinary pasan por el mismo proceso que los proyectos.
  const jobs = [];
  html.replace(/<img src="([^"]+)" alt="([^"]*)"(?: title="([^"]*)")?\s*\/?>/g, (m, src, alt, title) => {
    jobs.push({ m, src, alt, title });
    return m;
  });
  for (const j of jobs) {
    if (!/^(\/|https:\/\/res\.cloudinary\.com\/)/.test(j.src)) continue;
    const img = await images.get(j.src, { slug: `articulos-${slug}`, widths: [640, 960, 1360] });
    const pic = pictureHtml(img, { alt: j.alt, sizes: '(max-width: 760px) calc(100vw - 40px), 720px', attrs: ' loading="lazy" decoding="async"' });
    const fig = `<figure>${pic}${j.title ? `<figcaption>${esc(j.title)}</figcaption>` : ''}</figure>`;
    html = html.replace(`<p>${j.m}</p>`, fig).replace(j.m, fig);
  }
  html = html.replace(/<a href="(https?:\/\/[^"]+)"/g, (m, href) =>
    href.startsWith(SITE) ? m : `<a href="${href}" target="_blank" rel="noopener noreferrer"`,
  );
  // Tablas con desplazamiento propio en pantallas angostas
  html = html.replace(/<table>/g, '<div class="ar-table"><table>').replace(/<\/table>/g, '</table></div>');
  return html;
}

const FONTS =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap';
const FAVICON = 'https://res.cloudinary.com/dg2wnq6ao/image/upload/q_auto,f_auto,w_512/v1781101945/Favicon_jsl63r.webp';
const PORTRAIT = 'https://res.cloudinary.com/dg2wnq6ao/image/upload/w_120,h_120,c_fill,g_north,q_auto,f_auto/v1781396255/Escultura_de_Alexander_ykbpww.png';
const OG_DEFAULT = 'https://res.cloudinary.com/dg2wnq6ao/image/upload/q_auto,f_auto,w_1200/v1781396255/Escultura_de_Alexander_ykbpww.png';

const head = ({ lang, title, desc, url, esUrl, enUrl, og, type, schema }) => `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(desc)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="author" content="Alexander Caro" />
  <meta name="theme-color" content="#050504" />
  <link rel="canonical" href="${url}" />
  ${esUrl ? `<link rel="alternate" hreflang="es" href="${esUrl}" />` : ''}
  ${enUrl ? `<link rel="alternate" hreflang="en" href="${enUrl}" />` : ''}
  ${enUrl && esUrl ? `<link rel="alternate" hreflang="x-default" href="${enUrl}" />` : ''}
  <link rel="alternate" type="application/rss+xml" title="${attr(T[lang].feed)}" href="${indexUrl(lang)}feed.xml" />
  <meta property="og:type" content="${type}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${attr(title)}" />
  <meta property="og:description" content="${attr(desc)}" />
  <meta property="og:image" content="${attr(og)}" />
  <meta property="og:locale" content="${T[lang].locale}" />
  <meta property="og:site_name" content="Alexander Caro" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${attr(title)}" />
  <meta name="twitter:description" content="${attr(desc)}" />
  <meta name="twitter:image" content="${attr(og)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${FONTS}" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="${FONTS}" /></noscript>
  <link rel="stylesheet" href="/style.css" />
  <link rel="stylesheet" href="/css/inicio.css" />
  <link rel="stylesheet" href="/css/articulos.css" />
  <link rel="icon" type="image/webp" href="${FAVICON}" />
  <link rel="apple-touch-icon" href="${FAVICON}" />
  <script type="application/ld+json">
  ${JSON.stringify(schema, null, 2).replace(/\n/g, '\n  ')}
  </script>
</head>
<body class="hm-page">
`;

const tail = (footer) => `
  ${footer}

  <script defer src="/analytics.js"></script>
  <script src="/nav.js" defer></script>
  <script src="/i18n.js" defer></script>
</body>
</html>
`;

const ctaBlock = (lang, title, c) => {
  const t = T[lang];
  const wa = `https://wa.me/573024457653?text=${encodeURIComponent(t.wa(title))}`;
  return `
    <section class="ar-cta">
      <div class="hm-wrap">
        <h2 class="hm-h2">${c?.titulo ? inline(c.titulo) : esc(t.ctaTitle)}</h2>
        <p>${c?.texto ? inline(c.texto) : esc(t.ctaText)}</p>
        <a class="hm-btn hm-btn--gold" href="${attr(wa)}" target="_blank" rel="noopener noreferrer">${t.ctaWa}</a>
      </div>
    </section>`;
};

const listItem = (a, lang, img) => {
  const d = a[lang];
  return `
          <li>
            <a class="ar-item" href="${articleUrl(a.slug, lang)}">
              <p class="ar-item__meta"><time datetime="${a.fecha}">${fmtDate(a.fecha, lang)}</time> · ${T[lang].min(readMin(d))}</p>
              <h2>${esc(d.titulo)}</h2>
              <p class="ar-item__sum">${inline(d.resumen || '')}</p>
              ${img ? `<div class="ar-item__img">${pictureHtml(img, { alt: '', sizes: '(max-width: 760px) calc(100vw - 40px), 320px', attrs: ' loading="lazy" decoding="async"' })}</div>` : ''}
            </a>
          </li>`;
};

export async function buildArticles({ out, articles, images, footerOf, projects }) {
  let pages = 0;
  const covers = new Map();
  for (const a of articles) {
    const src = a.es.portada?.imagen;
    // Las portadas de Cloudinary no traen medidas: se encuadran a 16:10 para que la página no salte.
    const frame = /res\.cloudinary\.com/.test(src || '') ? { ratio: 1.6, fit: 'cover' } : undefined;
    covers.set(a.slug, src ? await images.get(src, { slug: `articulos-${a.slug}`, widths: [640, 960, 1440, 2000], frame }) : null);
  }

  for (const lang of ['es', 'en']) {
    const t = T[lang];
    const list = articles.filter((a) => lang === 'es' || a.hasEn);

    /* ── Cada artículo ── */
    for (const a of list) {
      const d = a[lang];
      const url = articleUrl(a.slug, lang, true);
      const esUrl = articleUrl(a.slug, 'es', true);
      const enUrl = a.hasEn ? articleUrl(a.slug, 'en', true) : '';
      const cover = covers.get(a.slug);
      const og = cover ? (cover.kind === 'local' ? SITE + cover.url(1200) : cover.url(1200)) : OG_DEFAULT;
      const title = d.seo?.titulo || `${plain(d.titulo)} | Alexander Caro`;
      const desc = plain(d.seo?.descripcion || d.resumen || '');
      const body = await bodyHtml(d.cuerpo, { images, slug: a.slug });
      const rel = d.relacionado ? projects.bySlug.get(d.relacionado) : null;
      const relImg = rel ? await images.get(rel.portada.imagen, { slug: rel.slug, widths: [640, 960] }) : null;
      const others = list.filter((x) => x !== a).slice(0, 3);
      const schema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: t.home, item: `${SITE}${lang === 'en' ? '/en' : ''}/` },
              { '@type': 'ListItem', position: 2, name: t.index, item: indexUrl(lang, true) },
              { '@type': 'ListItem', position: 3, name: plain(d.titulo), item: url },
            ],
          },
          {
            '@type': 'BlogPosting',
            headline: plain(d.titulo),
            description: desc,
            url,
            mainEntityOfPage: url,
            inLanguage: lang,
            datePublished: a.fecha,
            dateModified: day(a.es.actualizado) || a.fecha,
            image: og,
            wordCount: words(d.cuerpo),
            keywords: (d.etiquetas || []).join(', '),
            author: { '@type': 'Person', name: 'Alexander Caro', url: SITE },
            publisher: { '@type': 'Person', name: 'Alexander Caro', url: SITE },
          },
        ],
      };
      const html =
        head({ lang, title, desc, url, esUrl, enUrl, og, type: 'article', schema }) +
        `
  <main class="ar hm">
    <article>
      <header class="ar-top">
        <div class="hm-wrap ar-col">
          <p class="ar-crumb"><a href="${indexUrl(lang)}">${t.back}</a></p>
          <h1 class="ar-title">${esc(d.titulo)}</h1>
          ${d.resumen ? `<p class="ar-lead">${inline(d.resumen)}</p>` : ''}
          <p class="ar-meta"><time datetime="${a.fecha}">${fmtDate(a.fecha, lang)}</time><span>${t.min(readMin(d))}</span>${(d.etiquetas || []).map((x) => `<span>${esc(x)}</span>`).join('')}</p>
        </div>
      </header>
      ${cover ? `<div class="hm-wrap"><figure class="ar-cover">${pictureHtml(cover, { alt: plain(d.portada?.alt || ''), sizes: '(max-width: 1440px) calc(100vw - 2 * clamp(20px, 4vw, 56px)), 1328px', attrs: ' fetchpriority="high" decoding="async"' })}</figure></div>` : ''}
      <div class="hm-wrap ar-col">
        <div class="ar-prose">
${body}
        </div>
        <aside class="ar-author">
          <img src="${PORTRAIT}" alt="" width="60" height="60" loading="lazy" decoding="async">
          <p>${esc(t.author)} <a href="${lang === 'en' ? '/en' : ''}/trabajo/">${t.authorLink}</a>.</p>
        </aside>
      </div>
    </article>
${rel ? `
    <section class="ar-related">
      <div class="hm-wrap ar-col">
        <h2>${t.related}</h2>
        <a class="ar-rel" href="${projectUrl(rel.slug, lang)}">
          ${relImg ? `<div class="ar-rel__img">${pictureHtml(relImg, { alt: '', sizes: '(max-width: 760px) calc(100vw - 40px), 280px', attrs: ' loading="lazy" decoding="async"' })}</div>` : ''}
          <div><b>${esc(rel[lang].nombre)}</b><span>${inline(rel[lang].resumen)}</span><em>${t.seeCase}</em></div>
        </a>
      </div>
    </section>` : ''}
${ctaBlock(lang, plain(d.titulo), d.cta)}
${others.length ? `
    <section class="ar-more">
      <div class="hm-wrap">
        <h2 class="hm-h2">${t.more}</h2>
        <ul class="ar-list">${others.map((x) => listItem(x, lang, covers.get(x.slug))).join('')}
        </ul>
      </div>
    </section>` : ''}
  </main>
` +
        tail(footerOf(lang));
      const dir = path.join(out, lang === 'en' ? 'en' : '', 'articulos', a.slug);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), html);
      pages++;
    }

    /* ── Índice ── */
    const url = indexUrl(lang, true);
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: t.feed,
      url,
      inLanguage: lang,
      author: { '@type': 'Person', name: 'Alexander Caro', url: SITE },
      blogPost: list.map((a) => ({ '@type': 'BlogPosting', headline: plain(a[lang].titulo), url: articleUrl(a.slug, lang, true), datePublished: a.fecha })),
    };
    const html =
      head({
        lang,
        title: `${t.index} | Alexander Caro`,
        desc: t.indexLead,
        url,
        esUrl: indexUrl('es', true),
        enUrl: indexUrl('en', true),
        og: OG_DEFAULT,
        type: 'website',
        schema,
      }) +
      `
  <main class="ar hm">
    <header class="ar-top ar-top--index">
      <div class="hm-wrap">
        <h1 class="ar-title ar-title--index">${t.index}</h1>
        <p class="ar-lead">${esc(t.indexLead)}</p>
      </div>
    </header>
    <section class="ar-index">
      <div class="hm-wrap">
        ${list.length ? `<ul class="ar-list">${list.map((a) => listItem(a, lang, covers.get(a.slug))).join('')}
        </ul>` : `<p class="ar-empty">${t.empty}</p>`}
      </div>
    </section>
${ctaBlock(lang, t.index, null)}
  </main>
` +
      tail(footerOf(lang));
    const dir = path.join(out, lang === 'en' ? 'en' : '', 'articulos');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    pages++;

    /* ── RSS ── */
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(t.feed)}</title>
  <link>${url}</link>
  <atom:link href="${url}feed.xml" rel="self" type="application/rss+xml" />
  <description>${esc(t.indexLead)}</description>
  <language>${lang === 'en' ? 'en' : 'es-co'}</language>
${list
  .map(
    (a) => `  <item>
    <title>${esc(plain(a[lang].titulo))}</title>
    <link>${articleUrl(a.slug, lang, true)}</link>
    <guid>${articleUrl(a.slug, lang, true)}</guid>
    <pubDate>${new Date(a.fecha + 'T12:00:00Z').toUTCString()}</pubDate>
    <description>${esc(plain(a[lang].resumen || ''))}</description>
  </item>`,
  )
  .join('\n')}
</channel>
</rss>
`;
    fs.writeFileSync(path.join(dir, 'feed.xml'), rss);
  }
  return pages;
}

/** Sitemap: índice de artículos y cada artículo (con su versión en inglés si existe). */
export function sitemapArticles(out, articles) {
  const file = path.join(out, 'sitemap.xml');
  if (!fs.existsSync(file)) return;
  let xml = fs.readFileSync(file, 'utf8');
  const latest = articles[0]?.fecha || new Date().toISOString().slice(0, 10);
  const entry = (loc, lastmod, es, en, prio) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${prio}</priority>${es && en ? `
    <xhtml:link rel="alternate" hreflang="es" href="${es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>` : ''}
  </url>`;
  const add = [];
  const ie = indexUrl('es', true), ii = indexUrl('en', true);
  for (const loc of [ie, ii]) if (!xml.includes(`<loc>${loc}</loc>`)) add.push(entry(loc, latest, ie, ii, '0.6'));
  for (const a of articles) {
    const es = articleUrl(a.slug, 'es', true);
    const en = a.hasEn ? articleUrl(a.slug, 'en', true) : '';
    for (const loc of [es, en].filter(Boolean)) if (!xml.includes(`<loc>${loc}</loc>`)) add.push(entry(loc, day(a.es.actualizado) || a.fecha, es, en, '0.6'));
  }
  if (add.length) xml = xml.replace('</urlset>', add.join('\n') + '\n\n</urlset>');
  fs.writeFileSync(file, xml);
}

/** llms.txt: lista de artículos (zona @auto:llms-articulos-es / -en). */
export function llmsArticles(out, articles) {
  const file = path.join(out, 'llms.txt');
  if (!fs.existsSync(file)) return;
  const src = fs.readFileSync(file, 'utf8');
  const txt = src.replace(/<!--\s*@auto:llms-articulos-(es|en)\s*-->[\s\S]*?<!--\s*\/@auto:llms-articulos-\1\s*-->/g, (_, lang) =>
    articles
      .filter((a) => lang === 'es' || a.hasEn)
      .map((a) => `- [${plain(a[lang].titulo)}](${articleUrl(a.slug, lang, true)}): ${plain(a[lang].resumen || '')}`)
      .join('\n'),
  );
  fs.writeFileSync(file, txt);
}
