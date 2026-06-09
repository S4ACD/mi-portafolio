/* ═══════════════════════════════════════════════════════════════
   nav.js — Navegación global reutilizable
═══════════════════════════════════════════════════════════════ */

(function initNav() {

  const path       = window.location.pathname;
  const inRoot     = !path.includes('/sobre-mi') && !path.includes('/servicios');
  const root       = inRoot ? './' : '../';
  const isServicios = path.includes('/servicios');
  const isSobreMi   = path.includes('/sobre-mi');

  function active(condition) {
    return condition ? ' class="nav__link--active"' : '';
  }
  function activeDrawer(condition) {
    return condition
      ? ' class="nav__drawer-link nav__link--active"'
      : ' class="nav__drawer-link"';
  }

  // ── Inyectar nav ──
  document.body.insertAdjacentHTML('afterbegin', `
  <nav class="nav" id="nav">
    <div class="nav__inner">
      <a href="${root}" class="nav__logo">AC.</a>
      <ul class="nav__links">
        <li><a href="${root}#trabajo">Trabajo</a></li>
        <li><a href="${root}servicios/"${active(isServicios)}>Servicios</a></li>
        <li><a href="${root}sobre-mi/"${active(isSobreMi)}>Sobre mí</a></li>
      </ul>
      <a href="${root}#contacto" class="btn btn--cyan nav__cta">Hablemos</a>
      <button class="nav__burger" id="navBurger" aria-label="Menú" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="nav__drawer" id="navDrawer">
      <a href="${root}#trabajo"${activeDrawer(false)}>Trabajo</a>
      <a href="${root}servicios/"${activeDrawer(isServicios)}>Servicios</a>
      <a href="${root}sobre-mi/"${activeDrawer(isSobreMi)}>Sobre mí</a>
      <a href="${root}#contacto" class="btn btn--cyan">Hablemos</a>
    </div>
  </nav>`);

  // ── Burger ──
  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('navDrawer');
  const nav    = document.getElementById('nav');

  if (burger && drawer) {
    burger.addEventListener('click', function() {
      const isOpen = drawer.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    });

    drawer.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        drawer.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── Sombra al scroll ──
  window.addEventListener('scroll', function() {
    if (nav) nav.style.boxShadow = window.scrollY > 20
      ? '0 1px 32px rgba(0,0,0,0.7)'
      : 'none';
  }, { passive: true });

})();
