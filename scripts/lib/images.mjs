// Imágenes: convierte cada foto subida en versiones AVIF / WebP / JPG
// a varios anchos (srcset), y genera srcset para las URLs de Cloudinary.
//
// · Ruta local ("/uploads/proyectos/foto.jpg" o "/assets/..."): se procesa con sharp
//   y se publica en /assets/proyectos/<slug>/. El original NO se publica.
// · Cloudinary: se reescribe la transformación (q_auto,f_auto,w_N) para cada ancho.
// · Otra URL externa: se usa tal cual.
//
// Los resultados se guardan en caché (node_modules/.cache) para que los builds
// siguientes, en tu PC o en Vercel, no vuelvan a procesar lo mismo.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { BuildError } from './util.mjs';

const CACHE_VERSION = 'v1';

/** Limita cuántas imágenes se codifican a la vez. */
const CONCURRENCY = Math.max(2, Math.min(8, (await import('node:os')).cpus().length));
let active = 0;
const waiting = [];
const limit = async (fn) => {
  if (active >= CONCURRENCY) await new Promise((r) => waiting.push(r));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiting.shift()?.();
  }
};
const Q = { avif: 55, webp: 78, jpeg: 82, png: 90 };

export function createImagePipeline({ root, outDir, cacheDir }) {
  const memo = new Map();
  const written = new Set();
  let processed = 0;
  let fromCache = 0;
  fs.mkdirSync(cacheDir, { recursive: true });

  const isCloudinary = (u) => /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(u);
  const isRemote = (u) => /^https?:\/\//.test(u);

  const cloudinaryAt = (url, w) => {
    const [head, tail] = url.split('/image/upload/');
    const parts = tail.split('/');
    // Quita los segmentos de transformación existentes (q_auto,f_auto,w_800 · q_auto/f_auto …)
    while (parts.length > 1 && !/^v\d+$/.test(parts[0]) && /^[a-z]{1,3}_[^/]*$/.test(parts[0].split(',')[0])) parts.shift();
    return `${head}/image/upload/q_auto,f_auto,w_${w}/${parts.join('/')}`;
  };

  /**
   * @param {string} src     valor del campo imagen
   * @param {object} o       { slug, widths:[...] }
   * @returns descriptor listo para pintar con <picture>/<img>
   */
  async function get(src, { slug, widths }) {
    if (!src) return null;
    src = String(src).trim();
    const key = `${src}|${widths.join(',')}`;
    if (!memo.has(key)) memo.set(key, build(src, slug, widths));
    return memo.get(key);
  }

  async function build(src, slug, widths) {
    if (isCloudinary(src)) {
      return {
        kind: 'cloudinary',
        src: cloudinaryAt(src, widths[Math.min(1, widths.length - 1)]),
        srcset: widths.map((w) => `${cloudinaryAt(src, w)} ${w}w`).join(', '),
        width: null,
        height: null,
        url: (w) => cloudinaryAt(src, w),
      };
    }
    if (isRemote(src)) return { kind: 'remote', src, srcset: '', width: null, height: null, url: () => src };

    const rel = decodeURI(src.replace(/^\/+/, '').split(/[?#]/)[0]);
    const file = path.join(root, rel);
    if (!file.startsWith(root) || !fs.existsSync(file))
      throw new BuildError(`Imagen no encontrada: "${src}" (proyecto ${slug}). ¿Se subió el archivo al repositorio?`);

    const buf = fs.readFileSync(file);
    const meta = await sharp(buf).metadata();
    const W = meta.width, H = meta.height;
    const alpha = !!meta.hasAlpha;
    const fallbackFmt = alpha ? 'png' : 'jpeg';
    const base = path.basename(rel).replace(/\.[^.]+$/, '').replace(/-(\d{3,4})$/, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    let ws = [...new Set(widths.map((w) => Math.min(w, W)))].sort((a, b) => a - b);
    const hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
    const pub = `/assets/proyectos/${slug}`;

    const out = { avif: [], webp: [], [fallbackFmt]: [] };
    const jobs = [];
    for (const w of ws) {
      for (const fmt of ['avif', 'webp', fallbackFmt]) {
        const ext = fmt === 'jpeg' ? 'jpg' : fmt;
        const name = `${base}-${hash}-${w}.${ext}`;
        const dest = path.join(outDir, pub, name);
        out[fmt].push({ url: `${pub}/${name}`, w });
        if (written.has(dest)) continue;
        written.add(dest);
        const ck = crypto.createHash('sha1').update(`${CACHE_VERSION}|${hash}|${w}|${fmt}|${Q[fmt]}`).digest('hex');
        const cached = path.join(cacheDir, `${ck}.${ext}`);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        if (fs.existsSync(cached)) {
          fs.copyFileSync(cached, dest);
          fromCache++;
          continue;
        }
        jobs.push(() =>
          limit(async () => {
            let img = sharp(buf).rotate().resize({ width: w, withoutEnlargement: true });
            img =
              fmt === 'avif' ? img.avif({ quality: Q.avif, effort: 2 })
              : fmt === 'webp' ? img.webp({ quality: Q.webp, effort: 4 })
              : fmt === 'png' ? img.png({ compressionLevel: 9, palette: false })
              : img.jpeg({ quality: Q.jpeg, mozjpeg: true, progressive: true });
            const tmp = `${cached}.${process.pid}.tmp`;
            await img.toFile(tmp);
            fs.renameSync(tmp, cached);
            fs.copyFileSync(cached, dest);
            processed++;
          }),
        );
      }
    }
    await Promise.all(jobs.map((j) => j()));
    const mid = out[fallbackFmt][Math.min(1, ws.length - 1)];
    const toSet = (list) => list.map((x) => `${x.url} ${x.w}w`).join(', ');
    return {
      kind: 'local',
      width: W,
      height: H,
      src: mid.url,
      srcset: toSet(out[fallbackFmt]),
      sources: [
        { type: 'image/avif', srcset: toSet(out.avif) },
        { type: 'image/webp', srcset: toSet(out.webp) },
      ],
      url: (w) => {
        const list = out[fallbackFmt];
        return (list.find((x) => x.w >= w) || list[list.length - 1]).url;
      },
      largest: out[fallbackFmt][out[fallbackFmt].length - 1].url,
    };
  }

  return { get, stats: () => ({ processed, fromCache }) };
}

/**
 * Pinta una imagen con <picture> (locales) o <img srcset> (Cloudinary).
 * extra: atributos adicionales como string ya escapado (alt, loading…).
 */
export function pictureHtml(img, { alt, sizes, attrs = '', width, height }) {
  if (!img) return '';
  const a = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const w = width ?? img.width;
  const h = height ?? img.height;
  const dims = w && h ? ` width="${w}" height="${h}"` : '';
  if (img.kind === 'local') {
    const s = img.sources.map((x) => `<source type="${x.type}" srcset="${x.srcset}" sizes="${a(sizes)}">`).join('');
    return `<picture>${s}<img src="${img.src}" srcset="${img.srcset}" sizes="${a(sizes)}" alt="${a(alt)}"${dims}${attrs}></picture>`;
  }
  const ss = img.srcset ? ` srcset="${img.srcset}" sizes="${a(sizes)}"` : '';
  return `<img src="${img.src}"${ss} alt="${a(alt)}"${dims}${attrs}>`;
}
