// Imágenes para compartir (Open Graph, 1200×630): la que sale cuando pegas
// el enlace de un caso o de un artículo en LinkedIn, WhatsApp o X.
//
// Diseño: fondo negro, etiqueta («Caso de estudio» / «Artículo»), el título en
// Fraunces y tu nombre abajo; a la derecha, la portada del proyecto.
// Si la portada no se puede leer (por ejemplo, sin internet para Cloudinary),
// sale la versión solo con texto y una franja del color del proyecto.
//
// La fuente va en scripts/fonts/ para que funcione igual en tu PC y en Vercel.
// Los resultados se guardan en caché (node_modules/.cache).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { SITE } from './util.mjs';

const VERSION = 'og-v1';
const W = 1200;
const H = 630;
const PHOTO_W = 520;
const FONTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../fonts');
const ROMAN = path.join(FONTS, 'Fraunces.ttf');
const ITALIC = path.join(FONTS, 'Fraunces-Italic.ttf');
const C = { bg: '#0b0a08', ink: '#f4efe6', ink2: '#a8a397', gold: '#cdb78e', line: '#2a2722' };

const T = {
  es: { case: 'Caso de estudio', article: 'Artículo' },
  en: { case: 'Case study', article: 'Article' },
};

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plainText = (s) => String(s || '').replace(/\*+/g, '').replace(/\s+/g, ' ').trim();

async function text(str, { font, fontfile, width, color, spacing = 0, align = 'left' }) {
  const { data, info } = await sharp({
    text: { text: `<span foreground="${color}">${xml(str)}</span>`, font, fontfile, width, rgba: true, wrap: 'word', spacing, align },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** El título más grande que quepa en el espacio disponible. */
async function title(str, width, maxH, sizes = [68, 62, 56, 50, 45, 40]) {
  let last;
  for (const size of sizes) {
    last = await text(str, { font: `Fraunces Light ${size}`, fontfile: ROMAN, width, color: C.ink, spacing: Math.round(-size * 0.1) });
    if (last.height <= maxH) return last;
  }
  return last;
}

export function createOgMaker({ root, outDir, cacheDir }) {
  const dir = path.join(cacheDir, 'og');
  fs.mkdirSync(dir, { recursive: true });
  const memo = new Map();
  let made = 0;
  let cached = 0;
  let noPhoto = 0;
  let offline = false; // si Cloudinary no responde una vez, no se insiste en este build

  const cloudinaryOg = (url) => {
    const [head, tail] = url.split('/image/upload/');
    const parts = tail.split('/');
    while (parts.length > 1 && !/^v\d+$/.test(parts[0]) && /^[a-z]{1,3}_[^/]*$/.test(parts[0].split(',')[0])) parts.shift();
    return `${head}/image/upload/c_fill,g_center,w_${PHOTO_W},h_${H},q_85,f_jpg/${parts.join('/')}`;
  };

  /** Bytes de la portada, o null si no se puede leer. */
  async function photo(src) {
    if (!src || !/\.(jpe?g|png|webp|avif)(\?|$)/i.test(src)) return null;
    try {
      if (/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(src)) {
        if (offline) return null;
        let res;
        try {
          res = await fetch(cloudinaryOg(src), { signal: AbortSignal.timeout(8000) });
        } catch {
          offline = true;
          return null;
        }
        if (!res.ok) return null;
        return Buffer.from(await res.arrayBuffer());
      }
      if (src.startsWith('/')) {
        const file = path.join(root, decodeURIComponent(src));
        return fs.existsSync(file) ? fs.readFileSync(file) : null;
      }
    } catch {
      return null;
    }
    return null;
  }

  async function render({ title: t, sub, kicker, color, img }) {
    const hasPhoto = !!img;
    const textW = hasPhoto ? W - PHOTO_W - 64 - 56 : W - 64 - 64 - 200;
    const layers = [];

    if (hasPhoto) {
      const ph = await sharp(img).resize(PHOTO_W, H, { fit: 'cover', position: 'centre' }).jpeg({ quality: 88 }).toBuffer();
      layers.push({ input: ph, left: W - PHOTO_W, top: 0 });
    } else {
      const band = /^#[0-9a-f]{6}$/i.test(color || '') ? color : C.gold;
      layers.push({ input: { create: { width: 200, height: H, channels: 3, background: band } }, left: W - 200, top: 0 });
    }

    const k = await text(kicker, { font: 'Fraunces Italic 28', fontfile: ITALIC, width: textW, color: C.gold });
    const name = await text('Alexander Caro', { font: 'Fraunces 30', fontfile: ROMAN, width: textW, color: C.ink });
    const site = await text('alexandercaro.com', { font: 'Fraunces 22', fontfile: ROMAN, width: textW, color: C.ink2 });
    const top = 64;
    const footY = H - 64 - name.height - 6 - site.height;
    const titleY = top + k.height + 32;
    const room = footY - 40 - titleY;
    let sb = null;
    if (sub) {
      sb = await text(sub, { font: 'Fraunces 26', fontfile: ROMAN, width: textW, color: C.ink2, spacing: 2 });
      if (sb.height > 130) sb = null;
    }
    const tt = await title(t, textW, room - (sb ? sb.height + 22 : 0), sub ? [96, 84, 72, 62, 54, 46] : undefined);

    layers.push({ input: k.data, left: 64, top });
    layers.push({ input: tt.data, left: 64, top: titleY });
    if (sb && titleY + tt.height + 22 + sb.height <= footY - 40) layers.push({ input: sb.data, left: 64, top: titleY + tt.height + 22 });
    layers.push({ input: { create: { width: 56, height: 2, channels: 3, background: C.gold } }, left: 64, top: footY - 24 });
    layers.push({ input: name.data, left: 64, top: footY });
    layers.push({ input: site.data, left: 64, top: footY + name.height + 6 });

    return sharp({ create: { width: W, height: H, channels: 3, background: C.bg } })
      .composite(layers)
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
  }

  /**
   * @param {object} o { kind:'case'|'article', lang, slug, title, cover, color }
   * @returns URL absoluta de la imagen, o '' si algo falla.
   */
  async function make({ kind, lang, slug, title: t, sub, cover, color }) {
    const kicker = T[lang]?.[kind] || '';
    const ttl = plainText(t);
    const subt = plainText(sub);
    if (!ttl) return '';
    const key = crypto.createHash('sha1').update(JSON.stringify([VERSION, kicker, ttl, subt, cover || '', color || ''])).digest('hex').slice(0, 10);
    const name = `${slug}-${lang}-${key}.jpg`;
    if (memo.has(name)) return memo.get(name);
    const out = path.join(outDir, 'assets/og', name);
    const cacheFile = path.join(dir, name);
    let url = '';
    try {
      fs.mkdirSync(path.dirname(out), { recursive: true });
      if (fs.existsSync(cacheFile)) {
        fs.copyFileSync(cacheFile, out);
        cached++;
      } else {
        const img = await photo(cover);
        if (cover && !img) noPhoto++;
        const buf = await render({ title: ttl, sub: subt, kicker, color, img });
        fs.writeFileSync(out, buf);
        // Sin la foto no se guarda en caché: el próximo build vuelve a intentarlo.
        if (img || !cover) fs.writeFileSync(cacheFile, buf);
        made++;
      }
      url = `${SITE}/assets/og/${name}`;
    } catch (e) {
      console.warn(`· Imagen para compartir de "${slug}" (${lang}) no se pudo crear: ${e.message}`);
    }
    memo.set(name, url);
    return url;
  }

  return {
    make,
    summary: () => `${made} nuevas, ${cached} desde caché${noPhoto ? `, ${noPhoto} sin foto (portada no disponible)` : ''}`,
  };
}
