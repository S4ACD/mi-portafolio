/* ═══════════════════════════════════════════════════════════════
   sobre-mi/script.js
   Simple a propósito: WhatsApp + scroll-reveal. Ninguna animación
   del hero depende de JavaScript — todo lo visual vive en CSS puro,
   visible desde el primer render.
═══════════════════════════════════════════════════════════════ */

// ─── WHATSAPP ────────────────────────────────────────────────────
document.getElementById('whatsappBtn')?.addEventListener('click', () => {
  const phone   = '573024457653';
  const message = encodeURIComponent(
    '¡Hola Alexander! Vi tu portafolio y me interesa cotizar un proyecto contigo. ¿Podemos hablar?'
  );
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
});

// ─── SCROLL REVEAL ───────────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.scroll-reveal').forEach(el => revealObs.observe(el));
