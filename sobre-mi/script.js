/* ═══════════════════════════════════════════════════════════════
   sobre-mi/script.js
   Animación del hero (rocas, planeta, partículas, parallax) +
   WhatsApp + scroll-reveal. Todo autocontenido en esta página,
   sin depender de un hero.js compartido con otras páginas.
═══════════════════════════════════════════════════════════════ */

// ─── WHATSAPP ────────────────────────────────────────────────────
document.getElementById('whatsappBtn')?.addEventListener('click', () => {
  const phone   = '573024457653';
  const message = encodeURIComponent(
    '¡Hola Alexander! Vi tu portafolio y me interesa cotizar un proyecto contigo. ¿Podemos hablar?'
  );
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
});

// ─── SCROLL REVEAL ───────────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.scroll-reveal').forEach(el => revealObs.observe(el));

/* ════════════════════════════════════════════════════════════════════
   HERO — escena de rocas doradas + planeta + partículas

   DESIGN PRINCIPLE: todo es visible/correcto en CSS por defecto.
   El JS solo ANIMA desde un estado oculto/desplazado HACIA ese default
   (vía gsap.from), nunca al revés. Si GSAP o ScrollTrigger fallan al
   cargar, el hero igual se ve completo — solo sin la capa de movimiento.

     0. Polvo + partículas de estrella  (puro DOM/CSS — corre incluso sin GSAP)
     1. Timeline de entrada             (se salta con reduced-motion → instantáneo)
     2. Flotación idle "gravedad cero"  (se salta con reduced-motion)
     3. Parallax de scroll "rise"       (se salta con reduced-motion)
     4. Cursor-follow en el planeta     (se salta en touch)
     5. CTAs magnéticos                 (se salta en touch / reduced-motion)

   Todo anima `transform` / `opacity` / `filter` únicamente —
   amigable con el compositor, sin layout thrashing.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var hero = document.querySelector('.hv2');
  if (!hero) return;

  var reduceMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia('(pointer: coarse)').matches;

  /* ── 0. PARTÍCULAS — polvo + luz estelar ──────────────────────────
     Llena `.hv2__particles` con divs pequeños: ~60% motas suaves de
     "ceniza" que flotan lento hacia arriba y se desvanecen (CSS
     var(--rise)/var(--peak)), ~28% estrellas blancas que titilan en su
     sitio, y ~12% estrellas cian. Posiciones sesgadas hacia los dos
     tercios derechos del hero (el espacio alrededor/detrás del
     planeta), con un esparcido más ligero también del lado izquierdo.

     Corre PRIMERO y no depende de GSAP para nada — los elementos
     animan puramente vía CSS keyframes una vez que existen en el DOM. */
  (function setupParticles() {
    var container = document.getElementById('hv2Particles');
    if (!container) return;

    var count = window.innerWidth < 768 ? 14 : 28;
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var roll = Math.random();
      var type = roll < 0.6 ? 'dust' : (roll < 0.88 ? 'star' : 'star-cyan');
      var el = document.createElement('div');
      el.className = 'hv2__particle hv2__particle--' + type;

      // Sesgado hacia los dos tercios derechos; esparcido más ligero a la izquierda.
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

  /* ── Todo lo de abajo es pulido de movimiento. Si GSAP o ScrollTrigger
     no están disponibles, el hero ya está completamente visible y bien
     maquetado vía CSS — simplemente nos detenemos aquí. ──────────────── */
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ── 1. ENTRADA — gsap.from() CON RED DE SEGURIDAD
     Cada grupo de abajo ya está totalmente visible/normal en CSS.
     gsap.from() captura eso como el estado "to" y anima DESDE un estado
     desplazado/oculto HACIA él. Si por cualquier motivo el timeline no
     llega a completarse (conflicto de timing, doble carga de GSAP,
     pestaña en segundo plano, lo que sea), el setTimeout de abajo fuerza
     opacidad/posición normal a los 2.5s como red de seguridad — así
     nunca queda nada atascado invisible. */
  if (!reduceMotion) {
    var titleLines = document.querySelectorAll('.hv2__title-line > span');
    var stageEls   = document.querySelectorAll('.hv2__rock, .hv2__portrait');
    var reveals    = document.querySelectorAll('[data-reveal]');
    var atmosphereEls = document.querySelectorAll('.hv2__rings, .hv2__fog, .hv2__particles');

    gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 })
      .from(titleLines, { y: '110%', duration: 1.1, stagger: 0.12 }, 0)
      .from(stageEls, { opacity: 0, scale: 0.94, transformOrigin: '50% 50%', duration: 1.4, stagger: 0.06, ease: 'power2.out' }, 0.1)
      .from(atmosphereEls, { opacity: 0, duration: 1.8 }, 0.25)
      .from(reveals, { opacity: 0, y: 22, duration: 0.9, stagger: 0.05 }, 0.35);

    // Red de seguridad: si algo interrumpe el timeline, esto garantiza
    // que todo quede visible y en su posición final de todas formas.
    setTimeout(function () {
      gsap.set([titleLines, stageEls, atmosphereEls, reveals], { clearProps: 'opacity,scale,y' });
    }, 2500);
  }

  /* ── 2. FLOTACIÓN IDLE — "suspendido en gravedad cero" ── */
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

  /* ── 3. PARALLAX DE SCROLL "RISE" + DESENFOQUE DE PROFUNDIDAD DE CAMPO
     Cada `.hv2__rock` / `.hv2__portrait` lleva `data-rise` (px). Su
     hijo `*-parallax` sube esa cantidad a lo largo del propio rango de
     scroll del hero — totalmente reversible vía `scrub: true`. Las
     rocas también reciben un blur suave proporcional a su rise (las
     rocas en primer plano/abajo desenfocan más); el planeta nunca
     desenfoca.

     Nota el selector: para `.hv2__portrait` el wrapper de parallax
     ahora vive un nivel más adentro, dentro de `.hv2__portrait-tilt`
     (agregado para que el efecto cursor-follow de la sección 4 tenga
     su propia capa de transform que nunca pelea con esta). */
  if (!reduceMotion) {
    var isStackedLayout = window.innerWidth < 1024; // coincide con el breakpoint CSS donde .hv2__portrait deja position:absolute y se une al flujo flex normal
    hero.querySelectorAll('.hv2__rock, .hv2__portrait').forEach(function (el) {
      var isPortrait = el.classList.contains('hv2__portrait');
      if (isPortrait && isStackedLayout) return; // el planeta está en flujo normal aquí; scroll-rise ya no aplica (pelearía con la altura real del documento)

      var parallaxEl = el.querySelector(
        ':scope > .hv2__rock-parallax, :scope > .hv2__portrait-tilt > .hv2__portrait-parallax'
      );
      if (!parallaxEl) return;

      var rise   = parseFloat(el.dataset.rise) || 40;
      var isRock = el.classList.contains('hv2__rock');
      var blur   = isRock ? Math.min(3, rise / 28) : 0;

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

  /* ── 4. CURSOR-FOLLOW — el planeta se desplaza levemente hacia el cursor
     Una capa de transform separada (`.hv2__portrait-tilt`) para que
     nunca pelee con la flotación idle (sección 2) ni con el scroll-rise
     (sección 3), que viven en los hijos `-float` / `-parallax` anidados.
     Lee la posición del cursor en todo el viewport (no solo la caja del
     planeta) para una sensación ambiental calmada de "te está mirando" —
     intencionalmente sutil: ~10px de desplazamiento y ~1.5° de
     inclinación en los bordes de la pantalla. */
  var tiltEl = document.querySelector('.hv2__portrait-tilt');
  if (tiltEl && !coarsePointer) {
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

  /* ── 5. CTAs MAGNÉTICOS ── */
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

  /* ── RESIZE ── */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
  });

})();
