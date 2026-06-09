/* nav.js — Navegación global */

(function() {

  function buildNav() {
    // Si ya tiene el checkbox, no volver a inyectar
    if (document.getElementById('navToggle')) return;

    var path        = window.location.pathname;
    var inRoot      = path.indexOf('/sobre-mi') === -1 && path.indexOf('/servicios') === -1;
    var root        = inRoot ? './' : '../';
    var isServicios = path.indexOf('/servicios') !== -1;
    var isSobreMi   = path.indexOf('/sobre-mi') !== -1;

    // Si ya hay nav en el HTML, solo agregar el toggle y el listener
    var existingNav = document.getElementById('nav');
    if (existingNav) {
      setupToggle();
      return;
    }

    var homeUrl     = inRoot ? '/' : '../';
    var serviciosUrl = '/servicios/';
    var sobremiUrl   = '/sobre-mi/';
    var trabajoUrl   = inRoot ? '#trabajo' : '/#trabajo';
    var contactoUrl  = inRoot ? '#contacto' : '/#contacto';

    document.body.insertAdjacentHTML('afterbegin',
      '<nav class="nav" id="nav">' +
        '<div class="nav__inner">' +
          '<a href="' + homeUrl + '" class="nav__logo">AC.</a>' +
          '<ul class="nav__links">' +
            '<li><a href="' + trabajoUrl + '">Trabajo</a></li>' +
            '<li><a href="' + serviciosUrl + '"' + (isServicios ? ' class="nav__link--active"' : '') + '>Servicios</a></li>' +
            '<li><a href="' + sobremiUrl + '"' + (isSobreMi ? ' class="nav__link--active"' : '') + '>Sobre m\u00ed</a></li>' +
          '</ul>' +
          '<a href="' + contactoUrl + '" class="btn btn--cyan nav__cta">Hablemos</a>' +
          '<button id="navBurger" class="nav__burger" aria-label="Menu">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
        '<div id="navDrawer" class="nav__drawer">' +
          '<a href="' + trabajoUrl + '" class="nav__drawer-link">Trabajo</a>' +
          '<a href="' + serviciosUrl + '" class="nav__drawer-link' + (isServicios ? ' nav__link--active' : '') + '">Servicios</a>' +
          '<a href="' + sobremiUrl + '" class="nav__drawer-link' + (isSobreMi ? ' nav__link--active' : '') + '">Sobre m\u00ed</a>' +
          '<a href="' + contactoUrl + '" class="btn btn--cyan">Hablemos</a>' +
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

    var open = false;

    function toggle() {
      open = !open;
      if (open) {
        drawer.style.display = 'flex';
        burger.classList.add('open');
      } else {
        drawer.style.display = 'none';
        burger.classList.remove('open');
      }
    }

    // Usar tanto click como touchend con flag para evitar doble disparo
    var touched = false;
    burger.addEventListener('touchend', function(e) {
      e.preventDefault();
      touched = true;
      toggle();
      setTimeout(function() { touched = false; }, 500);
    }, { passive: false });

    burger.addEventListener('click', function() {
      if (touched) return;
      toggle();
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
        ? '0 1px 32px rgba(0,0,0,0.7)'
        : 'none';
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }

})();
