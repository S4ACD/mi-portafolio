/* trabajo/acelerarte/script.js */

// WhatsApp
document.getElementById('whatsappBtn')?.addEventListener('click', () => {
  const phone   = '573024457653';
  const message = encodeURIComponent(
    '¡Hola Alexander! Vi AcelerArte y quiero un flyer/contenido así para mi equipo o evento de motos. ¿Podemos hablar?'
  );
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
});

// Scroll reveal
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.scroll-reveal').forEach((el) => revealObs.observe(el));


// ─── MOTOR DE PARTÍCULAS ──────────────────────────────────────────
// función compartida — mantener sincronizada en todos los script.js hasta migrar a un build step
const initParticles = (config) => {
  const canvas = document.getElementById(config.canvasId);
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.style.display = 'none'; return; }

  const ctx = canvas.getContext('2d');
  let W, H, particles;
  const mouse = { x: -9999, y: -9999 };
  const C = {
    count: 70,
    maxRadius: 1.4,
    speed: 0.28,
    connectionDist: 110,
    mouseRadius: 120,
    mousePush: 1.8,
    color: '205,183,142',
    ...config,
  };

  const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };

  const createParticle = () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.4 + Math.random() * 0.6) * C.speed;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 0.4 + Math.random() * C.maxRadius,
      alpha: 0.3 + Math.random() * 0.5,
    };
  };

  const init = () => { resize(); particles = Array.from({ length: C.count }, createParticle); };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < C.mouseRadius) {
        const force = (C.mouseRadius - d) / C.mouseRadius;
        p.x += (dx / d) * force * C.mousePush;
        p.y += (dy / d) * force * C.mousePush;
      }
    });
    if (C.connectionDist > 0) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < C.connectionDist) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${C.color},${(1 - d / C.connectionDist) * 0.15})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${C.color},${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  const hero = config.heroSelector ? document.querySelector(config.heroSelector) : null;
  hero?.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, { passive: true });
  hero?.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });

  init();
  draw();
};

initParticles({ canvasId: 'heroCanvas', heroSelector: '.proj-hero' });

// ─── LIGHTBOX — ver flyer en grande ─────────────────────────────
(function () {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  if (!lightbox || !lightboxImg || !closeBtn) return;

  let lastFocused = null;

  function openLightbox(src, alt) {
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
    // limpia el src después de la transición para no dejar la imagen cargada de fondo
    setTimeout(() => { if (!lightbox.classList.contains('is-open')) lightboxImg.src = ''; }, 300);
  }

  // Abrir: click en cualquier imagen marcada con data-lightbox
  document.querySelectorAll('[data-lightbox]').forEach((img) => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });

  // Cerrar: botón X
  closeBtn.addEventListener('click', closeLightbox);

  // Cerrar: click en cualquier parte fuera de la imagen (el overlay mismo)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Cerrar: tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
})();
