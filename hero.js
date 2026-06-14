/* ════════════════════════════════════════════════════════════════════
   ALEXANDER CARO — HERO v3 — hero.js
   Loaded only on the homepage (see index.html).

     1. Lenis smooth-scroll        (skipped: touch, reduced-motion)
     2. Intro reveal timeline      (skipped: reduced-motion → instant)
     3. Idle "zero-gravity" float  (skipped: reduced-motion)
     4. Scroll "rise" parallax     (skipped: reduced-motion)
     5. Dust + star particles      (skipped: reduced-motion, see CSS)
     6. Magnetic CTAs               (skipped: touch, reduced-motion)

   Everything animates `transform` / `opacity` only — compositor-only,
   no layout thrash.
   ════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var hero = document.getElementById('inicio');
  if (!hero || !hero.classList.contains('hv2')) return;

  var reduceMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia('(pointer: coarse)').matches;

  /* ── Graceful degradation ──────────────────────────────────────────
     If GSAP/ScrollTrigger didn't load, undo the clip-reveal starting
     position so the headline is simply visible, then stop. Every other
     element already defaults to opacity:1 in CSS. */
  if (!window.gsap || !window.ScrollTrigger) {
    document.querySelectorAll('.hv2__title-line > span').forEach(function (span) {
      span.style.transform = 'translateY(0)';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ════════════════════════════════════════════════════════════════
     1. LENIS — SMOOTH SCROLL
     Turns scroll input into one continuous eased value that both the
     page scroll AND ScrollTrigger read from — without it the "rise"
     parallax below still works, but reads as jittery rather than
     cinematic. Skipped on touch (native momentum scroll is already
     excellent there) and for reduced-motion users.
     ════════════════════════════════════════════════════════════════ */
  var lenis = null;
  if (!reduceMotion && !coarsePointer && window.Lenis) {
    lenis = new Lenis({
      duration: 0.7,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      smoothTouch: false
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ════════════════════════════════════════════════════════════════
     2. INTRO REVEAL
     One orchestrated entrance: status pill + topbar context settle,
     headline lines rise out of their clip boxes, the stage (rocks +
     portrait) scales in from 0.94, rings/fog/particles fade up, then
     body copy, CTAs and side decorations settle in last.
     ════════════════════════════════════════════════════════════════ */
  var titleLines = document.querySelectorAll('.hv2__title-line > span');
  var reveals    = document.querySelectorAll('[data-reveal]');
  var stageEls   = document.querySelectorAll('.hv2__rock, .hv2__portrait');

  if (reduceMotion) {
    gsap.set(titleLines, { y: '0%' });
    gsap.set(reveals, { opacity: 1, y: 0 });
    gsap.set(stageEls, { opacity: 1, scale: 1 });
    gsap.set('.hv2__rings, .hv2__fog', { opacity: 1 });
  } else {
    gsap.set(reveals, { opacity: 0, y: 22 });
    gsap.set(stageEls, { opacity: 0, scale: 0.94, transformOrigin: '50% 50%' });
    gsap.set('.hv2__rings, .hv2__fog, .hv2__particles', { opacity: 0 });

    gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 })
      .to(titleLines, { y: '0%', duration: 1.1, stagger: 0.12 }, 0)
      .to(stageEls, { opacity: 1, scale: 1, duration: 1.4, stagger: 0.06, ease: 'power2.out' }, 0.1)
      .to('.hv2__rings, .hv2__fog, .hv2__particles', { opacity: 1, duration: 1.8 }, 0.25)
      .to(reveals, { opacity: 1, y: 0, duration: 0.9, stagger: 0.05 }, 0.35);
  }

  /* ════════════════════════════════════════════════════════════════
     3. IDLE FLOAT — "suspended in zero gravity"
     Every `.hv2__*-float` gets its own gsap.to(... yoyo, repeat:-1 ...)
     loop, reading amplitude/duration from data-float-y / data-float-rot
     / data-duration. The portrait additionally drifts rotateX/rotateY
     (real 3D tilt, thanks to `perspective` on .hv2__stage). A random
     per-rock delay keeps the field from breathing in unison.
     ════════════════════════════════════════════════════════════════ */
  if (!reduceMotion) {
    var mobile = window.innerWidth < 768;
    var amp = mobile ? 0.55 : 1;

    var portraitFloat = hero.querySelector('#hv2Portrait .hv2__portrait-float');
    if (portraitFloat) {
      var pData = document.getElementById('hv2Portrait').dataset;
      gsap.to(portraitFloat, {
        y: (parseFloat(pData.floatY) || 14) * amp,
        rotateX: 1.6 * amp,
        rotateY: -2.4 * amp,
        duration: parseFloat(pData.duration) || 9,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });
    }

    hero.querySelectorAll('.hv2__rock').forEach(function (rock) {
      var float = rock.querySelector('.hv2__rock-float');
      if (!float) return;
      var d = rock.dataset;
      gsap.to(float, {
        y: (parseFloat(d.floatY) || 12) * amp,
        rotation: (parseFloat(d.floatRot) || 4) * amp,
        duration: parseFloat(d.duration) || 10,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1.5
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     4. SCROLL "RISE" PARALLAX
     Every `.hv2__rock` / `.hv2__portrait` carries `data-rise` (px).
     Its `*-parallax` child rises by that amount — translates to
     y:-rise — over the hero's own scroll range (top hits top → bottom
     hits top). The portrait carries the smallest value (18px: it
     should barely seem to move — the page moves past it), far rocks a
     little more, and the near/bottom rocks the most (up to 90px),
     so the rocks concentrated along the lower edge visibly drift
     upward and off-frame as you scroll — exactly the "more rocks at
     the bottom, rising on scroll" effect.
     ════════════════════════════════════════════════════════════════ */
  if (!reduceMotion) {
    hero.querySelectorAll('.hv2__rock, .hv2__portrait').forEach(function (el) {
  var parallaxEl = el.querySelector(':scope > .hv2__rock-parallax, :scope > .hv2__portrait-parallax');
  if (!parallaxEl) return;

  var rise   = parseFloat(el.dataset.rise) || 40;
  var isRock = el.classList.contains('hv2__rock');
  var blur   = isRock ? Math.min(5, rise / 18) : 0;

  gsap.fromTo(parallaxEl,
    { y: 0, filter: 'blur(0px)' },
    {
      y: -rise,
      filter: blur ? 'blur(' + blur.toFixed(1) + 'px)' : 'blur(0px)',
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    }
  );
});

  /* ════════════════════════════════════════════════════════════════
     5. PARTICLES — dust + starlight
     Fills `.hv2__particles` with small divs: ~60% soft "ash" motes
     that drift slowly upward and fade (CSS var(--rise)/var(--peak)),
     ~28% white "stars" that twinkle in place, and ~12% cyan stars —
     the only other place this hero uses var(--cyan) besides the
     orbital glint. Positions skew toward the right two-thirds of the
     hero (the space around/behind the portrait that read as empty),
     with a lighter scatter across the left/text side too.

     Pure CSS animation from here — this function just sets custom
     properties once and appends the nodes.
     ════════════════════════════════════════════════════════════════ */
  (function setupParticles() {
    var container = document.getElementById('hv2Particles');
    if (!container || reduceMotion) return;

    var count = window.innerWidth < 768 ? 22 : 50;
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var roll  = Math.random();
      var type  = roll < 0.6 ? 'dust' : (roll < 0.88 ? 'star' : 'star-cyan');
      var el    = document.createElement('div');
      el.className = 'hv2__particle hv2__particle--' + type;

      // Bias toward the right two-thirds; a lighter scatter on the left.
      var x = Math.random() < 0.3 ? Math.random() * 40 : 35 + Math.random() * 65;
      var y = Math.random() * 100;
      el.style.setProperty('--x', x.toFixed(2) + '%');
      el.style.setProperty('--y', y.toFixed(2) + '%');

      if (type === 'dust') {
        var dDur = 9 + Math.random() * 8;
        el.style.setProperty('--size', (3 + Math.random() * 4).toFixed(1) + 'px');
        el.style.setProperty('--dur', dDur.toFixed(1) + 's');
        el.style.setProperty('--delay', (-Math.random() * dDur).toFixed(1) + 's');
        el.style.setProperty('--rise', '-' + (40 + Math.random() * 80).toFixed(0) + 'px');
        el.style.setProperty('--peak', (0.25 + Math.random() * 0.3).toFixed(2));
      } else {
        var sDur = 2.4 + Math.random() * 3.2;
        el.style.setProperty('--size', (1 + Math.random() * 1.6).toFixed(1) + 'px');
        el.style.setProperty('--dur', sDur.toFixed(1) + 's');
        el.style.setProperty('--delay', (-Math.random() * sDur).toFixed(1) + 's');
      }

      frag.appendChild(el);
    }

    container.appendChild(frag);
  })();

  /* ════════════════════════════════════════════════════════════════
     6. MAGNETIC CTAs
     The two CTAs pull slightly toward the pointer within their own
     bounding box and spring back with an elastic ease on leave.
     ════════════════════════════════════════════════════════════════ */
  if (!reduceMotion && !coarsePointer) {
    hero.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var strength = 0.35;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var relX = e.clientX - (r.left + r.width / 2);
        var relY = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: relX * strength, y: relY * strength, duration: 0.5, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     RESIZE
     ════════════════════════════════════════════════════════════════ */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
  });

})();
