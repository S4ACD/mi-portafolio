/* ═══════════════════════════════════════════════════════════════
   script.js — Alexander Caro Portfolio
═══════════════════════════════════════════════════════════════ */

// ─── ESTADÍSTICAS — contadores + barras animadas ─────────────────
(function initStats() {
  const items = document.querySelectorAll('.stat-item');
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const item = entry.target;

      // Activar barra
      item.classList.add('in-view');

      // Animar contador
      const numEl  = item.querySelector('.stat-num');
      if (!numEl) return;
      const target = parseInt(numEl.dataset.target, 10);
      const suffix = numEl.dataset.suffix || '';
      const duration = 1600;
      const start  = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3);
        const current  = Math.round(target * ease);
        // Formato con punto de miles
        numEl.textContent = current.toLocaleString('es-CO') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      obs.unobserve(item);
    });
  }, { threshold: 0.4 });

  items.forEach(item => obs.observe(item));
})();


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
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(e.currentTarget.getAttribute('href'));
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


// ─── FILTROS DE PROYECTOS ────────────────────────────────────────
(function initProjectFilters() {
  const filters = document.querySelectorAll('.trabajo-filter[data-filter]');
  const cards   = document.querySelectorAll('.card--project[data-tags]');
  if (!filters.length || !cards.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const active = btn.dataset.filter;

      // Actualizar estado activo en botones
      filters.forEach(f => f.classList.remove('trabajo-filter--active'));
      btn.classList.add('trabajo-filter--active');

      // Fade out → display:none / display:block → fade in
      cards.forEach(card => {
        const tags = (card.dataset.tags || '').split(' ');
        const visible = active === 'todos' || tags.includes(active);

        if (!visible) {
          card.classList.add('card--hidden');
          // Quitar del flujo después del fade (310ms = transition + buffer)
          setTimeout(() => {
            if (card.classList.contains('card--hidden')) {
              card.style.display = 'none';
            }
          }, 310);
        } else {
          card.style.display = '';
          // Pequeño delay para que el browser procese el display antes del fade
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.classList.remove('card--hidden');
            });
          });
        }
      });
    });
  });
})();


// ─── TESTIMONIOS CARRUSEL ────────────────────────────────────────
(function initTestimonials() {
  const track   = document.getElementById('testimonialsTrack');
  const nextBtn = document.getElementById('testimonialsNext');
  const prevBtn = document.getElementById('testimonialsPrev');
  const dots    = document.querySelectorAll('.testimonials__dot');
  if (!track || !nextBtn) return;

  let current = 0;
  const total = dots.length;
  // Cachear cardWidth — se recalcula solo en resize, no en cada goTo()
  let cardWidth = track.children[0]?.offsetWidth || 0;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = 'translateX(-' + (current * cardWidth) + 'px)';
    dots.forEach((d, i) => d.classList.toggle('testimonials__dot--active', i === current));
  }

  nextBtn.addEventListener('click', () => goTo(current + 1));
  prevBtn?.addEventListener('click', () => goTo(current - 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  window.addEventListener('resize', () => {
    // Recalcular cardWidth tras el resize y reposicionar sin animación
    cardWidth = track.children[0]?.offsetWidth || cardWidth;
    track.style.transition = 'none';
    goTo(current);
    requestAnimationFrame(() => { track.style.transition = ''; });
  }, { passive: true });

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

    link.addEventListener('click', (e) => {
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
    'color: #cdb78e; font-size: 18px; font-weight: bold; font-family: monospace;',
    'color: #888; font-size: 12px; font-family: monospace;',
    'color: #cdb78e; font-size: 13px; font-family: monospace;',
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

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('[required]').forEach((c) => {
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
    .then((res) => res.json())
    .then((json) => {
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
    .catch((err) => {
      console.error('Web3Forms error:', err);
      setFeedback('error',
        '⚠️ No se pudo enviar el mensaje. Intenta de nuevo o escríbeme directamente por WhatsApp.'
      );
    })
    .finally(() => {
      setLoading(false);
    });
  });

  form.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('input', (e) => {
      e.currentTarget.classList.remove('form-input--error');
      if (feedback && feedback.classList.contains('form-feedback--error')) {
        setFeedback('', '');
      }
    });
  });
})();
