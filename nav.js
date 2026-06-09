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
          '<div class="nav__lang" id="navLang">' +
            '<button class="nav__lang-btn" id="langToggle">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
              '<span id="currentLang">ES</span>' +
              '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' +
            '</button>' +
            '<div class="nav__lang-dropdown" id="langDropdown">' +
              '<button class="lang-option lang-option--active" data-lang="es" data-label="ES">🇨🇴 Español</button>' +
              '<button class="lang-option" data-lang="en" data-label="EN">🇺🇸 English</button>' +
              '<button class="lang-option" data-lang="pt" data-label="PT">🇧🇷 Português</button>' +
              '<button class="lang-option" data-lang="fr" data-label="FR">🇫🇷 Français</button>' +
            '</div>' +
          '</div>' +
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
        '<!-- Google Translate oculto -->' +
        '<div id="google_translate_element" style="display:none"></div>' +
      '</nav>'
    );

    // Inyectar Google Translate script
    var script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement(
        { pageLanguage: 'es', autoDisplay: false },
        'google_translate_element'
      );
      // Aplicar idioma guardado
      var saved = localStorage.getItem('ac_lang');
      if (saved && saved !== 'es') {
        setTimeout(function() { setLang(saved); }, 800);
      }
    };

    setupToggle();
    setupLang();
  }

  function setLang(lang) {
    var select = document.querySelector('.goog-te-combo');
    if (!select) return;
    select.value = lang;
    select.dispatchEvent(new Event('change'));
    localStorage.setItem('ac_lang', lang);
  }

  function setupLang() {
    var langToggle  = document.getElementById('langToggle');
    var langDropdown = document.getElementById('langDropdown');
    var currentLang  = document.getElementById('currentLang');
    if (!langToggle) return;

    langToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });

    document.addEventListener('click', function() {
      langDropdown.classList.remove('open');
    });

    document.querySelectorAll('.lang-option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var lang  = btn.dataset.lang;
        var label = btn.dataset.label;
        currentLang.textContent = label;
        document.querySelectorAll('.lang-option').forEach(function(b) {
          b.classList.remove('lang-option--active');
        });
        btn.classList.add('lang-option--active');
        langDropdown.classList.remove('open');

        if (lang === 'es') {
          // Volver al original
          var frame = document.querySelector('.goog-te-banner-frame');
          if (frame) {
            var restore = frame.contentDocument.getElementById(':0.restore');
            if (restore) restore.click();
          }
          localStorage.setItem('ac_lang', 'es');
        } else {
          setLang(lang);
        }
      });
    });

    // Marcar idioma guardado en el dropdown
    var saved = localStorage.getItem('ac_lang');
    if (saved) {
      var savedBtn = document.querySelector('.lang-option[data-lang="' + saved + '"]');
      if (savedBtn) {
        document.querySelectorAll('.lang-option').forEach(function(b) { b.classList.remove('lang-option--active'); });
        savedBtn.classList.add('lang-option--active');
        currentLang.textContent = savedBtn.dataset.label;
      }
    }
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
