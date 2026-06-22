/* nav.js — Navegación global */

(() => {

  const buildNav = () => {
    if (document.getElementById('navToggle')) return;

    const path        = window.location.pathname;
    const isServicios = path.includes('/servicios');
    const isSobreMi   = path.includes('/sobre-mi');
    const isTrabajo   = path.includes('/trabajo');
    const isHome      = path === '/' || path === '/index.html';

    const existingNav = document.getElementById('nav');
    if (existingNav) {
      setupToggle();
      return;
    }

    document.body.insertAdjacentHTML('afterbegin',
      `<nav class="nav" id="nav">
        <div class="nav__inner">
          <a href="/" class="nav__logo">
            <img src="https://res.cloudinary.com/dg2wnq6ao/image/upload/h_56,w_140,c_fit,q_auto,f_auto/v1781101946/Logo-en-el-nav_ubnip9.webp" alt="Alexander Caro" class="nav__logo-img">
          </a>
          <ul class="nav__links">
            <li><a href="/"${isHome ? ' class="nav__link--active"' : ''} data-i18n="nav.home">Inicio</a></li>
            <li><a href="/trabajo/"${isTrabajo ? ' class="nav__link--active"' : ''} data-i18n="nav.work">Trabajo</a></li>
            <li><a href="/servicios/"${isServicios ? ' class="nav__link--active"' : ''} data-i18n="nav.services">Servicios</a></li>
            <li><a href="/sobre-mi/"${isSobreMi ? ' class="nav__link--active"' : ''} data-i18n="nav.about">Sobre mí</a></li>
          </ul>
          <button id="langToggle" class="nav__lang" aria-label="Switch to English" data-current="es">EN</button>
          <a href="/#contacto" class="nav__cta" data-i18n="nav.cta">Hablemos</a>
          <button id="navBurger" class="nav__burger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div id="navDrawer" class="nav__drawer">
          <a href="/" class="nav__drawer-link${isHome ? ' nav__link--active' : ''}" data-i18n="nav.home">Inicio</a>
          <a href="/trabajo/" class="nav__drawer-link${isTrabajo ? ' nav__link--active' : ''}" data-i18n="nav.work">Trabajo</a>
          <a href="/servicios/" class="nav__drawer-link${isServicios ? ' nav__link--active' : ''}" data-i18n="nav.services">Servicios</a>
          <a href="/sobre-mi/" class="nav__drawer-link${isSobreMi ? ' nav__link--active' : ''}" data-i18n="nav.about">Sobre mí</a>
          <button id="langToggle-drawer" class="nav__lang nav__lang--drawer" aria-label="Switch to English" data-current="es">EN</button>
          <a href="/#contacto" class="nav__cta" data-i18n="nav.cta">Hablemos</a>
          <a href="mailto:hosoyalexander@gmail.com" class="nav__drawer-email">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            hosoyalexander@gmail.com
          </a>
        </div>
      </nav>`
    );

    // Fix: mover el nav directo al <body> para sacarlo de cualquier
    // ancestro con transform/filter, que rompería su position:fixed.
    const navEl = document.getElementById('nav');
    if (navEl && navEl.parentElement !== document.body) {
      document.body.appendChild(navEl);
    }

    setupToggle();
  };

  const setupToggle = () => {
    const burger = document.getElementById('navBurger');
    const drawer = document.getElementById('navDrawer');
    const nav    = document.getElementById('nav');
    if (!burger || !drawer) return;

    let open    = false;
    let touched = false;

    burger.addEventListener('touchend', (e) => {
      e.preventDefault();
      touched = true;
      open = !open;
      drawer.style.display = open ? 'flex' : 'none';
      burger.classList.toggle('open', open);
      if (open) nav?.classList.remove('nav--hidden');
      setTimeout(() => { touched = false; }, 500);
    }, { passive: false });

    burger.addEventListener('click', () => {
      if (touched) return;
      open = !open;
      drawer.style.display = open ? 'flex' : 'none';
      burger.classList.toggle('open', open);
      if (open) nav?.classList.remove('nav--hidden');
    });

    const links = drawer.querySelectorAll('a');
    links.forEach((link) => {
      link.addEventListener('click', () => {
        open = false;
        drawer.style.display = 'none';
        burger.classList.remove('open');
      });
    });

    // Hide-on-scroll-down / show-on-scroll-up.
    // Apenas el usuario sube (más que un pequeño margen anti-temblor),
    // el nav reaparece — en cualquier punto de la página, sin pedir una
    // distancia acumulada. Al bajar, se esconde.
    let lastY     = window.scrollY;
    let ticking   = false;
    const TOP_ZONE = 80;  // cerca del top, siempre visible
    const JITTER   = 4;   // ignora micro-movimientos (trackpad/rebote)

    const show = () => nav?.classList.remove('nav--hidden');
    const hide = () => nav?.classList.add('nav--hidden');

    const onScroll = () => {
      const y     = window.scrollY;
      const delta = y - lastY;

      if (nav) nav.style.boxShadow = y > 20 ? '0 1px 32px rgba(0,0,0,0.7)' : 'none';

      // Cerca del top o con el menú abierto: siempre visible.
      if (open || y <= TOP_ZONE) {
        show();
        lastY = y;
        ticking = false;
        return;
      }

      if (delta < -JITTER) {
        // subiendo: mostrar de inmediato
        show();
        lastY = y;
      } else if (delta > JITTER) {
        // bajando: esconder
        hide();
        lastY = y;
      }
      // movimientos menores al jitter: no tocamos lastY, así un micro-temblor
      // no "consume" la dirección y la próxima subida real se detecta limpia.

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(onScroll);
      }
    }, { passive: true });
  };

  const buildFooter = () => {
    if (document.getElementById('site-footer')) return;
    document.body.insertAdjacentHTML('beforeend',
      `<footer class="footer" id="site-footer">
        <div class="container">
          <div class="footer__top">
            <div class="footer__meta">
              <span class="footer__meta-item" data-i18n="footer.location">\uD83D\uDCCD Bogotá, Colombia — UTC−5</span>
              <span class="footer__meta-item" data-i18n="footer.languages">\uD83C\uDF10 Español · English</span>
              <span class="footer__meta-item" data-i18n="footer.availability">\uD83D\uDCBB 100% remoto — Disponible globalmente</span>
            </div>
            <div class="footer__links">
              <a href="https://www.behance.net/alexandercaro" target="_blank" rel="noopener">Behance</a>
              <a href="https://www.linkedin.com/in/sneider-alexander-de-la-cuadra-caro/" target="_blank" rel="noopener">LinkedIn</a>
              <a href="https://www.instagram.com/alexander_caro7/" target="_blank" rel="noopener">Instagram</a>
            </div>
          </div>
          <div class="footer__bottom">
            <span class="footer__copy" data-i18n="footer.copy">© 2026 Alexander Caro</span>
            <a href="/privacidad/" class="footer__privacy" data-i18n="footer.privacy">Política de privacidad</a>
          </div>
        </div>
      </footer>`
    );
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { buildNav(); buildFooter(); });
  } else {
    buildNav();
    buildFooter();
  }

})();
