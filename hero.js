/* ════════════════════════════════════════════════════════════════════
   ALEXANDER CARO — HERO v3 — hero.js
   Loaded only on the homepage (see index.html).

   DESIGN PRINCIPLE: everything is visible/correct in CSS by default.
   JS only ever ANIMATES from a hidden/offset state INTO that default
   (via gsap.from), never the other way around. If GSAP, ScrollTrigger
   or Lenis fail to load for any reason, the hero still renders fully —
   just without the motion layer.

     0. Dust + star particles      (pure DOM/CSS — runs even without GSAP)
     1. Lenis smooth-scroll        (skipped: touch, reduced-motion)
     2. Intro reveal timeline      (skipped: reduced-motion → instant)
     3. Idle "zero-gravity" float  (skipped: reduced-motion)
     4. Scroll "rise" parallax     (skipped: reduced-motion)
     5. Cursor-follow on portrait  (skipped: touch, reduced-motion)
     6. Magnetic CTAs               (skipped: touch, reduced-motion)

   Everything animates `transform` / `opacity` / `filter` only —
   compositor-friendly, no layout thrash.
   ════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var hero = document.getElementById('inicio');
  if (!hero || !hero.classList.contains('hv2')) return;

  var reduceMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia('(pointer: coarse)').matches;

  /* ════════════════════════════════════════════════════════════════
     0. PARTICLES — dust + starlight
     Fills `.hv2__particles` with small divs: ~60% soft "ash" motes
     that drift slowly upward and fade (CSS var(--rise)/var(--peak)),
     ~28% white "stars" that twinkle in place, and ~12% cyan stars —
     the only other place this hero uses var(--cyan) besides the
     orbital glint. Positions skew toward the right two-thirds of the
     hero (the space around/behind the portrait), with a lighter
     scatter on the left/text side too.

     This runs FIRST and does not depend on GSAP at all — the elements
     animate purely via CSS keyframes once they exist in the DOM.
     ════════════════════════════════════════════════════════════════ */
  (function setupParticles() {
    var container = document.getElementById('hv2Particles');
    if (!container || reduceMotion) return;

    var count = window.innerWidth < 768 ? 22 : 50;
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var roll = Math.random();
      var type = roll < 0.6 ? 'dust' : (roll < 0.88 ? 'star' : 'star-cyan');
      var el = document.createElement('div');
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

  /* ── Everything below this line is motion polish. If GSAP or
     ScrollTrigger aren't available, the hero is already fully visible
     and correctly laid out via CSS — just stop here. ──────────────── */
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ════════════════════════════════════════════════════════════════
     1. LENIS — SMOOTH SCROLL
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
     2. INTRO REVEAL — gsap.from()
     Every group below is fully visible/normal in CSS already.
     gsap.from() captures that as the "to" state and animates FROM an
     offset/hidden state INTO it — so if this timeline never runs (or
     errors halfway through), the hero simply shows its resting state
     instead of staying hidden.
     ════════════════════════════════════════════════════════════════ */
  if (!reduceMotion) {
    var titleLines = document.querySelectorAll('.hv2__title-line > span');
    var stageEls   = document.querySelectorAll('.hv2__rock, .hv2__portrait');
    var reveals    = document.querySelectorAll('[data-reveal]');

    gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 })
      .from(titleLines, { y: '110%', duration: 1.1, stagger: 0.12 }, 0)
      .from(stageEls, { opacity: 0, scale: 0.94, transformOrigin: '50% 50%', duration: 1.4, stagger: 0.06, ease: 'power2.out' }, 0.1)
      .from('.hv2__rings, .hv2__fog, .hv2__particles', { opacity: 0, duration: 1.8 }, 0.25)
      .from(reveals, { opacity: 0, y: 22, duration: 0.9, stagger: 0.05 }, 0.35);
  }

  /* ════════════════════════════════════════════════════════════════
     3. IDLE FLOAT — "suspended in zero gravity"
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
     4. SCROLL "RISE" PARALLAX + DEPTH-OF-FIELD BLUR
     Each `.hv2__rock` / `.hv2__portrait` carries `data-rise` (px). Its
     `*-parallax` child rises by that amount over the hero's own scroll
     range — fully reversible via `scrub: true`. Rocks also pick up a
     soft blur proportional to their rise (foreground/bottom rocks
     blur the most); the portrait never blurs.

     Note the selector: for `.hv2__portrait` the parallax wrapper now
     sits one level deeper, inside `.hv2__portrait-tilt` (added so the
     cursor-follow effect in section 5 has its own transform layer that
     never fights this one).
     ════════════════════════════════════════════════════════════════ */
  if (!reduceMotion) {
    hero.querySelectorAll('.hv2__rock, .hv2__portrait').forEach(function (el) {
      var parallaxEl = el.querySelector(
        ':scope > .hv2__rock-parallax, :scope > .hv2__portrait-tilt > .hv2__portrait-parallax'
      );
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
  }

  /* ════════════════════════════════════════════════════════════════
     5. CURSOR-FOLLOW — portrait drifts very slightly toward the cursor
     A separate transform layer (`.hv2__portrait-tilt`) so it never
     fights the idle float (section 3) or the scroll-rise (section 4),
     which live on the nested `-float` / `-parallax` children. Reads
     cursor position across the whole viewport (not just the portrait's
     box) for a calm, ambient "watching you" feel — intentionally tiny:
     ~10px of drift and ~1.5° of tilt at the screen edges.
     ════════════════════════════════════════════════════════════════ */
  if (!reduceMotion && !coarsePointer) {
    var tiltEl = document.querySelector('.hv2__portrait-tilt');
    if (tiltEl) {
      window.addEventListener('mousemove', function (e) {
        var nx = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 → 1
        var ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 → 1
        gsap.to(tiltEl, {
          x: nx * 10,
          y: ny * 8,
          rotateY: nx * 1.6,
          rotateX: -ny * 1.2,
          duration: 1.1,
          ease: 'power2.out'
        });
      });
    }
  }

  /* ════════════════════════════════════════════════════════════════
     6. MAGNETIC CTAs
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
