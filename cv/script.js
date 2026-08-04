/* ═══════════════════════════════════════════════════════════════
   /cv/script.js — contadores de estadísticas + scroll-reveal
   (misma lógica que el resto del sitio, para consistencia)
═══════════════════════════════════════════════════════════════ */

// ─── ESTADÍSTICAS — contadores + barras animadas ─────────────────
(function initStats() {
  const items = document.querySelectorAll('.stat-item');
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const item = entry.target;
      item.classList.add('in-view');

      const numEl = item.querySelector('.stat-num');
      if (!numEl) return;
      const target   = parseInt(numEl.dataset.target, 10);
      const suffix   = numEl.dataset.suffix || '';
      const duration = 1600;
      const start    = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3);
        const current  = Math.round(target * ease);
        numEl.textContent = (numEl.textContent.trim().startsWith('$') ? '$' : '') +
                             current.toLocaleString('es-CO') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      obs.unobserve(item);
    });
  }, { threshold: 0.4 });

  items.forEach(item => obs.observe(item));
})();

// ─── SCROLL REVEAL ────────────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.scroll-reveal').forEach(el => revealObs.observe(el));
