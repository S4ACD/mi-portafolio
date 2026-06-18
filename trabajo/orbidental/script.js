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

// ─── CARRUSEL EDITORIAL — LOOP INFINITO REAL ──────────────────────
// Técnica: clonar los primeros y últimos slides en cada extremo del track.
// Así, al llegar al final, lo que se ve a continuación ya es una copia del
// primer slide (no un hueco vacío); cuando el scroll entra en la zona
// clonada, saltamos sin transición a la posición real equivalente. El ojo
// nunca percibe el "corte" porque siempre hay imagen visible en ambos lados.
document.querySelectorAll('.proj-carousel').forEach((carousel) => {
  const track = carousel.querySelector('.proj-carousel__track');
  const originalSlides = Array.from(carousel.querySelectorAll('.proj-carousel__slide'));
  const counter = carousel.querySelector('.proj-carousel__counter .current');
  const prevBtn = carousel.querySelector('[data-dir="-1"]');
  const nextBtn = carousel.querySelector('[data-dir="1"]');
  if (!track || !originalSlides.length) return;

  const count = originalSlides.length;
  const pad = (n) => String(n).padStart(2, '0');

  // Cuántos clones poner en cada extremo: con pocos slides (como en este
  // carrusel, 6 imágenes) clonamos el set COMPLETO en cada lado. Es la
  // forma más simple de garantizar que nunca aparezca un hueco vacío al
  // final del recorrido, sin importar qué tan ancha sea la pantalla ni
  // cuántas tarjetas quepan a la vez — un número fijo más bajo (ej. 3) se
  // quedaba corto en monitores anchos donde caben ~4 tarjetas, dejando
  // expuesto ese hueco justo al llegar al final y seguir avanzando.
  // Si en el futuro el carrusel tuviera muchas más imágenes, esto se
  // podría acotar de nuevo a un número fijo razonable (ej. 6-8).
  const CLONES = count;

  const headClones = originalSlides.slice(0, CLONES).map((s) => {
    const c = s.cloneNode(true);
    c.setAttribute('data-clone', 'tail'); // visualmente está al final, es copia del inicio
    c.setAttribute('aria-hidden', 'true');
    return c;
  });
  const tailClones = originalSlides.slice(-CLONES).map((s) => {
    const c = s.cloneNode(true);
    c.setAttribute('data-clone', 'head'); // visualmente está al principio, es copia del final
    c.setAttribute('aria-hidden', 'true');
    return c;
  });

  tailClones.forEach((c) => track.insertBefore(c, track.firstChild));
  headClones.forEach((c) => track.appendChild(c));

  // Todos los slides en el DOM ahora, en orden: [clones-cola][reales][clones-cabeza]
  const allSlides = Array.from(carousel.querySelectorAll('.proj-carousel__slide'));
  const OFFSET = tailClones.length; // índice donde empiezan los slides reales

  let current = 0;       // índice lógico (0..count-1), lo que se muestra en el contador
  let isAnimating = false;
  const queue = [];      // cola FIFO de direcciones pendientes: cada elemento es +1 o -1

  const renderCounter = () => { if (counter) counter.textContent = pad(current + 1); };

  const realIndexFor = (logicalIdx) => OFFSET + logicalIdx;

  // Posiciona el track instantáneamente (sin animación) en el slide real
  // correspondiente al índice lógico — usado para el "teletransporte" al
  // cruzar hacia una zona clonada.
  const jumpTo = (logicalIdx) => {
    const target = allSlides[realIndexFor(logicalIdx)];
    track.scrollLeft = target.offsetLeft;
  };

  // Arranca posicionado en el primer slide real (saltando los clones de cola).
  jumpTo(0);
  renderCounter();

  const ANIM_MS = 380; // debe ser >= la duración real de la transición smooth del navegador

  // Único punto de entrada para avanzar: si no hay nada corriendo, arranca
  // inmediatamente; si hay una animación en curso, el paso ya quedó en la
  // cola (ver `step`) y se procesará automáticamente cuando termine.
  const processQueue = () => {
    if (isAnimating || queue.length === 0) return;
    const dir = queue.shift();
    const logicalIdx = current + dir;
    const isWrapping = logicalIdx >= count || logicalIdx < 0; // dio la vuelta al ciclo
    const wrapped = ((logicalIdx % count) + count) % count;

    current = wrapped;
    renderCounter();
    isAnimating = true;

    // Si damos la vuelta, animamos hacia el SLOT CLONADO contiguo (visualmente
    // idéntico al real), para que el scroll siga fluyendo en la misma
    // dirección sin saltar de golpe hacia atrás. Si no, animamos directo al
    // slide real.
    let targetEl;
    if (isWrapping && dir > 0) {
      targetEl = allSlides[OFFSET + count]; // justo después del último real (copia del primero)
    } else if (isWrapping && dir < 0) {
      targetEl = allSlides[OFFSET - 1]; // justo antes del primero real (copia del último)
    } else {
      targetEl = allSlides[realIndexFor(wrapped)];
    }
    track.scrollTo({ left: targetEl.offsetLeft, behavior: 'smooth' });

    setTimeout(() => {
      isAnimating = false;
      jumpTo(current); // si dimos la vuelta, reposiciona sin transición sobre el slide real
      processQueue();  // si quedaron pasos en cola, encadena el siguiente de inmediato
    }, ANIM_MS);
  };

  // Cada clic simplemente entra a la cola; processQueue decide si arranca ya
  // o espera su turno. Así nunca se pierde ni se duplica un paso, sin
  // importar cuántos clics rápidos lleguen.
  const step = (dir) => {
    queue.push(dir);
    processQueue();
  };

  prevBtn?.addEventListener('click', () => step(-1));
  nextBtn?.addEventListener('click', () => step(1));

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => jumpTo(current), 150);
  });
});
