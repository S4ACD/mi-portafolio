// Carga y normaliza el contenido de content/proyectos/*.yml.
//
// Formato de cada archivo (el mismo que escribe el panel /admin con i18n "single_file"):
//
//   es:
//     nombre: ONCES
//     ...todos los campos en español
//   en:
//     nombre: ONCES
//     ...los campos en inglés
//
// Los campos compartidos (imágenes, fechas, áreas…) se guardan en los dos
// idiomas. Si a una traducción le falta un campo, se usa el valor en español.

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { BuildError, LANGS } from './util.mjs';

const load = (txt, file) => {
  try {
    return (yaml.safeLoad || yaml.load)(txt) ?? {};
  } catch (e) {
    throw new BuildError(`YAML inválido en ${file}: ${e.message}`);
  }
};

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isEmpty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

/** Mezcla profunda: el idioma pisa al español solo donde tiene valor. */
const merge = (base, over) => {
  if (!isObj(base) || !isObj(over)) return isEmpty(over) ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = merge(base[k], v);
  return out;
};

const PAGES = ['inicio', 'trabajo', 'cv', 'cv_dental'];

export function loadContent(root) {
  const dir = path.join(root, 'content/proyectos');
  const files = fs.readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort();
  const projects = [];
  const errors = [];

  for (const f of files) {
    const slug = f.replace(/\.ya?ml$/, '');
    const raw = load(fs.readFileSync(path.join(dir, f), 'utf8'), f);
    // Tolerancia: si el archivo no viene separado por idioma, se trata como español.
    const hasLocales = LANGS.some((l) => isObj(raw[l]));
    const shared = hasLocales ? Object.fromEntries(Object.entries(raw).filter(([k]) => !LANGS.includes(k))) : raw;
    const es = merge(shared, hasLocales ? raw.es || {} : {});
    const en = merge(es, hasLocales ? raw.en || {} : {});
    const p = { slug, file: f, es, en, ...normalizeShared(es) };

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
      errors.push(`${f}: el nombre del archivo debe ser un slug en minúsculas con guiones (ej. "mi-proyecto.yml").`);
    if (!es.nombre) errors.push(`${f}: falta "nombre".`);
    if (p.publicado) {
      for (const lang of LANGS) {
        const d = p[lang];
        if (!d.resumen) errors.push(`${f} [${lang}]: falta "Resumen".`);
        if (p.pagina === 'plantilla') {
          if (!d.seo?.descripcion) errors.push(`${f} [${lang}]: falta "SEO → Descripción".`);
          if (!d.caso?.intro) errors.push(`${f} [${lang}]: falta "Página del caso → Introducción".`);
        }
      }
      if (p.portada.estilo === 'foto' && !p.portada.imagen) errors.push(`${f}: la portada es "foto" pero no tiene imagen.`);
    }
    projects.push(p);
  }

  const orderFile = path.join(root, 'content/portafolio.yml');
  const order = fs.existsSync(orderFile) ? load(fs.readFileSync(orderFile, 'utf8'), 'portafolio.yml') : {};

  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  for (const page of PAGES)
    for (const s of order[page] || [])
      if (!bySlug.has(s)) errors.push(`portafolio.yml → "${page}" menciona "${s}", pero no existe content/proyectos/${s}.yml.`);

  if (errors.length) throw new BuildError('Hay errores en el contenido:\n  · ' + errors.join('\n  · '));

  const published = projects.filter((p) => p.publicado);

  /**
   * Proyectos de una página, en orden:
   *   1. los nuevos que aún no están en portafolio.yml (más recientes primero),
   *   2. después, el orden que definiste en portafolio.yml.
   * Así, un proyecto recién subido aparece arriba sin tener que ordenar nada.
   */
  const listFor = (page) => {
    const visible = published.filter((p) => p.mostrar_en.includes(page));
    const listed = (order[page] || []).map((s) => bySlug.get(s)).filter((p) => p && visible.includes(p));
    const fresh = visible
      .filter((p) => !listed.includes(p))
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)) || a.slug.localeCompare(b.slug));
    const all = [...fresh, ...listed];
    const max = Number(order[`max_${page}`]) || Infinity;
    return all.slice(0, max);
  };

  return {
    all: projects,
    published,
    bySlug,
    lists: Object.fromEntries(PAGES.map((p) => [p, listFor(p)])),
  };
}

function normalizeShared(es) {
  const portada = es.portada || {};
  return {
    publicado: es.publicado !== false,
    fecha: es.fecha ? String(es.fecha instanceof Date ? es.fecha.toISOString().slice(0, 10) : es.fecha).slice(0, 10) : '1970-01-01',
    areas: es.areas || [],
    mostrar_en: es.mostrar_en || [],
    concepto: !!es.concepto,
    destacado: !!es.destacado,
    anio: String(es.anio ?? '').trim(),
    color: es.color || '',
    pagina: es.pagina === 'plantilla' ? 'plantilla' : 'propia',
    portada: {
      imagen: portada.imagen || '',
      estilo: portada.estilo || (portada.imagen ? 'foto' : 'logotipo'),
      marco: portada.marco || 'no',
      logotipo_texto: portada.logotipo_texto || '',
      logotipo_acento: portada.logotipo_acento || '',
      logotipo_resto: portada.logotipo_resto || '',
      fondo: portada.fondo || '#0a0a0a',
    },
  };
}
