/* nav.js — Navegación global */

(() => {

  const buildNav = () => {
    if (document.getElementById('navToggle')) return;

    const path        = window.location.pathname;
    const isServicios = path.includes('/servicios');
    const isSobreMi   = path.includes('/sobre-mi');
    const isTrabajo   = path.includes('/trabajo');

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
            <li><a href="/trabajo/"${isTrabajo ? ' class="nav__link--active"' : ''}>Trabajo</a></li>
            <li><a href="/servicios/"${isServicios ? ' class="nav__link--active"' : ''}>Servicios</a></li>
            <li><a href="/sobre-mi/"${isSobreMi ? ' class="nav__link--active"' : ''}>Sobre mí</a></li>
          </ul>
          <a href="/#contacto" class="nav__cta">Hablemos</a>
          <button id="navBurger" class="nav__burger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div id="navDrawer" class="nav__drawer">
          <a href="/trabajo/" class="nav__drawer-link${isTrabajo ? ' nav__link--active' : ''}">Trabajo</a>
          <a href="/servicios/" class="nav__drawer-link${isServicios ? ' nav__link--active' : ''}">Servicios</a>
          <a href="/sobre-mi/" class="nav__drawer-link${isSobreMi ? ' nav__link--active' : ''}">Sobre mí</a>
          <a href="/#contacto" class="nav__cta">Hablemos</a>
          <a href="mailto:hosoyalexander@gmail.com" class="nav__drawer-email">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            hosoyalexander@gmail.com
          </a>
        </div>
      </nav>`
    );
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
      setTimeout(() => { touched = false; }, 500);
    }, { passive: false });

    burger.addEventListener('click', () => {
      if (touched) return;
      open = !open;
      drawer.style.display = open ? 'flex' : 'none';
      burger.classList.toggle('open', open);
    });

    const links = drawer.querySelectorAll('a');
    links.forEach((link) => {
      link.addEventListener('click', () => {
        open = false;
        drawer.style.display = 'none';
        burger.classList.remove('open');
      });
    });

    window.addEventListener('scroll', () => {
      if (nav) nav.style.boxShadow = window.scrollY > 20
        ? '0 1px 32px rgba(0,0,0,0.7)' : 'none';
    }, { passive: true });
  };

  const buildFooter = () => {
    if (document.getElementById('site-footer')) return;
    document.body.insertAdjacentHTML('beforeend',
      `<footer class="footer" id="site-footer">
        <div class="container">
          <div class="footer__top">
            <div class="footer__meta">
              <span class="footer__meta-item">\uD83D\uDCCD Bogotá, Colombia — UTC−5</span>
              <span class="footer__meta-item">\uD83C\uDF10 Español · English</span>
              <span class="footer__meta-item">\uD83D\uDCBB 100% remoto — Disponible globalmente</span>
            </div>
            <div class="footer__links">
              <a href="https://www.behance.net/alexandercaro" target="_blank" rel="noopener">Behance</a>
              <a href="https://www.linkedin.com/in/sneider-alexander-de-la-cuadra-caro/" target="_blank" rel="noopener">LinkedIn</a>
              <a href="https://www.instagram.com/alexander_caro7/" target="_blank" rel="noopener">Instagram</a>
            </div>
          </div>
          <div class="footer__bottom">
            <span class="footer__copy">© 2026 Alexander Caro</span>
            <a href="/privacidad/" class="footer__privacy">Política de privacidad</a>
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
