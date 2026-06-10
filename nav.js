/* nav.js — Navegación global */

(function() {

  function buildNav() {
    if (document.getElementById('navToggle')) return;

    var path        = window.location.pathname;
    var isServicios = path.indexOf('/servicios') !== -1;
    var isSobreMi   = path.indexOf('/sobre-mi') !== -1;
    var isTrabajo   = path.indexOf('/trabajo') !== -1;

    var existingNav = document.getElementById('nav');
    if (existingNav) {
      setupToggle();
      return;
    }

    document.body.insertAdjacentHTML('afterbegin',
      '<nav class="nav" id="nav">' +
        '<div class="nav__inner">' +
          '<a href="/" class="nav__logo">AC.</a>' +
          '<ul class="nav__links">' +
            '<li><a href="/trabajo/"' + (isTrabajo ? ' class="nav__link--active"' : '') + '>Trabajo</a></li>' +
            '<li><a href="/servicios/"' + (isServicios ? ' class="nav__link--active"' : '') + '>Servicios</a></li>' +
            '<li><a href="/sobre-mi/"' + (isSobreMi ? ' class="nav__link--active"' : '') + '>Sobre m\u00ed</a></li>' +
          '</ul>' +
          '<a href="/#contacto" class="btn btn--cyan nav__cta">Hablemos</a>' +
          '<button id="navBurger" class="nav__burger" aria-label="Menu">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
        '<div id="navDrawer" class="nav__drawer">' +
          '<a href="/trabajo/" class="nav__drawer-link' + (isTrabajo ? ' nav__link--active' : '') + '">Trabajo</a>' +
          '<a href="/servicios/" class="nav__drawer-link' + (isServicios ? ' nav__link--active' : '') + '">Servicios</a>' +
          '<a href="/sobre-mi/" class="nav__drawer-link' + (isSobreMi ? ' nav__link--active' : '') + '">Sobre m\u00ed</a>' +
          '<a href="/#contacto" class="btn btn--cyan">Hablemos</a>' +
        '</div>' +
      '</nav>'
    );
    setupToggle();
  }
  function setupToggle() {
    var burger = document.getElementById('navBurger');
    var drawer = document.getElementById('navDrawer');
    var nav    = document.getElementById('nav');
    if (!burger || !drawer) return;

    var open    = false;
    var touched = false;

    burger.addEventListener('touchend', function(e) {
      e.preventDefault();
      touched = true;
      open = !open;
      drawer.style.display = open ? 'flex' : 'none';
      burger.classList.toggle('open', open);
      setTimeout(function() { touched = false; }, 500);
    }, { passive: false });

    burger.addEventListener('click', function() {
      if (touched) return;
      open = !open;
      drawer.style.display = open ? 'flex' : 'none';
      burger.classList.toggle('open', open);
    });

    var links = drawer.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function() {
        open = false;
        drawer.style.display = 'none';
        burger.classList.remove('open');
      });
    }

    window.addEventListener('scroll', function() {
      if (nav) nav.style.boxShadow = window.scrollY > 20
        ? '0 1px 32px rgba(0,0,0,0.7)' : 'none';
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }

})();
