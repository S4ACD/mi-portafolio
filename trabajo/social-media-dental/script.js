/* ═══════════════════════════════════════════════════════
   SOCIAL MEDIA DENTAL — script.js
═══════════════════════════════════════════════════════ */

(function () {

  // ── SCROLL REVEAL ────────────────────────────────────
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));

  // ── COUNTERS ─────────────────────────────────────────
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target);
      const divisor = parseInt(el.dataset.divisor) || 1;
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      function update(now) {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * ease / divisor * 10) / 10;
        el.textContent = (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.sm-counter').forEach(el => counterObs.observe(el));

  // ── CAROUSELS ─────────────────────────────────────────
  document.querySelectorAll('.sm-carousel-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const trackId = btn.dataset.target;
      const dotsId  = btn.dataset.dots;
      const track   = document.getElementById(trackId);
      const dots    = document.getElementById(dotsId);
      if (!track) return;

      const slides = track.querySelectorAll('.sm-phone__slide');
      let current = parseInt(track.dataset.current || '0');
      const dir   = btn.classList.contains('sm-carousel-btn--next') ? 1 : -1;
      current = (current + dir + slides.length) % slides.length;
      track.dataset.current = current;
      track.style.transform = `translateX(-${current * 100}%)`;

      if (dots) {
        dots.querySelectorAll('.sm-dot').forEach((d, i) => {
          d.classList.toggle('sm-dot--active', i === current);
        });
      }
    });
  });

  // Touch swipe for carousels
  document.querySelectorAll('.sm-phone__carousel-wrap').forEach(wrap => {
    let startX = 0;
    wrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 40) return;
      const dir = diff > 0 ? '.sm-carousel-btn--next' : '.sm-carousel-btn--prev';
      wrap.querySelector(dir)?.click();
    }, { passive: true });
  });

  // ── LIGHTBOX ─────────────────────────────────────────
  const lightbox    = document.getElementById('smLightbox');
  const lightboxImg = document.getElementById('smLightboxImg');
  const lightboxBg  = document.getElementById('smLightboxBg');
  const lightboxClose = document.getElementById('smLightboxClose');

  function openLightbox(src, alt) {
    lightboxImg.src  = src;
    lightboxImg.alt  = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 300);
  }

  // Posts
  document.querySelectorAll('.sm-phone').forEach(phone => {
    phone.addEventListener('click', () => {
      const img = phone.dataset.img;
      const alt = phone.dataset.alt;
      if (img) openLightbox(img, alt);
    });
  });

  // Stories
  document.querySelectorAll('.sm-story').forEach(story => {
    story.addEventListener('click', () => {
      const img = story.dataset.img;
      if (img) openLightbox(img, 'Story Orbidental');
    });
  });

  // Fechas
  document.querySelectorAll('.sm-fecha').forEach(fecha => {
    fecha.addEventListener('click', () => {
      const img   = fecha.dataset.img;
      const label = fecha.dataset.label;
      if (img) openLightbox(img, label);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBg)    lightboxBg.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  // ── WHATSAPP ─────────────────────────────────────────
  document.getElementById('whatsappBtn')?.addEventListener('click', () => {
    const msg = encodeURIComponent('¡Hola Alexander! Vi tu portafolio y me interesa el servicio de social media. ¿Podemos hablar?');
    window.open(`https://wa.me/573024457653?text=${msg}`, '_blank', 'noopener,noreferrer');
  });

  // ── PAGE TRANSITION ───────────────────────────────────
  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  document.body.appendChild(overlay);
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || link.target === '_blank') return;
    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 280);
    });
  });

  // ── SCROLL PROGRESS ───────────────────────────────────
  const bar = document.getElementById('scrollProgress');
  if (bar) {
    window.addEventListener('scroll', () => {
      const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      bar.style.width = (p * 100) + '%';
    }, { passive: true });
  }

})();
