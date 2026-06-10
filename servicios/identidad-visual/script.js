/* servicios/[subservicio]/script.js — compartido por todas las páginas de servicio */

// WhatsApp — mensaje genérico (se sobreescribe en cada página si es necesario)
function openWA(msg) {
  var message = msg || '¡Hola Alexander! Vi tus servicios y me interesa cotizar un proyecto. ¿Podemos hablar?';
  window.open('https://wa.me/573024457653?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
}

// Scroll reveal
var revealObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.scroll-reveal').forEach(function(el) { revealObs.observe(el); });

// Barra de progreso scroll
var bar = document.getElementById('scrollProgress');
window.addEventListener('scroll', function() {
  if (bar) bar.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%';
}, { passive: true });

// Partículas canvas
(function() {
  var c = document.getElementById('heroCanvas');
  if (!c) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { c.style.display = 'none'; return; }
  var ctx = c.getContext('2d'), W, H, P = [], mouse = { x: -9999, y: -9999 };
  function resize() { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; }
  function mk() {
    var a = Math.random() * Math.PI * 2, s = (0.4 + Math.random() * 0.6) * 0.3;
    return { x: Math.random()*W, y: Math.random()*H, vx: Math.cos(a)*s, vy: Math.sin(a)*s, r: 0.4+Math.random()*1.6, alpha: 0.3+Math.random()*0.5 };
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    P.forEach(function(p) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx*dx + dy*dy);
      if (d < 120) { var f = (120-d)/120; p.x += (dx/d)*f*1.5; p.y += (dy/d)*f*1.5; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(0,229,229,' + p.alpha + ')'; ctx.fill();
    });
    for (var i = 0; i < P.length; i++) for (var j = i+1; j < P.length; j++) {
      var a = P[i], b = P[j], dx = a.x-b.x, dy = a.y-b.y, d = Math.sqrt(dx*dx+dy*dy);
      if (d < 110) { ctx.beginPath(); ctx.strokeStyle = 'rgba(0,229,229,' + (1-d/110)*0.15 + ')'; ctx.lineWidth = 0.6; ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
    }
    requestAnimationFrame(draw);
  }
  var hero = document.querySelector('.srv-hero');
  hero && hero.addEventListener('mousemove', function(e) { var r = c.getBoundingClientRect(); mouse.x = e.clientX-r.left; mouse.y = e.clientY-r.top; }, { passive: true });
  hero && hero.addEventListener('mouseleave', function() { mouse.x = -9999; mouse.y = -9999; });
  resize(); P = Array.from({ length: 70 }, mk); draw();
  var rt; window.addEventListener('resize', function() { clearTimeout(rt); rt = setTimeout(resize, 150); });
})();
