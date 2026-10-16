/* ════════════════════════════════════════════════════════════════════
   js/inicio.js — Inicio v3 (sin librerías)

   1. Escena del hero: el nombre, los anillos, el retrato y las rocas se
      mueven con el cursor a distinta profundidad (data-depth), flotan
      despacio y suben un poco al hacer scroll. En pantallas táctiles o
      con "reducir movimiento" la escena queda quieta.
   2. Índice de proyectos: vista previa que sigue al cursor.
   3. Video: se descarga solo cuando la persona le da play.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('hm-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── 1. Escena ─────────────────────────────────────────────── */
  var scene = document.getElementById('hmScene');
  if (scene && !reduce) {
    var layers = [].slice.call(scene.querySelectorAll('[data-depth]'));
    var tx = 0, ty = 0, cx = 0, cy = 0, sy = window.scrollY || 0;
    var start = performance.now();
    var visible = true;

    if (fine) {
      window.addEventListener('mousemove', function (e) {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;   // -1 → 1
        ty = (e.clientY / window.innerHeight - 0.5) * 2;  // -1 → 1
      }, { passive: true });
    }
    window.addEventListener('scroll', function () { sy = window.scrollY; }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(scene);
    }

    var frame = function (now) {
      requestAnimationFrame(frame);
      if (!visible) return;
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      var t = (now - start) / 1000;
      var prog = Math.min(1, sy / (scene.offsetHeight || 1));
      for (var i = 0; i < layers.length; i++) {
        var el = layers[i];
        var d = parseFloat(el.getAttribute('data-depth')) || 0;
        var x = cx * 12 * d;
        var y = cy * 9 * d - prog * 60 * Math.max(d, 0.2);
        if (el.hasAttribute('data-tilt')) {
          y += Math.sin(t * 0.7) * 10;
          el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) rotateY(' +
            (cx * 2.4).toFixed(2) + 'deg) rotateX(' + (-cy * 1.8).toFixed(2) + 'deg)';
        } else if (el.hasAttribute('data-float')) {
          var r = Math.sin(t * 0.5 + i) * 4;
          y += Math.cos(t * 0.6 + i * 1.7) * 8;
          el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) rotate(' + r.toFixed(2) + 'deg)';
        } else {
          el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';
        }
      }
    };
    requestAnimationFrame(frame);
  }

  /* ── 2. Vista previa del índice ────────────────────────────── */
  var peek = document.getElementById('hmPeek');
  var rows = document.querySelectorAll('[data-hm-peek]');
  if (peek && rows.length && fine) {
    var px = 0, py = 0, qx = 0, qy = 0, on = false;
    rows.forEach(function (a) {
      a.addEventListener('mouseenter', function () {
        var src = a.getAttribute('data-hm-peek');
        peek.textContent = '';
        if (src) {
          var img = document.createElement('img');
          img.src = src; img.alt = '';
          peek.appendChild(img);
        } else {
          var div = document.createElement('div');
          div.style.background = a.getAttribute('data-hm-color') || '#17140f';
          div.textContent = a.getAttribute('data-hm-name') || '';
          peek.appendChild(div);
        }
        peek.classList.add('is-on'); on = true;
      });
      a.addEventListener('mouseleave', function () { peek.classList.remove('is-on'); on = false; });
    });
    window.addEventListener('mousemove', function (e) { px = e.clientX + 24; py = e.clientY - 110; }, { passive: true });
    var move = function () {
      requestAnimationFrame(move);
      if (!on && Math.abs(px - qx) < 0.5) return;
      var k = reduce ? 1 : 0.18;
      qx += (px - qx) * k; qy += (py - qy) * k;
      peek.style.transform = 'translate3d(' + qx.toFixed(1) + 'px,' + qy.toFixed(1) + 'px,0)';
    };
    requestAnimationFrame(move);
  }

  /* ── 3. Video ──────────────────────────────────────────────── */
  var player = document.getElementById('hmPlayer');
  if (player) {
    var v = player.querySelector('video');
    var btn = player.querySelector('.hm-play');
    var id = player.getAttribute('data-cld');
    var base = 'https://res.cloudinary.com/dg2wnq6ao/video/upload/';
    btn.addEventListener('click', function () {
      if (!v.querySelector('source')) {
        [['q_auto:good,w_1280,vc_h264,br_2500k/' + id + '.mp4', 'video/mp4'], ['q_auto:good,w_1280/' + id + '.webm', 'video/webm']]
          .forEach(function (x) {
            var s = document.createElement('source');
            s.src = base + x[0]; s.type = x[1];
            v.appendChild(s);
          });
        v.load();
      }
      player.classList.add('is-playing');
      v.controls = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
    v.addEventListener('ended', function () {
      player.classList.remove('is-playing');
      v.controls = false;
      v.currentTime = 0;
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { if (!e[0].isIntersecting && !v.paused) v.pause(); }, { threshold: 0.2 }).observe(player);
    }
  }
})();
