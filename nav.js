/* ═══════════════════════════════════════════════════════════════
   nav.js — Navegación global
═══════════════════════════════════════════════════════════════ */

(function initNav() {

  if (document.getElementById('nav')) return;

  var path        = window.location.pathname;
  var inRoot      = path.indexOf('/sobre-mi') === -1 && path.indexOf('/servicios') === -1;
  var root        = inRoot ? './' : '../';
  var isServicios = path.indexOf('/servicios') !== -1;
  var isSobreMi   = path.indexOf('/sobre-mi') !== -1;

  document.body.insertAdjacentHTML('afterbegin',
    '<nav class="nav" id="nav">' +
      '<div class="nav__inner">' +
        '<a href="' + root + '" class="nav__logo">AC.</a>' +
        '<ul class="nav__links">' +
          '<li><a href="' + root + '#trabajo">Trabajo</a></li>' +
          '<li><a href="' + root + 'servicios/"' + (isServicios ? ' class="nav__link--active"' : '') + '>Servicios</a></li>' +
          '<li><a href="' + root + 'sobre-mi/"' + (isSobreMi ? ' class="nav__link--active"' : '') + '>Sobre m\u00ed</a></li>' +
        '</ul>' +
        '<a href="' + root + '#contacto" class="btn btn--cyan nav__cta">Hablemos</a>' +
        '<button id="navBurger" class="nav__burger" aria-label="Menu">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</div>' +
      '<div id="navDrawer" class="nav__drawer">' +
        '<a href="' + root + '#trabajo" class="nav__drawer-link">Trabajo</a>' +
        '<a href="' + root + 'servicios/" class="nav__drawer-link' + (isServicios ? ' nav__link--active' : '') + '">Servicios</a>' +
        '<a href="' + root + 'sobre-mi/" class="nav__drawer-link' + (isSobreMi ? ' nav__link--active' : '') + '">Sobre m\u00ed</a>' +
        '<a href="' + root + '#contacto" class="btn btn--cyan">Hablemos</a>' +
      '</div>' +
    '</nav>'
  );

  var burger  = document.getElementById('navBurger');
  var drawer  = document.getElementById('navDrawer');
  var nav     = document.getElementById('nav');
  var isOpen  = false;
  var lastTap = 0;

  burger.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var now = Date.now();
    if (now - lastTap < 300) return; // evitar doble disparo
    lastTap = now;
    isOpen = !isOpen;
    drawer.classList.toggle('open', isOpen);
    burger.classList.toggle('open', isOpen);
  }, { passive: false });

  // Fallback para PC
  burger.addEventListener('click', function(e) {
    // Solo ejecutar si no fue un touch (touchstart ya lo manejó)
    if (Date.now() - lastTap < 500) return;
    isOpen = !isOpen;
    drawer.classList.toggle('open', isOpen);
    burger.classList.toggle('open', isOpen);
  });

  var links = drawer.querySelectorAll('a');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function() {
      isOpen = false;
      drawer.classList.remove('open');
      burger.classList.remove('open');
    });
  }

  window.addEventListener('scroll', function() {
    nav.style.boxShadow = window.scrollY > 20
      ? '0 1px 32px rgba(0,0,0,0.7)'
      : 'none';
  }, { passive: true });

})();
