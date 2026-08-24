/* ═══════════════════════════════════════════════════════════════
   /cv/script.js — contadores, scroll-reveal, scroll-spy,
   dock móvil y botón "volver arriba".

   Todo con IntersectionObserver y listeners pasivos: cero coste
   de layout durante el scroll.
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── 1. CONTADORES DE MÉTRICAS ──────────────────────────────
     Cuentan desde data-count-from (o 0) hasta data-count-to.
     El PageSpeed arranca en 40 a propósito: cuenta la historia. */
  function initCounters() {
    var nums = document.querySelectorAll('[data-count-to]');
    if (!nums.length) return;

    if (reduced) return; // el HTML ya trae el valor final

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el     = entry.target;
        var from   = parseInt(el.dataset.countFrom, 10) || 0;
        var to     = parseInt(el.dataset.countTo, 10);
        var suffix = el.dataset.suffix || '';
        var dur    = 1500;
        var start  = performance.now();

        function tick(now) {
          var p    = Math.min((now - start) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          var val  = Math.round(from + (to - from) * ease);
          el.textContent = val.toLocaleString('es-CO') + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    nums.forEach(function (n) { obs.observe(n); });
  }

  /* ─── 2. SCROLL REVEAL ───────────────────────────────────── */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (reduced) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { obs.observe(el); });
  }

  /* ─── 3. SCROLL-SPY DEL NAV ──────────────────────────────── */
  function initScrollSpy() {
    var wrap = document.getElementById('cvxNavLinks');
    if (!wrap) return;

    var links = Array.prototype.slice.call(wrap.querySelectorAll('a[href^="#"]'));
    var map   = {};

    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) map[id] = a;
    });

    var ids = Object.keys(map);
    if (!ids.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        var active = map[e.target.id];
        if (active) {
          active.classList.add('is-active');
          // Mantiene visible el ítem activo en el scroll horizontal del nav móvil
          if (wrap.scrollWidth > wrap.clientWidth) {
            var left = active.offsetLeft - wrap.clientWidth / 2 + active.offsetWidth / 2;
            wrap.scrollTo({ left: left, behavior: reduced ? 'auto' : 'smooth' });
          }
        }
      });
    }, { rootMargin: '-58px 0px -62% 0px', threshold: 0 });

    ids.forEach(function (id) { obs.observe(document.getElementById(id)); });
  }

  /* ─── 4. DOCK MÓVIL + VOLVER ARRIBA ──────────────────────── */
  function initFloating() {
    var dock = document.getElementById('cvxDock');
    var top  = document.getElementById('cvxTop');
    if (!dock && !top) return;

    var ticking = false;

    function update() {
      var show = window.scrollY > window.innerHeight * 0.6;
      if (dock) {
        dock.classList.toggle('is-visible', show);
        dock.setAttribute('aria-hidden', show ? 'false' : 'true');
      }
      if (top) top.classList.toggle('is-visible', show);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    if (top) {
      top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      });
    }

    update();
  }

  /* ─── ARRANQUE ───────────────────────────────────────────── */
  function boot() {
    initCounters();
    initReveal();
    initScrollSpy();
    initFloating();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
