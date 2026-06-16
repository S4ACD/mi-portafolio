/* servicios/hub.js — exclusivo del hub /servicios/ */

// Hero entrance animation — ver hub.css para la explicación completa
// del bug de blur que esto soluciona (mismo patrón que /trabajo/).
document.querySelectorAll('.reveal-up').forEach(function (el) {
  el.addEventListener('animationend', function () { el.classList.add('reveal-done'); }, { once: true });
});

// Scroll reveal
var revealObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.scroll-reveal').forEach(function (el) { revealObs.observe(el); });

// FAQ acordeón — un solo item abierto a la vez, accesible vía aria-expanded
var faqItems = document.querySelectorAll('[data-faq]');
faqItems.forEach(function (item) {
  item.setAttribute('aria-expanded', 'false');
  item.addEventListener('click', function () {
    var isOpen = item.getAttribute('aria-expanded') === 'true';
    faqItems.forEach(function (i) { i.setAttribute('aria-expanded', 'false'); });
    if (!isOpen) item.setAttribute('aria-expanded', 'true');
  });
});

// Partículas doradas (canvas propio del hub, no toca el compartido)
(function initParticles() {
  var canvas = document.getElementById('hubCanvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.style.display = 'none'; return; }
  var ctx = canvas.getContext('2d'), W, H, particles, mouse = { x: -9999, y: -9999 };
  var C = { count: 70, maxRadius: 1.4, speed: 0.28, connectionDist: 110, mouseRadius: 120, color: '205,183,142' };
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  function createParticle() {
    var a = Math.random() * Math.PI * 2, s = (0.4 + Math.random() * 0.6) * C.speed;
    return { x: Math.random() * W, y: Math.random() * H, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 0.4 + Math.random() * C.maxRadius, alpha: 0.3 + Math.random() * 0.5 };
  }
  function init() { resize(); particles = Array.from({ length: C.count }, createParticle); }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(function (p) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < C.mouseRadius) { var f = (C.mouseRadius - d) / C.mouseRadius; p.x += (dx / d) * f * 1.8; p.y += (dy / d) * f * 1.8; }
    });
    for (var i = 0; i < particles.length; i++) for (var j = i + 1; j < particles.length; j++) {
      var a = particles[i], b = particles[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < C.connectionDist) { ctx.beginPath(); ctx.strokeStyle = 'rgba(' + C.color + ',' + ((1 - d / C.connectionDist) * 0.15) + ')'; ctx.lineWidth = 0.6; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    particles.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(' + C.color + ',' + p.alpha + ')'; ctx.fill(); });
    requestAnimationFrame(draw);
  }
  var hero = document.querySelector('.sv-hero');
  if (hero) {
    hero.addEventListener('mousemove', function (e) { var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
    hero.addEventListener('mouseleave', function () { mouse.x = -9999; mouse.y = -9999; });
  }
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
  init(); draw();
})();
