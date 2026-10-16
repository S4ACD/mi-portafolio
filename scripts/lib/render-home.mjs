// Tarjetas de proyecto del inicio y del CV (mismo lenguaje visual que /trabajo/).

import { esc, inline, projectUrl } from './util.mjs';
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

export const homeCards = (list, lang, imgs) => list.map((p) => card(p, lang, imgs.get(p.slug))).join('') + '\n        ';

export const cvCards = (list, lang, imgs, { dental = false } = {}) =>
  list.map((p) => card(p, lang, imgs.get(p.slug), { blank: true, cls: dental ? ' pc-card--wide' : '' })).join('') + '\n      ';

export const homeMore = (n, lang) =>
  lang === 'en'
    ? `<a href="/en/trabajo/">See all ${n} projects</a>`
    : `<a href="/trabajo/">Ver los ${n} proyectos</a>`;

export const cvMore = (n, lang) =>
  lang === 'en'
    ? `<a href="/en/trabajo/" target="_blank" rel="noopener" class="cvx-btn">See all ${n} projects with full case studies</a>`
    : `<a href="/trabajo/" target="_blank" rel="noopener" class="cvx-btn">Ver los ${n} proyectos con casos de estudio</a>`;
