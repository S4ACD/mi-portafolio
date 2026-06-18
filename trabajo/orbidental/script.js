/* trabajo/orbidental/script.js */

// WhatsApp
document.getElementById('whatsappBtn')?.addEventListener('click', () => {
  const phone   = '573024457653';
  const message = encodeURIComponent(
    '¡Hola Alexander! Vi tu proyecto de Orbidental y me interesa un rediseño web similar. ¿Podemos hablar?'
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

// ─── CARRUSEL EDITORIAL ───────────────────────────────────────────
document.querySelectorAll('.proj-carousel').forEach((carousel) => {
  const track = carousel.querySelector('.proj-carousel__track');
  const slides = Array.from(carousel.querySelectorAll('.proj-carousel__slide'));
  const counter = carousel.querySelector('.proj-carousel__counter .current');
  const prevBtn = carousel.querySelector('[data-dir="-1"]');
  const nextBtn = carousel.querySelector('[data-dir="1"]');
  if (!track || !slides.length) return;

  const pad = (n) => String(n).padStart(2, '0');
  const count = slides.length;

  // El índice es estado explícito, no se recalcula leyendo scrollLeft a mitad
  // de una animación (eso era lo que rompía el contador y los botones).
  let current = 0;
  let isAnimating = false;

  const renderCounter = () => { if (counter) counter.textContent = pad(current + 1); };

  // Los slides usan scroll-snap-align: start, así que el slide "activo" es el
  // que está más cerca de alinear su borde izquierdo con el borde izquierdo
  // visible del track (no el centro del viewport — medir contra el centro
  // hacía que el slide 0 nunca se detectara como activo por el padding inicial).
  const syncFromScroll = () => {
    if (isAnimating) return;
    let best = 0, bestDist = Infinity;
    slides.forEach((s, i) => {
      const dist = Math.abs(s.offsetLeft - track.scrollLeft);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    current = best;
    renderCounter();
  };

  const scrollToIndex = (idx) => {
    const isWrapping = idx >= count || idx < 0; // dio la vuelta del ciclo
    const wrapped = ((idx % count) + count) % count;
    current = wrapped;
    renderCounter();
    isAnimating = true;
    const target = slides[wrapped];
    // Al dar la vuelta (siguiente desde el último, o anterior desde el primero)
    // el salto es instantáneo, para no hacer un scroll visual largo hacia atrás
    // que se vería como "retroceder" en vez de "seguir avanzando".
    const behavior = isWrapping ? 'auto' : 'smooth';
    track.scrollTo({ left: target.offsetLeft, behavior });
    clearTimeout(track._animLock);
    const lockDuration = behavior === 'smooth' ? 500 : 150;
    track._animLock = setTimeout(() => {
      isAnimating = false;
      // El navegador puede haber clampeado el scroll real (si el slide
      // destino no tenía suficiente espacio para desplazarse del todo).
      // Reafirmamos el índice "current" como fuente de verdad en vez de
      // dejar que el siguiente evento scroll lo recalcule mal.
      renderCounter();
    }, lockDuration);
  };

  prevBtn?.addEventListener('click', () => scrollToIndex(current - 1));
  nextBtn?.addEventListener('click', () => scrollToIndex(current + 1));

  let scrollTimer;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(syncFromScroll, 100);
  }, { passive: true });

  renderCounter();
});
