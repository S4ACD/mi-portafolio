/* ═══════════════════════════════════════════════════════════════
   script.js — Alexander Caro Portfolio
═══════════════════════════════════════════════════════════════ */

// ─── 1. NAV MÓVIL ──────────────────────────────────────────────
const navBurger = document.getElementById('navBurger');
const navDrawer = document.getElementById('navDrawer');
const nav       = document.getElementById('nav');

navBurger?.addEventListener('click', () => {
  const isOpen = navDrawer.classList.toggle('open');
  navBurger.setAttribute('aria-expanded', isOpen);
});
navDrawer?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navDrawer.classList.remove('open'));
});
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 20 ? '0 1px 32px rgba(0,0,0,0.7)' : 'none';
}, { passive: true });


// ─── 2. WHATSAPP ────────────────────────────────────────────────
document.getElementById('whatsappBtn')?.addEventListener('click', () => {
  const phone   = '573024457653';
  const message = encodeURIComponent(
    '¡Hola Alexander! Vi tu portafolio y me interesa cotizar un proyecto contigo. ¿Podemos hablar?'
  );
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
});


// ─── 3. SCROLL REVEAL ───────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.scroll-reveal').forEach(el => revealObs.observe(el));


// ─── 4. SKILL BARS ──────────────────────────────────────────────
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.skill-bar__fill').forEach((bar, i) => {
      setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, i * 100);
    });
    skillObs.unobserve(e.target);
  });
}, { threshold: 0.3 });
const skillsSection = document.querySelector('.about__skills');
if (skillsSection) skillObs.observe(skillsSection);


// ─── 5. SMOOTH SCROLL ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - (nav?.offsetHeight ?? 64);
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});


// ─── 6. DESCARGAR CV ────────────────────────────────────────────
document.getElementById('downloadCV')?.addEventListener('click', e => {
  e.preventDefault();
  const a = document.createElement('a');
  a.href = 'CV_Alexander_Caro.pdf';
  a.download = 'CV_Alexander_Caro.pdf';
  a.click();
});


// ─── 7. PARTÍCULAS EN EL HERO (Canvas) ─────────────────────────
(function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  // Respetar prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let W, H, particles, mouse = { x: -9999, y: -9999 };

  // ── Configuración ──
  const CONFIG = {
    count:        110,        // cantidad de partículas
    maxRadius:    1.8,        // tamaño máximo
    speed:        0.35,       // velocidad base
    connectionDist: 130,      // distancia para trazar líneas
    mouseRadius:  140,        // radio de repulsión del mouse
    color:        '0,229,229' // RGB del cyan
  };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.4 + Math.random() * 0.6) * CONFIG.speed;
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r:  0.4 + Math.random() * CONFIG.maxRadius,
      // opacidad base aleatoria para variedad
      alpha: 0.3 + Math.random() * 0.5
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // ── Actualizar posiciones ──
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Rebotar en bordes
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Repulsión suave del mouse
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.mouseRadius) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
        p.x += (dx / dist) * force * 1.8;
        p.y += (dy / dist) * force * 1.8;
      }
    });

    // ── Dibujar conexiones ──
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.connectionDist) {
          const opacity = (1 - dist / CONFIG.connectionDist) * 0.18;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${CONFIG.color},${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // ── Dibujar puntos ──
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.color},${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  // ── Seguimiento del mouse ──
  const heroSection = document.getElementById('inicio');
  heroSection?.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
  heroSection?.addEventListener('mouseleave', () => {
    mouse.x = -9999; mouse.y = -9999;
  });

  // ── Touch ──
  heroSection?.addEventListener('touchmove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
  }, { passive: true });

  // ── Resize ──
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); }, 150);
  });

  init();
  draw();
})();


// ─── 8. TYPEWRITER ──────────────────────────────────────────────
(function typewriter() {
  const line1  = 'Alexander Caro';   // sin punto — línea 1 sin decoración
  const line2  = 'Designer & Developer.'; // punto azul solo aquí
  const t1     = document.getElementById('typeTarget');
  const t2     = document.getElementById('typeTarget2');
  if (!t1 || !t2) return;

  const SPEED  = 68;   // ms por letra
  const PAUSE  = 340;  // pausa entre línea 1 y línea 2

  // Línea 1 — texto plano, sin cursor visible
  let i = 0;
  function typeLine1() {
    if (i < line1.length) {
      t1.textContent = line1.slice(0, i + 1);
      i++;
      setTimeout(typeLine1, SPEED);
    } else {
      setTimeout(typeLine2, PAUSE);
    }
  }

  // Línea 2 — con punto azul al llegar al "." y cursor al final
  let j = 0;
  function typeLine2() {
    if (j < line2.length) {
      let html = '';
      for (let k = 0; k <= j; k++) {
        const c = line2[k];
        if (c === '.') html += '<span class="hero__dot">.</span>';
        else if (c === '&') html += '<span class="hero__amp">&amp;</span>';
        else html += c;
      }
      t2.innerHTML = html;
      j++;
      setTimeout(typeLine2, SPEED);
    }
    // cursor ya está en el HTML, sigue parpadeando solo
  }

  // Arrancar tras el reveal-up (0.9s de animación)
  setTimeout(typeLine1, 980);
})();