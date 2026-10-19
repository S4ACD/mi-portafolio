// Reseñas de clientes (content/resenas.yml) → bloque HTML para la zona
// <!-- @auto:resenas --> del inicio, servicios y CV.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { BuildError, esc, attr } from './util.mjs';

const T = {
  es: {
    of: 'de 5 en Workana',
    count: (n, r) => `${n} calificaciones de clientes${r ? ` · ${r} me contrataron más de una vez` : ''}`,
    link: 'Ver todas en Workana',
    newTab: '(se abre en una pestaña nueva)',
    stars: (c) => `Calificación ${c} de 5`,
    tag: 'Reseña en Workana',
    label: 'Reseñas de clientes en Workana',
  },
  en: {
    of: 'out of 5 on Workana',
    count: (n, r) => `${n} client ratings${r ? ` · ${r} clients hired me more than once` : ''}`,
    link: 'See them all on Workana',
    newTab: '(opens in a new tab)',
    stars: (c) => `Rated ${c} out of 5`,
    tag: 'Workana review · translated from Spanish',
    label: 'Client reviews on Workana',
  },
};

export function loadReviews(root) {
  const file = path.join(root, 'content/resenas.yml');
  if (!fs.existsSync(file)) return null;
  let d;
  try {
    d = (yaml.safeLoad || yaml.load)(fs.readFileSync(file, 'utf8')) ?? {};
  } catch (e) {
    throw new BuildError(`content/resenas.yml no se pudo leer: ${e.message}`);
  }
  d.items = (d.items || []).filter((i) => i && i.texto);
  return d;
}

export function reviewsBlock(d, lang) {
  if (!d || !d.items.length) return '';
  const t = T[lang];
  const rating = String(d.calificacion || '5,0');
  const ratingShown = lang === 'en' ? rating.replace(',', '.') : rating;
  const stars = `<span class="hm-wk__stars" role="img" aria-label="${attr(t.stars(ratingShown))}">★★★★★</span>`;
  const items = d.items
    .map((i) => {
      const text = (lang === 'en' && i.texto_en) || i.texto;
      const name = (lang === 'en' && i.nombre_en) || i.nombre;
      const proj = (lang === 'en' && i.proyecto_en) || i.proyecto;
      return `<li><figure>${stars}<blockquote>${esc(lang === 'en' ? `“${text}”` : `«${text}»`)}</blockquote><figcaption><b>${esc(name)}</b>${proj ? `<span>${esc(proj)}</span>` : ''}<span class="hm-wk__src">${esc(t.tag)}</span></figcaption></figure></li>`;
    })
    .join('');
  const link = d.perfil
    ? `<a class="hm-wk__link" href="${attr(d.perfil)}" target="_blank" rel="noopener noreferrer">${esc(t.link)} ↗<span class="hm-sr"> ${esc(t.newTab)}</span></a>`
    : '';
  return `<div class="hm-wk" aria-label="${attr(t.label)}">
  <div class="hm-wk__top"><p class="hm-wk__score"><b>${esc(ratingShown)}</b><span>${stars}${esc(t.of)}</span></p><p class="hm-wk__count">${esc(t.count(d.total || d.items.length, d.repiten))}</p>${link}</div>
  <ul class="hm-wk__list">${items}</ul>
</div>`;
}
