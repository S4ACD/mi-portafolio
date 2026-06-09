/* trabajo/fueggo/script.js */

// WhatsApp
document.getElementById('whatsappBtn')?.addEventListener('click', () => {
  const phone   = '573024457653';
  const message = encodeURIComponent(
    '¡Hola Alexander! Vi tu proyecto de La Jungla Club y me interesa algo similar para mi marca. ¿Podemos hablar?'
  );
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
});

// Scroll reveal
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.scroll-reveal').forEach(el => revealObs.observe(el));

// Partículas
(function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.style.display = 'none'; return; }
  const ctx = canvas.getContext('2d');
  let W, H, particles, mouse = { x: -9999, y: -9999 };
  const C = { count: 70, maxRadius: 1.4, speed: 0.28, connectionDist: 110, mouseRadius: 120, color: '0,229,229' };
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  function createParticle() {
    const a = Math.random()*Math.PI*2, s=(0.4+Math.random()*0.6)*C.speed;
    return { x:Math.random()*W, y:Math.random()*H, vx:Math.cos(a)*s, vy:Math.sin(a)*s, r:0.4+Math.random()*C.maxRadius, alpha:0.3+Math.random()*0.5 };
  }
  function init() { resize(); particles = Array.from({length:C.count}, createParticle); }
  function draw() {
    ctx.clearRect(0,0,W,H);
    particles.forEach(p => {
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
      const dx=p.x-mouse.x, dy=p.y-mouse.y, d=Math.sqrt(dx*dx+dy*dy);
      if(d<C.mouseRadius){const f=(C.mouseRadius-d)/C.mouseRadius; p.x+=(dx/d)*f*1.8; p.y+=(dy/d)*f*1.8;}
    });
    for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++) {
      const a=particles[i],b=particles[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<C.connectionDist){ctx.beginPath();ctx.strokeStyle=`rgba(${C.color},${(1-d/C.connectionDist)*0.15})`;ctx.lineWidth=0.6;ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    particles.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(${C.color},${p.alpha})`;ctx.fill();});
    requestAnimationFrame(draw);
  }
  const hero = document.querySelector('.proj-hero');
  hero?.addEventListener('mousemove', e=>{const r=canvas.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;},{passive:true});
  hero?.addEventListener('mouseleave',()=>{mouse.x=-9999;mouse.y=-9999;});
  let rt; window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(resize,150);});
  init(); draw();
})();
