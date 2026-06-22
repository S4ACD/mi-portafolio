/* i18n.js — Motor de traducción global
   Uso: incluir en todas las páginas ANTES del cierre de </body>
   El nav.js ya inyecta el botón ES/EN — este archivo hace el resto. */

(() => {

  const STORAGE_KEY = 'ac_lang';
  const DEFAULT_LANG = 'es';
  const SUPPORTED    = ['es', 'en'];

  /* ── Detectar idioma activo ─────────────────────────────────── */
  const getSavedLang = () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  };

  const saveLang = (lang) => {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  };

  let currentLang = getSavedLang();
  if (!SUPPORTED.includes(currentLang)) currentLang = DEFAULT_LANG;

  /* ── Cargar archivo JSON de traducciones ────────────────────── */
  const loadTranslations = async (lang) => {
    const depth = (window.location.pathname.match(/\//g) || []).length - 1;
    const prefix = depth > 0 ? '../'.repeat(depth) : '';
    try {
      const res = await fetch(`${prefix}lang/${lang}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`[i18n] No se pudo cargar ${lang}.json`, e);
      return null;
    }
  };

  /* ── Aplicar traducciones al DOM ────────────────────────────── */
  const applyTranslations = (dict) => {
    if (!dict) return;

    /* Texto e innerHTML de elementos con data-i18n */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    /* Atributos: placeholder, aria-label, alt, content */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) el.placeholder = dict[key];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      if (dict[key] !== undefined) el.alt = dict[key];
    });

    /* Meta SEO dinámico */
    if (dict['meta.title'])       document.title = dict['meta.title'];
    if (dict['meta.description']) {
      let m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute('content', dict['meta.description']);
    }
    if (dict['meta.og.title']) {
      let m = document.querySelector('meta[property="og:title"]');
      if (m) m.setAttribute('content', dict['meta.og.title']);
    }
    if (dict['meta.og.description']) {
      let m = document.querySelector('meta[property="og:description"]');
      if (m) m.setAttribute('content', dict['meta.og.description']);
    }

    /* lang attribute en <html> */
    document.documentElement.lang = currentLang;

    /* og:locale */
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', currentLang === 'en' ? 'en_US' : 'es_CO');
  };

  /* ── Actualizar botón del nav ───────────────────────────────── */
  const updateLangBtn = () => {
    const btns = [
      document.getElementById('langToggle'),
      document.getElementById('langToggle-drawer')
    ];
    btns.forEach(btn => {
      if (!btn) return;
      btn.textContent = currentLang === 'es' ? 'EN' : 'ES';
      btn.setAttribute('aria-label', currentLang === 'es' ? 'Switch to English' : 'Cambiar a Español');
      btn.setAttribute('data-current', currentLang);
    });
  };

  /* ── Cambiar idioma ─────────────────────────────────────────── */
  const switchLang = async () => {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    saveLang(currentLang);
    const dict = await loadTranslations(currentLang);
    applyTranslations(dict);
    updateLangBtn();
  };

  /* ── Inicializar ────────────────────────────────────────────── */
  const init = async () => {
    /* Solo cargamos si el idioma no es el default, para no hacer
       fetch innecesario en la mayoría de visitas en español */
    if (currentLang !== DEFAULT_LANG) {
      const dict = await loadTranslations(currentLang);
      applyTranslations(dict);
    }
    updateLangBtn();

    /* Escuchar clic en el botón (puede llegar tarde si nav.js
       aún no lo inyectó — usamos delegación en document) */
    document.addEventListener('click', (e) => {
      if (e.target && (e.target.id === 'langToggle' || e.target.id === 'langToggle-drawer')) {
        e.preventDefault();
        switchLang();
      }
    });
  };

  /* Exponer API global por si alguna página quiere forzar idioma */
  window.i18n = { switch: switchLang, current: () => currentLang };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
