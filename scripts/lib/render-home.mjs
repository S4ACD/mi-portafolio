// Tarjetas de proyecto del inicio y del CV (mismo lenguaje visual que /trabajo/).

import { esc, attr, inline, projectUrl } from './util.mjs';
import { mediaHtml, metaHtml } from './render-work.mjs';

const SIZES = '(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) 46vw, 420px';

const card = (p, lang, img, { blank = false, cls = '' } = {}) => {
  const d = p[lang];
  return `
          <article class="pc-card${cls}" data-tags="${p.areas.join(' ')}">
            <a class="wk-link" href="${projectUrl(p.slug, lang)}"${blank ? ' target="_blank" rel="noopener"' : ''}>
              <div class="wk-media pc-media">${mediaHtml(p, lang, img, { sizes: SIZES })}</div>
              <div class="wk-cap">
                <h3 class="wk-name">${esc(d.nombre)}</h3>
                <span class="wk-year">${esc(p.anio)}</span>
                <p class="wk-sum">${inline(d.resumen)}</p>
                ${metaHtml(p, lang)}
              </div>
            </a>
          </article>`;
};

/* ── Inicio v3: tres destacados y un índice con vista previa ── */
const FEAT_SIZES = {
  big: '(max-width: 860px) calc(100vw - 40px), (max-width: 1440px) 56vw, 780px',
  sm: '(max-width: 860px) calc(100vw - 40px), (max-width: 1440px) 40vw, 560px',
};

export function homeWork(list, lang, imgs) {
  const feat = list.slice(0, 3);
  const rest = list.slice(3);
  const cards = feat
    .map((p, i) => {
      const d = p[lang];
      const kind = i === 0 ? 'big' : 'sm';
      return `
          <a class="hm-card hm-card--${kind}" href="${projectUrl(p.slug, lang)}">
            <div class="hm-card__img">${mediaHtml(p, lang, imgs.get(p.slug), { sizes: FEAT_SIZES[kind] })}</div>
            <div class="hm-card__meta"><h3>${esc(d.nombre)}</h3><small>${esc(p.anio)}</small></div>
            <p>${inline(d.resumen)}</p>
          </a>`;
    })
    .join('');
  const rows = rest
    .map((p) => {
      const d = p[lang];
      const img = imgs.get(p.slug);
      const src = img && p.portada.estilo !== 'logotipo' ? img.url(640) : '';
      const color = p.color || p.portada.fondo || '#17140f';
      const thumb = src
        ? `<img class="hm-thumb" src="${attr(src)}" alt="" width="72" height="72" loading="lazy" decoding="async">`
        : `<span class="hm-thumb" style="--c:${attr(color)}" aria-hidden="true"></span>`;
      return `
          <li><a href="${projectUrl(p.slug, lang)}" data-hm-peek="${attr(src)}" data-hm-color="${attr(color)}" data-hm-name="${attr(d.nombre)}">${thumb}<b>${esc(d.nombre)}</b><span>${esc((d.disciplinas || []).join(', '))}</span><em>${esc(p.anio)}</em></a></li>`;
    })
    .join('');
  return `
        <div class="hm-feat">${cards}
        </div>${rest.length ? `
        <ul class="hm-index">${rows}
        </ul>` : ''}
        `;
}

export const homeCards = (list, lang, imgs) => list.map((p) => card(p, lang, imgs.get(p.slug))).join('') + '\n        ';

export const cvCards = (list, lang, imgs, { dental = false } = {}) =>
  list.map((p) => card(p, lang, imgs.get(p.slug), { blank: true, cls: dental ? ' pc-card--wide' : '' })).join('') + '\n      ';

export const homeMore = (n, lang) =>
  lang === 'en'
    ? `<a class="hm-btn hm-btn--ghost" href="/en/trabajo/">See all ${n} projects</a>`
    : `<a class="hm-btn hm-btn--ghost" href="/trabajo/">Ver los ${n} proyectos</a>`;

export const cvMore = (n, lang) =>
  lang === 'en'
    ? `<a href="/en/trabajo/" target="_blank" rel="noopener" class="hm-btn hm-btn--ghost">See all ${n} projects with full case studies</a>`
    : `<a href="/trabajo/" target="_blank" rel="noopener" class="hm-btn hm-btn--ghost">Ver los ${n} proyectos con casos de estudio</a>`;

/** Lista en texto de los proyectos del CV (solo se ve al imprimir o en el PDF). */
export const cvList = (list, lang) =>
  list
    .map((p) => {
      const d = p[lang];
      const tags = (d.disciplinas || []).join(', ');
      return `<li><b>${esc(d.nombre)}</b>${tags ? ` · ${esc(tags)}` : ''}<span class="cv-pl-sum">. ${inline(d.resumen)}</span></li>`;
    })
    .join('');
