/* trabajo/pulse-digital/script.js */

// ─── WhatsApp ─────────────────────────────────────────────────────
document.getElementById('whatsappBtn')?.addEventListener('click', () => {
  const phone   = '573024457653';
  const message = encodeURIComponent(
    '¡Hola Alexander! Vi tu proyecto Pulse Digital. Necesito un sitio en inglés que venda en el mercado internacional. ¿Podemos hablar?'
  );
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
});

// ─── Scroll reveal ────────────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.scroll-reveal').forEach((el) => revealObs.observe(el));

// ─── Barra de progreso de scroll ──────────────────────────────────
const progressBar = document.getElementById('scrollProgress');
if (progressBar) {
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    progressBar.style.width = Math.min(100, Math.max(0, scrolled * 100)) + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ─── Preview "sitio en vivo": escalar el iframe desktop al ancho real ──
// El iframe se renderiza a 1440px (vista desktop) y lo reducimos por JS
// según el ancho del contenedor. El alto lo fija el aspect-ratio en CSS,
// así que aquí sólo ajustamos la escala. Sin esto, un sitio responsive
// mostraría su layout móvil dentro de un marco ancho.
const fitPreviews = () => {
  document.querySelectorAll('.pd-browser__viewport').forEach((vp) => {
    const frame = vp.querySelector('.pd-browser__frame');
    if (!frame) return;
    const scale = vp.clientWidth / 1440;
    frame.style.transform = `scale(${scale})`;
  });
};
window.addEventListener('resize', fitPreviews, { passive: true });
window.addEventListener('load', fitPreviews);
fitPreviews();

// ─── MOTOR DE PARTÍCULAS ──────────────────────────────────────────
// Compartido con el resto del portafolio. Acento ORO de marca.
const initParticles = (config) => {
  const canvas = document.getElementById(config.canvasId);
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.style.display = 'none'; return; }

  const ctx = canvas.getContext('2d');
  let W, H, particles;
  const mouse = { x: -9999, y: -9999 };
  const C = {
    count: 64,
    maxRadius: 1.4,
    speed: 0.26,
    connectionDist: 112,
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
