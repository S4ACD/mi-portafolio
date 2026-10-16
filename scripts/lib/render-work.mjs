// /trabajo/: portada, filtros y grilla editorial, más la lista JSON-LD.

import { esc, attr, inline, plain, projectUrl, SITE } from './util.mjs';
import { pictureHtml } from './images.mjs';

export const AREAS = {
  es: { todos: 'Todos', branding: 'Branding', web: 'Web', grafico: 'Diseño gráfico', social: 'Social media', dental: 'Sector dental' },
  en: { todos: 'All', branding: 'Branding', web: 'Web', grafico: 'Graphic design', social: 'Social media', dental: 'Dental industry' },
};

const T = {
  es: {
    title: 'Trabajo',
    lede: 'Marca, web y contenido, diseñados y programados por la misma persona. Los proyectos con la etiqueta «Concepto propio» no tienen cliente: son ejercicios completos, de la estrategia a la producción.',
    concept: 'Concepto propio',
    filterLabel: 'Filtrar proyectos por área',
    listLabel: 'Proyectos',
    empty: 'No hay proyectos en esta área todavía.',
    itemListName: 'Trabajo seleccionado — Alexander Caro',
    itemListDesc: 'Proyectos de identidad visual, diseño web, desarrollo frontend y contenido.',
  },
  en: {
    title: 'Work',
    lede: 'Brand, web and content, designed and built by the same person. Projects tagged “Own concept” have no client: they are complete exercises, from strategy to production.',
    concept: 'Own concept',
    filterLabel: 'Filter projects by area',
    listLabel: 'Projects',
    empty: 'No projects in this area yet.',
    itemListName: 'Selected work — Alexander Caro',
    itemListDesc: 'Visual identity, web design, frontend development and content projects.',
  },
};

export const CARD_WIDTHS = [640, 960, 1440, 2000];

/** Ritmo de la grilla: filas que alternan ancha/angosta; una sola al final va ancha. */
export function spans(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 2);
    const first = i % 2 === 0;
    out.push((row % 2 === 0 ? first : !first) ? 'wide' : 'narrow');
  }
  if (n % 2 === 1) out[n - 1] = 'wide';
  return out;
}

export const metaHtml = (p, lang) => {
  const d = p[lang];
  const tags = (d.disciplinas || []).map(esc).join(', ');
  const concept = p.concepto ? `<span class="wk-concept">${T[lang].concept}</span>` : '';
  const r = d.resultado;
  const result = r?.cifra ? `<span class="wk-result"><b>${esc(r.cifra)}</b> ${inline(r.texto)}</span>` : '';
  return `<div class="wk-meta"><span class="wk-tags">${tags ? `<span>${tags}</span>` : ''}${concept}</span>${result}</div>`;
};

export function mediaHtml(p, lang, img, { sizes, eager = false }) {
  const d = p[lang];
  if (p.portada.estilo === 'logotipo' || !img) {
    return `<div class="wk-wordmark" style="--bg:${attr(p.portada.fondo)}" aria-hidden="true">${esc(p.portada.logotipo_texto)}<span>${esc(p.portada.logotipo_acento)}</span>${esc(p.portada.logotipo_resto)}</div>`;
  }
  const attrs = eager ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"';
  return pictureHtml(img, { alt: plain(d.alt || d.nombre), sizes, attrs });
}

export function workCard(p, lang, img, span, { eager = false } = {}) {
  const d = p[lang];
  const sizes =
    span === 'full'
      ? '(max-width: 760px) calc(100vw - 40px), min(1328px, calc(100vw - 112px))'
      : '(max-width: 760px) calc(100vw - 40px), (max-width: 1440px) 58vw, 780px';
  const focus = p.portada.posicion ? ` style="--focus:${attr(p.portada.posicion)}"` : '';
  return `
      <article class="wk-card wk-card--${span}" data-areas="${attr(p.areas.join(' '))}">
        <a class="wk-link" href="${projectUrl(p.slug, lang)}">
          <div class="wk-media"${focus}>${mediaHtml(p, lang, img, { sizes, eager })}</div>
          <div class="wk-cap">
            <h2 class="wk-name">${esc(d.nombre)}</h2>
            <span class="wk-year">${esc(p.anio)}</span>
            <p class="wk-sum">${inline(d.resumen)}</p>
            ${metaHtml(p, lang)}
          </div>
        </a>
      </article>`;
}

export function workPage(list, lang, imgs) {
  const t = T[lang];
  const featured = list.find((p) => p.destacado);
  const rest = list.filter((p) => p !== featured);
  const sp = spans(rest.length);

  const counts = { todos: list.length };
  for (const p of list) for (const a of p.areas) counts[a] = (counts[a] || 0) + 1;
  const filters = Object.entries(AREAS[lang])
    .filter(([k]) => counts[k])
    .map(
      ([k, label]) =>
        `<button type="button" class="wk-filter" data-wk-filter="${k}" aria-pressed="${k === 'todos'}">${esc(label)}<sup>${counts[k]}</sup></button>`,
    )
    .join('\n        ');

  const cards = [
    featured ? workCard(featured, lang, imgs.get(featured.slug), 'full', { eager: true }) : '',
    ...rest.map((p, i) => workCard(p, lang, imgs.get(p.slug), sp[i], { eager: !featured && i < 2 })),
  ].join('');

  return `<section class="wk-hero">
    <div class="pz-wrap">
      <h1 class="wk-title">${t.title}<sup>${list.length}</sup></h1>
      <p class="wk-lede">${esc(t.lede)}</p>
    </div>
  </section>

  <section class="wk-index" aria-label="${attr(t.listLabel)}">
    <div class="pz-wrap">
      <div class="wk-filters" role="group" aria-label="${attr(t.filterLabel)}">
        ${filters}
      </div>
      <div class="wk-grid" data-wk-grid>${cards}
        <p class="wk-empty" hidden>${esc(t.empty)}</p>
      </div>
    </div>
  </section>`;
}

export function workItemList(list, lang) {
  const t = T[lang];
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.itemListName,
    description: t.itemListDesc,
    url: `${SITE}${lang === 'en' ? '/en' : ''}/trabajo/`,
    numberOfItems: list.length,
    itemListElement: list.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: projectUrl(p.slug, lang, true),
      name: `${plain(p[lang].nombre)} — ${plain(p[lang].resumen)}`,
    })),
  };
  return `<script type="application/ld+json">\n  ${JSON.stringify(data, null, 2).replace(/\n/g, '\n  ')}\n  </script>`;
}

export { T as WORK_TEXT };
