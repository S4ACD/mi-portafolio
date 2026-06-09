/* ═══════════════════════════════════════════════════════════════
   servicios/script.js
═══════════════════════════════════════════════════════════════ */

// ─── WHATSAPP ────────────────────────────────────────────────────
const phone = '573024457653';

document.getElementById('whatsappBtn')?.addEventListener('click', () => {
  const message = encodeURIComponent(
    '¡Hola Alexander! Vi tu portafolio y me interesa cotizar un proyecto contigo. ¿Podemos hablar?'
  );
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
});

// Botones de combo — mensaje personalizado
document.querySelectorAll('.combo-card__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const combo = btn.dataset.combo;
    const message = encodeURIComponent(
      `¡Hola Alexander! Vi tu portafolio y me interesa el combo "${combo}". ¿Podemos hablar?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
  });
});

// ─── SCROLL REVEAL ───────────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.scroll-reveal').forEach(el => revealObs.observe(el));

// ─── TYPEWRITER ──────────────────────────────────────────────────
(function typewriter() {
  const words  = ['ti', 'tu marca', 'tu negocio'];
  const target = document.getElementById('typeTarget');
  if (!target) return;

  let wordIndex = 0;
  let charIndex = 0;
  let deleting  = false;

  const SPEED_TYPE   = 80;
  const SPEED_DELETE = 45;
  const PAUSE_WORD   = 1800;
  const PAUSE_DELETE = 400;

  function tick() {
    const word = words[wordIndex];

    if (!deleting) {
      // Escribiendo
      target.textContent = word.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === word.length) {
        // Palabra completa — pausar antes de borrar
        deleting = true;
        setTimeout(tick, PAUSE_WORD);
        return;
      }
    } else {
      // Borrando
      target.textContent = word.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, PAUSE_DELETE);
        return;
      }
    }
    setTimeout(tick, deleting ? SPEED_DELETE : SPEED_TYPE);
  }

  // Arrancar tras el reveal del h1
  setTimeout(tick, 1000);
})();

// ─── PARTÍCULAS ──────────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none'; return;
  }
  const ctx = canvas.getContext('2d');
  let W, H, particles, mouse = { x: -9999, y: -9999 };
  const CONFIG = { count: 90, maxRadius: 1.6, speed: 0.3, connectionDist: 120, mouseRadius: 130, color: '0,229,229' };

  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  function createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.4 + Math.random() * 0.6) * CONFIG.speed;
    return { x: Math.random()*W, y: Math.random()*H, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, r: 0.4+Math.random()*CONFIG.maxRadius, alpha: 0.3+Math.random()*0.5 };
  }
  function init() { resize(); particles = Array.from({ length: CONFIG.count }, createParticle); }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x-mouse.x, dy = p.y-mouse.y, d = Math.sqrt(dx*dx+dy*dy);
      if (d < CONFIG.mouseRadius) { const f=(CONFIG.mouseRadius-d)/CONFIG.mouseRadius; p.x+=(dx/d)*f*1.8; p.y+=(dy/d)*f*1.8; }
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const a=particles[i], b=particles[j], dx=a.x-b.x, dy=a.y-b.y, d=Math.sqrt(dx*dx+dy*dy);
        if (d < CONFIG.connectionDist) {
          ctx.beginPath();
          ctx.strokeStyle=`rgba(${CONFIG.color},${(1-d/CONFIG.connectionDist)*0.16})`;
          ctx.lineWidth=0.6; ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=`rgba(${CONFIG.color},${p.alpha})`; ctx.fill(); });
    requestAnimationFrame(draw);
  }
  const hero = document.querySelector('.srv-hero');
  hero?.addEventListener('mousemove', e => { const r=canvas.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; }, { passive:true });
  hero?.addEventListener('mouseleave', () => { mouse.x=-9999; mouse.y=-9999; });
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt=setTimeout(resize,150); });
  init(); draw();
})();
