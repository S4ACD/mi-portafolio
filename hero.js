/* ═══════════════════════════════════════════════════════════════
   HERO v2 — Cosmos Editorial — LAYOUT DEFINITIVO
   
   Estructura:
   .hv2 (full viewport, relative)
     ├── capas de fondo (bg, grain, fog, particles) z-index 0-3
     ├── .hv2__rings (órbita SVG, decorativa) z-index 4
     ├── .hv2__stage--far (rocas lejanas) z-index 5
     ├── .hv2__portrait (retrato, absoluto derecha) z-index 6
     ├── .hv2__stage--near (rocas cercanas) z-index 7
     ├── .hv2__content (texto + botones) z-index 10
     ├── .hv2__side (textos laterales) z-index 9
     └── .hv2__badge (badge circular) z-index 9
═══════════════════════════════════════════════════════════════ */

.hv2 {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  padding-bottom: 120px;
}

/* ── Fondos ── */
.hv2__bg {
  position: absolute; inset: 0; z-index: 0;
  background: var(--hv2-void);
}
.hv2__grain {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  background-size: 256px;
  opacity: 0.6;
}
.hv2__fog {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background:
    radial-gradient(ellipse 70% 60% at 65% 42%, rgba(205,183,142,0.06) 0%, transparent 65%),
    radial-gradient(ellipse 50% 50% at 30% 70%, rgba(205,183,142,0.03) 0%, transparent 60%);
}
.hv2__particles { position: absolute; inset: 0; z-index: 3; pointer-events: none; }

/* ── Órbita SVG — centrada con el retrato ── */
.hv2__rings {
  position: absolute;
  z-index: 4;
  width: clamp(360px, 48vw, 680px);
  /* centrada horizontalmente en la mitad derecha */
  top: 50%;
  right: 0;
  transform: translateY(-52%);
  pointer-events: none;
  fill: none;
  stroke: rgba(205,183,142,0.11);
  stroke-width: 0.5;
}
.hv2__rings-dashed { stroke-dasharray: 2 6; stroke: rgba(205,183,142,0.16); }
.hv2__glint-tail  { fill: rgba(205,183,142,0.18); }
.hv2__glint-mid   { fill: rgba(205,183,142,0.45); }
.hv2__glint-core  { fill: #f4efe6; }

/* ── Stages de rocas ── */
.hv2__stage { position: absolute; inset: 0; pointer-events: none; }
.hv2__stage--far  { z-index: 5; }
.hv2__stage--near { z-index: 7; }

.hv2__rock { position: absolute; }
.hv2__rock-parallax { will-change: transform; }
.hv2__rock-float    { will-change: transform; }
.hv2__rock img      { display: block; }
.hv2__rock--flip img { transform: scaleX(-1); }

/* Rocas — distribuidas a lo ancho pero concentradas abajo */
.hv2__rock--far1  { bottom: -50px; left: 0%;    opacity: 0.3;  filter: blur(2px);   }
.hv2__rock--far2  { bottom: -70px; right: 0%;   opacity: 0.25; filter: blur(2.5px); }
.hv2__rock--far3  { bottom: -55px; left: 42%;   opacity: 0.2;  filter: blur(3px);   }
.hv2__rock--near1 { bottom: -35px; left: 22%;   opacity: 0.8;  }
.hv2__rock--near2 { bottom: -45px; right: 18%;  opacity: 0.85; }
.hv2__rock--near3 { bottom: -38px; left: -1%;   opacity: 0.65; }
.hv2__rock--near4 { bottom: -25px; right: 36%;  opacity: 0.7;  }
.hv2__rock--near5 { bottom: -55px; right: 52%;  opacity: 0.6;  }

/* ── Retrato — posicionado en la mitad derecha, centrado con la órbita ── */
.hv2__portrait {
  position: absolute;
  bottom: 0;
  /* Lo centramos en la mitad derecha del viewport */
  left: 50%;
  transform: translateX(8%);
  z-index: 6;
  width: clamp(300px, 40vw, 560px);
  pointer-events: none;
}
.hv2__portrait-tilt,
.hv2__portrait-parallax,
.hv2__portrait-float { will-change: transform; }
.hv2__portrait img { width: 100%; height: auto; display: block; }

/* ── Contenido — ocupa la mitad izquierda, bien centrado ── */
.hv2__content {
  position: relative;
  z-index: 10;
  /* Ocupa ~45% del ancho, con margen izquierdo del container */
  width: min(520px, 45vw);
  padding: 0;
  /* Margen izquierdo = mismo que .container */
  margin-left: max(40px, calc((100vw - 1100px) / 2));
}

/* ── Textos ── */
.hv2__status {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--hv2-font-ui);
  font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--hv2-ink-dim);
  margin-bottom: 20px;
}
.hv2__status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 3px rgba(74,222,128,0.2);
  animation: statusPulse 2s ease-in-out infinite;
}
@keyframes statusPulse {
  0%,100% { box-shadow: 0 0 0 3px rgba(74,222,128,0.2); }
  50%      { box-shadow: 0 0 0 6px rgba(74,222,128,0.08); }
}
.hv2__kicker {
  font-family: var(--hv2-font-ui);
  font-size: 12px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--hv2-gold);
  margin-bottom: 16px;
}
.hv2__title {
  font-family: var(--hv2-font-display);
  font-size: clamp(2.6rem, 4.5vw, 5rem);
  font-weight: 400; line-height: 1.02;
  letter-spacing: -0.02em; color: #fff;
  margin-bottom: 24px;
}
.hv2__title-line   { display: block; overflow: hidden; }
.hv2__title-script { display: block; font-style: italic; color: var(--hv2-gold); }
.hv2__desc {
  font-family: var(--hv2-font-body);
  font-size: clamp(0.9rem, 1.3vw, 1rem);
  line-height: 1.75; color: var(--hv2-ink-dim);
  max-width: 420px; margin-bottom: 36px;
}
.hv2__actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 28px; }

/* ── Botones ── */
.hv2-btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--hv2-font-ui);
  font-size: 13px; font-weight: 600; letter-spacing: 0.06em;
  padding: 13px 26px; border-radius: 999px;
  cursor: pointer; transition: all 0.28s var(--hv2-ease);
  border: none; white-space: nowrap; text-decoration: none;
}
.hv2-btn--primary { background: var(--hv2-gold); color: #0f0e0c; }
.hv2-btn--primary:hover {
  background: #e3d2b3;
  box-shadow: 0 0 32px rgba(205,183,142,0.4);
  transform: translateY(-2px);
}
.hv2-btn--ghost {
  background: transparent; color: var(--hv2-ink);
  border: 1px solid var(--hv2-line);
}
.hv2-btn--ghost:hover {
  border-color: rgba(205,183,142,0.35);
  background: rgba(244,239,230,0.04);
  transform: translateY(-2px);
}

/* ── Price signal ── */
.hv2__price-signal {
  font-family: var(--hv2-font-ui);
  font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--hv2-ink-faint);
  display: flex; align-items: center; gap: 10px;
}
.hv2__price-signal-dot { color: var(--hv2-gold); opacity: 0.5; }

/* ── Laterales ── */
.hv2__side {
  position: absolute; z-index: 9;
  font-family: var(--hv2-font-ui);
  font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--hv2-ink-faint);
}
.hv2__side--scroll { bottom: 32px; left: 24px; writing-mode: vertical-rl; }
.hv2__side--tags {
  bottom: 32px; right: 24px;
  display: flex; flex-direction: column; align-items: flex-end; gap: 6px;
}

/* ── Badge ── */
.hv2__badge {
  position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
  z-index: 9; width: 80px; height: 80px;
}
.hv2__badge svg {
  width: 100%; height: 100%;
  fill: none;
  animation: badgeSpin 24s linear infinite;
}
.hv2__badge svg text {
  font-family: var(--hv2-font-ui);
  font-size: 13px; font-weight: 500; letter-spacing: 0.12em;
  fill: var(--hv2-ink-dim);
}
.hv2__badge-dot {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--hv2-gold);
}
@keyframes badgeSpin { to { transform: rotate(360deg); } }

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════════════════════ */

/* Pantallas grandes: más espacio */
@media (min-width: 1400px) {
  .hv2__content { width: min(560px, 42vw); }
  .hv2__portrait { width: clamp(380px, 38vw, 600px); transform: translateX(5%); }
}

/* Tablet */
@media (max-width: 1100px) {
  .hv2__content { width: min(480px, 48vw); }
  .hv2__portrait { width: clamp(260px, 42vw, 460px); transform: translateX(4%); }
  .hv2__rings { width: clamp(300px, 50vw, 560px); }
}

@media (max-width: 900px) {
  .hv2__content { width: min(420px, 52vw); }
  .hv2__portrait { width: clamp(240px, 44vw, 400px); transform: translateX(2%); }
}

/* Mobile */
@media (max-width: 767px) {
  .hv2 {
    flex-direction: column;
    align-items: flex-start;
    padding-top: 88px;
    padding-bottom: 60px;
    min-height: 100svh;
  }

  /* Texto primero */
  .hv2__content {
    width: 100%;
    padding: 0 20px;
    margin-left: 0;
    order: 1;
    z-index: 10;
    position: relative;
  }

  /* Retrato al final */
  .hv2__portrait {
    position: relative;
    left: auto;
    transform: none;
    width: clamp(180px, 60vw, 280px);
    margin: 24px auto 0;
    z-index: 6;
    order: 2;
  }

  .hv2__title  { font-size: clamp(2rem, 8vw, 2.8rem); }
  .hv2__desc   { font-size: 0.95rem; max-width: 100%; }

  /* Reducir rocas en mobile */
  .hv2__stage--far  { opacity: 0.4; }
  .hv2__stage--near { opacity: 0.5; z-index: 3; }

  /* Órbita más pequeña en mobile */
  .hv2__rings {
    width: 280px;
    right: -60px;
    top: 20%;
    transform: none;
  }

  .hv2__side  { display: none; }
  .hv2__badge { display: none; }
}

@media (max-width: 400px) {
  .hv2__title { font-size: 1.9rem; }
  .hv2__portrait { width: 55vw; }
}
