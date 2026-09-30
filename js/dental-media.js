/* ═══════════════════════════════════════════════════════════════
   INICIO: Sector dental — reels y lightbox de historias (dental-media.js)
   - El <video> se crea SOLO al tocar play → la carga inicial no baja video.
   - Fuentes: WebM (VP9/Opus) y MP4 (H.264/AAC); el navegador elige.
   - Solo un video suena a la vez; se pausa al salir de pantalla.
   - Textos en ES/EN según <html lang>.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var en = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var T = en
    ? { again: 'Watch again', close: 'Close' }
    : { again: 'Ver de nuevo', close: 'Cerrar' };

  /* ── Reels ───────────────────────────────────────────────────── */
  var reels = document.querySelectorAll('.dm-reel[data-src]');
  var current = null;

  function stop(v) { if (v && !v.paused) v.pause(); }

  reels.forEach(function (fig) {
    var btn = fig.querySelector('.dm-reel__play');
    var player = fig.querySelector('.dm-reel__player');
    var hint = fig.querySelector('.dm-reel__hint');
    if (!btn || !player) return;

    btn.addEventListener('click', function () {
      var v = player.querySelector('video');
      if (!v) {
        v = document.createElement('video');
        v.setAttribute('playsinline', '');
        v.setAttribute('preload', 'auto');
        v.setAttribute('controls', '');
        if (fig.hasAttribute('data-noaudio')) { v.muted = true; v.loop = true; }
        var label = btn.getAttribute('aria-label');
        if (label) v.setAttribute('aria-label', label);
        var base = fig.getAttribute('data-src');
        [['.webm', 'video/webm'], ['.mp4', 'video/mp4']].forEach(function (s) {
          var el = document.createElement('source');
          el.src = base + s[0]; el.type = s[1];
          v.appendChild(el);
        });
        v.addEventListener('ended', function () {
          fig.classList.remove('is-playing');
          v.currentTime = 0;
          if (hint) hint.textContent = T.again;
          btn.focus({ preventScroll: true });
        });
        v.addEventListener('play', function () {
          if (current && current !== v) stop(current);
          current = v;
        });
        player.appendChild(v);
      }
      fig.classList.add('is-playing');
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
      v.focus({ preventScroll: true });
    });
  });

  if ('IntersectionObserver' in window && reels.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) stop(e.target.querySelector('video'));
      });
    }, { threshold: 0.25 });
    reels.forEach(function (r) { io.observe(r); });
  }

  /* ── Lightbox de historias (reusa el markup .sm-lightbox) ────── */
  var lb = document.getElementById('smLightbox');
  var lbImg = document.getElementById('smLightboxImg');
  var lbBg = document.getElementById('smLightboxBg');
  var lbClose = document.getElementById('smLightboxClose');
  var opener = null, isOpen = false;
  if (!lb || !lbImg) return;
  if (lbClose) lbClose.setAttribute('aria-label', T.close);

  function open(src, alt, from) {
    opener = from; isOpen = true;
    lbImg.src = src; lbImg.alt = alt || '';
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus({ preventScroll: true });
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(function () { lbImg.src = ''; }, 300);
    if (opener) opener.focus({ preventScroll: true });
  }
  document.querySelectorAll('.dm-story[data-full]').forEach(function (b) {
    b.addEventListener('click', function () {
      var img = b.querySelector('img');
      open(b.getAttribute('data-full'), img ? img.alt : '', b);
    });
  });
  if (lbClose) lbClose.addEventListener('click', close);
  if (lbBg) lbBg.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); }, true);
})();
/* FIN: Sector dental — reels y lightbox de historias */
