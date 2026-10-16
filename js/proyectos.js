/* js/proyectos.js — Filtros de /trabajo/ (v2)
   · Cada tarjeta lleva data-areas="branding web …".
   · Al filtrar se recalcula el ritmo ancho/angosto de la grilla
     para que nunca queden huecos.
   · El filtro activo queda en la URL (#branding) para poder compartirlo. */
(() => {
  const grid = document.querySelector('[data-wk-grid]');
  const buttons = [...document.querySelectorAll('[data-wk-filter]')];
  if (!grid || !buttons.length) return;
  const cards = [...grid.querySelectorAll('.wk-card')];
  const empty = grid.querySelector('.wk-empty');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const layout = () => {
    let i = 0;
    cards.forEach((c) => {
      if (c.hidden || c.classList.contains('wk-card--full')) return;
      const row = Math.floor(i / 2);
      const first = i % 2 === 0;
      const wide = row % 2 === 0 ? first : !first;
      c.classList.toggle('wk-card--wide', wide);
      c.classList.toggle('wk-card--narrow', !wide);
      i++;
    });
    // Una tarjeta sola al final ocupa el ancho de una "ancha".
    const visible = cards.filter((c) => !c.hidden && !c.classList.contains('wk-card--full'));
    if (visible.length % 2 === 1) {
      const last = visible[visible.length - 1];
      last.classList.add('wk-card--wide');
      last.classList.remove('wk-card--narrow');
    }
  };

  const apply = (area, push) => {
    const show = (c) => area === 'todos' || (c.dataset.areas || '').split(' ').includes(area);
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.wkFilter === area)));
    const swap = () => {
      cards.forEach((c) => { c.hidden = !show(c); c.classList.remove('is-leaving'); });
      if (empty) empty.hidden = cards.some((c) => !c.hidden);
      layout();
    };
    if (reduce) swap();
    else {
      cards.forEach((c) => { if (!show(c)) c.classList.add('is-leaving'); });
      setTimeout(swap, 200);
    }
    if (push) {
      const url = area === 'todos' ? location.pathname : `${location.pathname}#${area}`;
      history.replaceState(null, '', url);
    }
  };

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.wkFilter, true)));

  const fromHash = decodeURIComponent(location.hash.slice(1));
  if (fromHash && buttons.some((b) => b.dataset.wkFilter === fromHash)) apply(fromHash, false);
  else layout();
})();
