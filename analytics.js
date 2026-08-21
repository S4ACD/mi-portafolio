/* analytics.js — Google Analytics 4
   ▸ PASO ÚNICO: crea tu propiedad GA4 en https://analytics.google.com,
     copia tu ID de medición (formato G-XXXXXXXXXX) y pégalo abajo.
   Mientras el ID tenga las X, este archivo NO carga nada (cero errores). */
(function () {
  var GA_ID = 'G-QDJ545L7KS';   // ← reemplaza con tu ID real

  if (!/^G-[A-Z0-9]{6,}$/.test(GA_ID) || GA_ID.indexOf('X') !== -1) return;

  /* PERF: GTM son ~164KB. Cargarlo en idle (o al primer scroll/toque)
     lo saca de la ruta crítica sin perder ni una sola medición. */
  function loadGA() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadGA, { timeout: 3500 });
  } else {
    setTimeout(loadGA, 2500);
  }
  ['scroll','pointerdown','keydown'].forEach(function(e){
    window.addEventListener(e, loadGA, { once: true, passive: true });
  });

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });
})();
