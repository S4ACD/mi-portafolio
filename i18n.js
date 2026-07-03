/* i18n.js — Idiomas por URL real
   ES vive en /  ·  EN vive en /en/  (páginas estáticas generadas con build-en.py)
   Este script:
   1. Detecta el idioma por la ruta (no por localStorage).
   2. En /en/ carga lang/en.json para traducir lo que inyecta JS (nav, selects).
   3. El botón ES/EN NAVEGA a la página equivalente en el otro idioma. */

(() => {

  const STORAGE_KEY = 'ac_lang';
  const path  = window.location.pathname;
  const onEN  = path === '/en' || path.startsWith('/en/');
  const currentLang = onEN ? 'en' : 'es';

  try { localStorage.setItem(STORAGE_KEY, currentLang); } catch {}

  /* ── URL equivalente en el otro idioma ──────────────────────── */
  const counterpartURL = () => {
    let target;
    if (onEN) {
      target = path.replace(/^\/en(?=\/|$)/, '') || '/';
    } else {
      target = '/en' + (path === '/' ? '/' : path);
    }
    /* /privacidad/ no tiene versión EN — siempre va a la ES */
    if (target.startsWith('/en/privacidad')) target = '/privacidad/';
    return target + window.location.hash;
  };

  /* ── Cargar JSON de traducciones (solo necesario en /en/) ───── */
  const loadTranslations = async (lang) => {
    const depth  = (path.match(/\//g) || []).length - 1;
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

  /* ── Aplicar traducciones al DOM (nav inyectada, selects…) ──── */
  const applyTranslations = (dict) => {
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    document.querySelectorAll('[data-i18n-select]').forEach(el => {
      const key  = el.getAttribute('data-i18n-select');
      const opts = dict[key];
      if (!Array.isArray(opts)) return;
      const currentVal = el.value;
      el.innerHTML = '';
      opts.forEach((opt, i) => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        if (i === 0) { o.disabled = true; o.selected = true; }
        el.appendChild(o);
      });
      if (currentVal) el.value = currentVal;
    });

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
  };

  /* ── Botón del nav ──────────────────────────────────────────── */
  const updateLangBtn = () => {
    [document.getElementById('langToggle'), document.getElementById('langToggle-drawer')]
      .forEach(btn => {
        if (!btn) return;
        btn.textContent = currentLang === 'es' ? 'EN' : 'ES';
        btn.setAttribute('aria-label', currentLang === 'es' ? 'Switch to English' : 'Cambiar a Español');
        btn.setAttribute('title',      currentLang === 'es' ? 'English version'   : 'Versión en español');
        btn.setAttribute('data-current', currentLang);
      });
  };

  const switchLang = () => {
    const target = counterpartURL();
    try { localStorage.setItem(STORAGE_KEY, currentLang === 'es' ? 'en' : 'es'); } catch {}
    window.location.href = target;
  };

  /* ── Init ───────────────────────────────────────────────────── */
  const init = async () => {
    if (onEN) {
      /* La página ya es EN estática; esto traduce lo que inyecta JS
         (nav/drawer) y mantiene selects consistentes. */
      const dict = await loadTranslations('en');
      applyTranslations(dict);
    }
    updateLangBtn();

    document.addEventListener('click', (e) => {
      if (e.target && (e.target.id === 'langToggle' || e.target.id === 'langToggle-drawer')) {
        e.preventDefault();
        switchLang();
      }
    });
  };

  window.i18n = { switch: switchLang, current: () => currentLang };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
