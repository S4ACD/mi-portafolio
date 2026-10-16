// Página de caso generada desde la ficha del proyecto (pagina: plantilla).

import { marked } from 'marked';
import { esc, attr, inline, plain, projectUrl, SITE, UI } from './util.mjs';
import { pictureHtml } from './images.mjs';

const T = {
  es: {
    back: 'Trabajo',
    concept: 'Concepto propio',
    client: 'Proyecto para cliente',
    year: 'Año',
    disciplines: 'Disciplinas',
    credits: 'Créditos',
    next: 'Siguiente proyecto',
    ctaTitle: '¿Tu marca necesita un sistema así?',
    ctaText: 'Cuéntame en qué está tu proyecto. Respondo en menos de 24 horas, por escrito, con una propuesta clara.',
    ctaWa: 'Escríbeme por WhatsApp',
    ctaMore: 'Ver más proyectos',
    home: 'Inicio',
    work: 'Trabajo',
    wa: (n) => `¡Hola Alexander! Vi tu proyecto ${n} y me interesa algo similar para mi marca. ¿Podemos hablar?`,
  },
  en: {
    back: 'Work',
    concept: 'Own concept',
    client: 'Client project',
    year: 'Year',
    disciplines: 'Disciplines',
    credits: 'Credits',
    next: 'Next project',
    ctaTitle: 'Does your brand need a system like this?',
    ctaText: "Tell me where your project stands. I reply within 24 hours, in writing, with a clear proposal.",
    ctaWa: 'Message me on WhatsApp',
    ctaMore: 'See more projects',
    home: 'Home',
    work: 'Work',
    wa: (n) => `Hi Alexander! I saw your ${n} project and I'd like something similar for my brand. Can we talk?`,
  },
};

const W = {
  full: [800, 1200, 1800, 2400],
  2: [600, 900, 1200, 1600],
  3: [480, 720, 960, 1200],
};
const SIZES = {
  full: '(max-width: 1440px) calc(100vw - 2 * clamp(20px, 4vw, 56px)), 1328px',
  bleed: '100vw',
  2: '(max-width: 560px) calc(100vw - 40px), (max-width: 1440px) 48vw, 650px',
  3: '(max-width: 560px) calc(100vw - 40px), (max-width: 900px) 48vw, (max-width: 1440px) 31vw, 430px',
  4: '(max-width: 560px) calc(100vw - 40px), (max-width: 1100px) 48vw, (max-width: 1440px) 23vw, 320px',
};

/** Color de texto legible sobre el color de la marca. */
export function onColor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return '#f6f1e7';
  const n = parseInt(m[1], 16);
  const lin = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const L = 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  // Contraste contra blanco cálido vs. casi negro: el mayor gana.
  const cLight = (1.0 + 0.05) / (L + 0.05);
  const cDark = (L + 0.05) / (0.012 + 0.05);
  return cDark > cLight ? '#17140f' : '#f6f1e7';
}

const md = (s) => marked.parse(String(s ?? ''), { async: false, gfm: true, breaks: false });

export async function casePage({ p, lang, next, images, footer, slugToImg }) {
  const d = p[lang];
  const c = d.caso || {};
  const t = T[lang];
  const ui = UI[lang];
  const url = projectUrl(p.slug, lang, true);
  const other = projectUrl(p.slug, lang === 'es' ? 'en' : 'es', true);
  const esUrl = projectUrl(p.slug, 'es', true);
  const enUrl = projectUrl(p.slug, 'en', true);
  const brand = p.color || '#1a1712';
  const onBrand = onColor(brand);
  const seoTitle = d.seo?.titulo || `${plain(d.nombre)} | Alexander Caro`;
  const seoDesc = plain(d.seo?.descripcion || d.resumen);

  const get = (src, widths) => (src ? images.get(src, { slug: p.slug, widths }) : null);
  const cover = await get(c.portada || p.portada.imagen, W.full);
  const ogImage = cover ? (cover.kind === 'local' ? SITE + cover.url(1200) : cover.url(1200)) : '';

  /* ── Bloques ── */
  const blocks = [];
  for (const b of c.bloques || []) {
    const tipo = b.tipo || b.type;
    if (tipo === 'texto') {
      blocks.push(`<section class="cs-text">
        ${b.titulo ? `<h2>${inline(b.titulo)}</h2>` : ''}
        <div class="cs-prose">${md(b.texto)}</div>
      </section>`);
    } else if (tipo === 'imagen') {
      const bleed = b.ancho === 'sangrado';
      const img = await get(b.imagen, W.full);
      if (!img) continue;
      blocks.push(`<figure class="cs-figure${bleed ? ' cs-figure--bleed' : ''}">
        ${pictureHtml(img, { alt: plain(b.alt), sizes: bleed ? SIZES.bleed : SIZES.full, attrs: ' loading="lazy" decoding="async"' })}
        ${b.pie ? `<figcaption>${inline(b.pie)}</figcaption>` : ''}
      </figure>`);
    } else if (tipo === 'galeria') {
      const cols = Math.min(4, Math.max(1, Number(b.columnas) || 2));
      const widths = cols === 1 ? W.full : W[Math.min(cols, 3)];
      const sizes = cols === 1 ? SIZES.full : cols === 4 ? SIZES[4] : SIZES[cols];
      const figs = [];
      for (const it of b.imagenes || []) {
        const img = await get(it.imagen, widths);
        if (!img) continue;
        const cap = it.pie || it.texto
          ? `<figcaption>${it.pie ? inline(it.pie) : ''}${it.texto ? `<p>${inline(it.texto)}</p>` : ''}</figcaption>`
          : '';
        figs.push(`<figure class="cs-figure">${pictureHtml(img, { alt: plain(it.alt), sizes, attrs: ' loading="lazy" decoding="async"' })}${cap}</figure>`);
      }
      blocks.push(`<section class="cs-gallery">
        ${b.titulo ? `<h3>${inline(b.titulo)}</h3>` : ''}
        <div class="cs-grid" style="--cols: ${cols}">
          ${figs.join('\n          ')}
        </div>
      </section>`);
    } else if (tipo === 'cita') {
      const [o, cl] = lang === 'en' ? ['“', '”'] : ['«', '»'];
      blocks.push(`<blockquote class="cs-quote"><p>${o}${inline(b.texto)}${cl}</p></blockquote>`);
    } else if (tipo === 'cifras') {
      blocks.push(`<section class="cs-figures">
        ${(b.items || []).map((x) => `<div><b>${esc(x.cifra)}</b><span>${inline(x.texto)}</span></div>`).join('\n        ')}
      </section>`);
    } else if (tipo === 'colores') {
      const cols = b.colores || [];
      blocks.push(`<section class="cs-palette">
        ${b.titulo ? `<h3>${inline(b.titulo)}</h3>` : ''}
        <div class="cs-swatches">
          ${cols
            .map((x) => {
              const share = Math.max(Number(x.proporcion) || 0, 0) || 1;
              const pct = x.proporcion ? `<span>${esc(x.proporcion)} %</span>` : '';
              return `<div class="cs-swatch" style="--share:${share};--c:${attr(x.hex)}"><i></i><p><b>${esc(x.nombre)}</b><span>${esc(String(x.hex).toUpperCase())}</span>${pct}</p></div>`;
            })
            .join('\n          ')}
        </div>
      </section>`);
    }
  }

  /* ── Ficha ── */
  const facts = [
    { k: t.year, v: p.anio },
    { k: t.disciplines, v: (d.disciplinas || []).join(', ') },
    ...(c.ficha || []).map((f) => ({ k: f.etiqueta, v: f.valor })),
  ].filter((f) => f.v);

  /* ── Siguiente proyecto ── */
  let nextHtml = '';
  if (next) {
    const nd = next[lang];
    const nImg = await slugToImg(next);
    const nBrand = next.color || (next.portada.estilo === 'logotipo' ? next.portada.fondo : '') || '#17140f';
    nextHtml = `
  <a class="cs-next" href="${projectUrl(next.slug, lang)}" style="--brand:${attr(nBrand)};--on-brand:${onColor(nBrand)}">
    <div class="pz-wrap">
      <div>
        <small>${t.next}</small>
        <strong>${esc(nd.nombre)}</strong>
      </div>
      ${nImg && next.portada.estilo !== 'logotipo' ? `<div class="cs-next__img">${pictureHtml(nImg, { alt: '', sizes: '(max-width: 760px) 100vw, 38vw', attrs: ' loading="lazy" decoding="async"' })}</div>` : ''}
    </div>
  </a>`;
  }

  const wa = `https://wa.me/573024457653?text=${encodeURIComponent(t.wa(plain(d.nombre)))}`;
  const kicker = p.concepto ? t.concept : t.client;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.home, item: `${SITE}${lang === 'en' ? '/en' : ''}/` },
          { '@type': 'ListItem', position: 2, name: t.work, item: `${SITE}${lang === 'en' ? '/en' : ''}/trabajo/` },
          { '@type': 'ListItem', position: 3, name: plain(d.nombre), item: url },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: plain(d.nombre),
        headline: plain(seoTitle),
        description: seoDesc,
        url,
        inLanguage: lang,
        ...(ogImage ? { image: ogImage } : {}),
        ...(p.anio ? { dateCreated: p.anio } : {}),
        keywords: (d.disciplinas || []).join(', '),
        author: { '@type': 'Person', name: 'Alexander Caro', url: SITE },
        creator: { '@type': 'Person', name: 'Alexander Caro', url: SITE },
        ...(p.concepto ? { creativeWorkStatus: 'Concept' } : {}),
      },
    ],
  };

  const FONTS =
    'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap';
  const FAVICON = 'https://res.cloudinary.com/dg2wnq6ao/image/upload/q_auto,f_auto,w_512/v1781101945/Favicon_jsl63r.webp';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(seoTitle)}</title>
  <meta name="description" content="${attr(seoDesc)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="theme-color" content="${attr(brand)}" />
  <link rel="preload" as="image" href="https://res.cloudinary.com/dg2wnq6ao/image/upload/h_56,w_140,c_fit,q_auto,f_auto/v1781101946/Logo-en-el-nav_ubnip9.webp" fetchpriority="high">
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="es" href="${esUrl}" />
  <link rel="alternate" hreflang="en" href="${enUrl}" />
  <link rel="alternate" hreflang="x-default" href="${enUrl}" />

  <meta property="og:type" content="article" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${attr(seoTitle)}" />
  <meta property="og:description" content="${attr(seoDesc)}" />
  ${ogImage ? `<meta property="og:image" content="${attr(ogImage)}" />` : ''}
  <meta property="og:locale" content="${ui.locale}" />
  <meta property="og:site_name" content="Alexander Caro" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${attr(seoTitle)}" />
  <meta name="twitter:description" content="${attr(seoDesc)}" />
  ${ogImage ? `<meta name="twitter:image" content="${attr(ogImage)}" />` : ''}

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${FONTS}" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="${FONTS}" /></noscript>
  <link rel="stylesheet" href="/style.css" />
  <link rel="stylesheet" href="/css/proyectos.css" />
  <link rel="icon" type="image/webp" href="${FAVICON}" />
  <link rel="apple-touch-icon" href="${FAVICON}" />

  <script type="application/ld+json">
  ${JSON.stringify(schema, null, 2).replace(/\n/g, '\n  ')}
  </script>
</head>
<body class="pz-page">

  <header class="cs-hero" style="--brand:${attr(brand)};--on-brand:${onBrand}">
    <div class="pz-wrap">
      <a class="cs-back" href="${lang === 'en' ? '/en' : ''}/trabajo/"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>${t.back}</a>
      <p class="cs-kicker">${kicker}</p>
      <h1 class="cs-title">${esc(d.nombre)}</h1>
      <div class="cs-hero__foot">
        <p class="cs-intro">${inline(c.intro || d.resumen)}</p>
        <dl class="cs-facts">
          ${facts.map((f) => `<div><dt>${esc(f.k)}</dt><dd>${inline(f.v)}</dd></div>`).join('\n          ')}
        </dl>
      </div>
    </div>
  </header>

  <main>
    ${cover ? `<div class="pz-wrap"><figure class="cs-cover" style="--overlap: clamp(72px, 12vw, 220px)">${pictureHtml(cover, { alt: plain(d.alt || d.nombre), sizes: SIZES.full, attrs: ' fetchpriority="high" decoding="async"' })}</figure></div>` : ''}

    <div class="cs-body">
      <div class="pz-wrap">
        ${blocks.join('\n\n        ')}
        ${c.creditos ? `
        <section class="cs-credits">
          <h2>${t.credits}</h2>
          <div>${md(c.creditos)}</div>
        </section>` : ''}
      </div>
    </div>
${nextHtml}

    <section class="cs-cta" id="contacto">
      <div class="pz-wrap">
        <h2>${esc(t.ctaTitle)}</h2>
        <p>${esc(t.ctaText)}</p>
        <div class="cs-cta__actions">
          <a class="pz-btn pz-btn--solid" href="${attr(wa)}" target="_blank" rel="noopener noreferrer">${t.ctaWa}</a>
          <a class="pz-btn pz-btn--ghost" href="${lang === 'en' ? '/en' : ''}/trabajo/">${t.ctaMore}</a>
        </div>
      </div>
    </section>
  </main>

  ${footer}

  <script defer src="/analytics.js"></script>
  <script src="/nav.js" defer></script>
  <script src="/i18n.js" defer></script>
</body>
</html>
`;
}
