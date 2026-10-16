// Utilidades compartidas del build: escape de HTML, markdown en línea,
// textos fijos de la interfaz por idioma.

export const SITE = 'https://alexandercaro.com';
export const LANGS = ['es', 'en'];

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const attr = (s) => esc(s).replace(/"/g, '&quot;');

/**
 * Markdown mínimo en línea para textos cortos del panel:
 * **negrita**, *cursiva* y saltos de línea. Todo lo demás se escapa.
 */
export const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\n/g, '<br>');

/** Texto plano (para alt, meta, JSON-LD): quita el markdown en línea. */
export const plain = (s) => String(s ?? '').replace(/\*\*?/g, '').replace(/\s+/g, ' ').trim();

/** URL pública de un proyecto. */
export const projectUrl = (slug, lang, abs = false) =>
  (abs ? SITE : '') + (lang === 'en' ? '/en' : '') + `/trabajo/${slug}/`;

export const UI = {
  es: {
    challenge: 'El reto:',
    decision: 'La decisión:',
    seeCase: 'Ver el caso completo',
    seeCaseShort: 'Ver el caso',
    concept: 'Concepto propio',
    featured: 'Caso destacado',
    moreProjects: (n) => `Ver los ${n} proyectos con casos de estudio detallados →`,
    back: 'Volver a proyectos',
    home: 'Inicio',
    work: 'Trabajo',
    services: 'Servicios',
    about: 'Sobre mí',
    client: 'Cliente',
    year: 'Año',
    nextProject: 'Siguiente proyecto',
    whatsapp: 'Escríbeme por WhatsApp',
    moreWork: 'Ver más proyectos',
    credits: 'Créditos',
    itemListName: 'Trabajo seleccionado — Alexander Caro',
    itemListDesc: 'Proyectos de diseño web, desarrollo frontend, SEO técnico e identidad visual.',
    waText: (name) => `¡Hola Alexander! Vi tu proyecto ${name} y me interesa algo similar para mi marca. ¿Podemos hablar?`,
    numbers: ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'],
    locale: 'es_CO',
  },
  en: {
    challenge: 'The challenge:',
    decision: 'The call:',
    seeCase: 'View full case study',
    seeCaseShort: 'View case study',
    concept: 'Own concept',
    featured: 'Featured case',
    moreProjects: (n) => `See all ${n} projects with detailed case studies →`,
    back: 'Back to projects',
    home: 'Home',
    work: 'Work',
    services: 'Services',
    about: 'About',
    client: 'Client',
    year: 'Year',
    nextProject: 'Next project',
    whatsapp: 'Message me on WhatsApp',
    moreWork: 'See more projects',
    credits: 'Credits',
    itemListName: 'Selected work — Alexander Caro',
    itemListDesc: 'Web design, frontend development, technical SEO and visual identity projects.',
    waText: (name) => `Hi Alexander! I saw your ${name} project and I'd like something similar for my brand. Can we talk?`,
    numbers: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
    locale: 'en_US',
  },
};

export const numberWord = (n, lang) => UI[lang].numbers[n] ?? String(n);

/** Áreas del panel → vocabulario de filtros de cada página. */
export const AREA_FILTERS = {
  inicio: { branding: ['branding'], web: ['web'], grafico: ['grafico'], social: ['social'], dental: ['dental'] },
  trabajo: {
    branding: ['identidad'],
    web: ['conversion', 'performance'],
    grafico: ['grafico'],
    social: ['social'],
    dental: ['dental'],
  },
};

export const filterTokens = (areas, page) => {
  const map = AREA_FILTERS[page];
  const out = [];
  for (const a of areas || []) for (const t of map[a] || []) if (!out.includes(t)) out.push(t);
  return out.join(' ');
};

export class BuildError extends Error {}
