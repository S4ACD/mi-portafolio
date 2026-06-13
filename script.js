/* ═══════════════════════════════════════════════════════════════
   script.js — Alexander Caro Portfolio
═══════════════════════════════════════════════════════════════ */

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
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
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
    count:        110,
    maxRadius:    1.8,
    speed:        0.35,
    connectionDist: 130,
    mouseRadius:  140,
    color:        '0,229,229'
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
      alpha: 0.3 + Math.random() * 0.5
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.mouseRadius) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
        p.x += (dx / dist) * force * 1.8;
        p.y += (dy / dist) * force * 1.8;
      }
    });

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

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.color},${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  const heroSection = document.getElementById('inicio');
  heroSection?.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
  heroSection?.addEventListener('mouseleave', () => {
    mouse.x = -9999; mouse.y = -9999;
  });

  heroSection?.addEventListener('touchmove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
  }, { passive: true });

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
  const line1  = 'Alexander Caro';
  const line2  = 'Diseño. Código. Estrategia.';
  const t1     = document.getElementById('typeTarget');
  const t2     = document.getElementById('typeTarget2');
  if (!t1 || !t2) return;

  const SPEED  = 68;
  const PAUSE  = 340;

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
  }

  setTimeout(typeLine1, 980);
})();


// ─── TESTIMONIOS CARRUSEL ────────────────────────────────────────
(function initTestimonials() {
  const track   = document.getElementById('testimonialsTrack');
  const nextBtn = document.getElementById('testimonialsNext');
  const dots    = document.querySelectorAll('.testimonials__dot');
  if (!track || !nextBtn) return;

  let current = 0;
  const total = dots.length;

  function goTo(index) {
    current = (index + total) % total;
    const card = track.children[0];
    const cardWidth = card.offsetWidth + 24;
    track.style.transform = 'translateX(-' + (current * cardWidth) + 'px)';
    dots.forEach((d, i) => d.classList.toggle('testimonials__dot--active', i === current));
  }

  nextBtn.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  window.addEventListener('resize', () => goTo(current), { passive: true });

  let timer = setInterval(() => goTo(current + 1), 5000);
  track.parentElement.addEventListener('mouseenter', () => clearInterval(timer));
  track.parentElement.addEventListener('mouseleave', () => {
    timer = setInterval(() => goTo(current + 1), 5000);
  });

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });
})();


// ─── CONTADOR DE NÚMEROS ─────────────────────────────────────────
(function initCounters() {
  const stats = document.querySelectorAll('.stat__num');
  if (!stats.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent.trim();

      if (text === '∞') { obs.unobserve(el); return; }

      const isK     = text.includes('K');
      const hasPlus = text.includes('+');
      const target  = isK ? 3000 : parseInt(text);
      const duration = 1500;
      const start    = performance.now();

      function update(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3);
        const current  = Math.round(target * ease);

        if (isK) {
          el.textContent = (current >= 1000 ? Math.floor(current/1000) + 'K' : current) + (hasPlus ? '+' : '');
        } else {
          el.textContent = current + (hasPlus ? '+' : '');
        }

        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => obs.observe(el));
})();


// ─── TRANSICIÓN ENTRE PÁGINAS ────────────────────────────────────
(function initPageTransition() {
  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  document.body.appendChild(overlay);

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || link.getAttribute('target') === '_blank') return;

    link.addEventListener('click', function(e) {
      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(() => {
        window.location.href = href;
      }, 280);
    });
  });
})();


// ─── BARRA DE PROGRESO DE SCROLL ────────────────────────────────
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = progress + '%';
  }, { passive: true });
})();


// ─── EASTER EGG EN CONSOLA ──────────────────────────────────────
(function consoleEasterEgg() {
  const styles = [
    'color: #00e5e5; font-size: 18px; font-weight: bold; font-family: monospace;',
    'color: #888; font-size: 12px; font-family: monospace;',
    'color: #00e5e5; font-size: 13px; font-family: monospace;',
  ];
  console.log('%c¡Hola, dev curioso! 👋', styles[0]);
  console.log('%cSi estás leyendo esto, probablemente sabes lo que haces.', styles[1]);
  console.log('%c→ alexandercaro.com | @alexander_caro7', styles[2]);
  console.log('%cEste portafolio fue construido con HTML, CSS y JS vanilla — sin frameworks, sin magia negra.', styles[1]);
})();


// ─── FORMULARIO CONTACTO → WEB3FORMS ────────────────────────────
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('contactSubmitBtn');
  const btnText   = submitBtn?.querySelector('.btn-text');
  const btnIcon   = submitBtn?.querySelector('.btn-icon');
  const feedback  = document.getElementById('form-feedback');

  function setFeedback(type, msg) {
    if (!feedback) return;
    feedback.className = 'form-feedback form-feedback--' + type;
    feedback.innerHTML = msg;
  }

  function setLoading(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    if (on) {
      btnIcon && (btnIcon.style.display = 'none');
      btnText && (btnText.textContent = 'Enviando…');
    } else {
      btnIcon && (btnIcon.style.display = '');
      btnText && (btnText.textContent = 'Enviar mensaje');
    }
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('[required]').forEach(function(c) {
      if (!c.value.trim()) {
        c.classList.add('form-input--error');
        valid = false;
      } else {
        c.classList.remove('form-input--error');
      }
    });
    if (!valid) {
      setFeedback('error', '⚠️ Por favor completa todos los campos obligatorios.');
      return;
    }

    setFeedback('', '');
    setLoading(true);

    const data = new FormData(form);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: data
    })
    .then(function(res) { return res.json(); })
    .then(function(json) {
      if (json.success) {
        setFeedback('success',
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
          ' Mensaje enviado. Te respondo en menos de 24 horas.'
        );
        form.reset();
      } else {
        throw new Error(json.message || 'Error desconocido');
      }
    })
    .catch(function(err) {
      console.error('Web3Forms error:', err);
      setFeedback('error',
        '⚠️ No se pudo enviar el mensaje. Intenta de nuevo o escríbeme directamente por WhatsApp.'
      );
    })
    .finally(function() {
      setLoading(false);
    });
  });

  form.querySelectorAll('.form-input').forEach(function(input) {
    input.addEventListener('input', function() {
      this.classList.remove('form-input--error');
      if (feedback && feedback.classList.contains('form-feedback--error')) {
        setFeedback('', '');
      }
    });
  });
})();

// ─── HERO: TILT 3D + PARALLAX ───────────────────────────────────
(function heroInteractivity() {
  const tiltTarget  = document.getElementById('heroTiltTarget');
  const stage       = document.getElementById('heroAvatarRow');
  if (!tiltTarget) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const MAX_TILT    = 12;
  const PERSPECTIVE = 900;
  let   currentX = 0, currentY = 0;
  let   targetX  = 0, targetY  = 0;
  let   rafId    = null;
  let   isHovering = false;

  function tick() {
    currentX += (targetX - currentX) * 0.07;
    currentY += (targetY - currentY) * 0.07;

    tiltTarget.style.transform =
      `perspective(${PERSPECTIVE}px) rotateX(${currentY}deg) rotateY(${currentX}deg)`;

    if (Math.abs(targetX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02 || isHovering) {
      rafId = requestAnimationFrame(tick);
    } else {
      tiltTarget.style.transform = `perspective(${PERSPECTIVE}px) rotateX(0deg) rotateY(0deg)`;
      rafId = null;
    }
  }

  function startTick() { if (!rafId) rafId = requestAnimationFrame(tick); }

  tiltTarget.addEventListener('mousemove', function(e) {
    isHovering = true;
    const rect = tiltTarget.getBoundingClientRect();
    const dx   = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const dy   = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    targetX    =  dx * MAX_TILT;
    targetY    = -dy * MAX_TILT;
    startTick();
  }, { passive: true });

  tiltTarget.addEventListener('mouseleave', function() {
    isHovering = false;
    targetX = 0; targetY = 0;
    startTick();
  });

  // Parallax: el stage sube suavemente al hacer scroll
  const heroSection = document.getElementById('inicio');
  let scrollRafId   = null;

  function handleScroll() {
    if (scrollRafId) return;
    scrollRafId = requestAnimationFrame(function() {
      const heroH    = heroSection ? heroSection.offsetHeight : window.innerHeight;
      const progress = Math.min(window.scrollY / heroH, 1);
      if (stage) stage.style.transform = `translateY(${progress * -50}px)`;
      scrollRafId = null;
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
})();
