# CAMBIOS APLICADOS — alexandercaro.com

Fecha: 2 de julio de 2026
Base: el ZIP que me enviaste (sitio vanilla HTML/CSS/JS, sin build).

Esto es un resumen humano. Todo está ya aplicado dentro del proyecto; abajo te digo qué revisar y los **4 pasos manuales** que solo puedes hacer tú.

---

## 1. Lo más importante: el testimonio de "Felipe Romero" salió del sitio

Fueggo es un proyecto **ficticio/conceptual** (tú me lo confirmaste: no existe el local ni el cliente). El sitio tenía un testimonio firmado por *"Felipe Romero — Fundador, Fueggo"* diciendo *"hoy nos reconocen"*. Eso es un testimonio inventado atribuido a una persona que no existe, sobre resultados que no ocurrieron.

Lo quité por completo. La razón no es solo ética: si un cliente real (o alguien que te está evaluando para un trabajo) descubre **un** testimonio falso, deja de creer en **todos** los demás — incluidos los reales de Mayra (La Jungla) y Steven (Rebel Street). Un testimonio falso contamina los verdaderos.

**Qué hice en su lugar:** reencuadré Fueggo como lo que de verdad es — un **proyecto conceptual propio**, hecho por ti de cero para demostrar que sabes construir un sistema de identidad completo. Eso sigue vendiendo tu capacidad, pero sin mentir. Es exactamente el mismo tratamiento honesto que ya tenía "Pulse Digital".

Cambios concretos:
- Carrusel de testimonios: 3 → 2 tarjetas (quedan solo las reales). Paginación ajustada a 01/02.
- Logo de Fueggo retirado de "Marcas que han confiado" (nunca fue un cliente).
- Caso `/trabajo/fueggo/`: título, textos, meta y schema reescritos en clave "concepto propio / listo para producción". Chip visible **"Concepto propio"**. El schema ahora declara `creativeWorkStatus: "Concept"`.
- Card de Fueggo en home y en `/trabajo/` con la etiqueta "Concepto propio".

> ⚠️ **Importante:** si los testimonios de **Mayra Castaño** o **Steven Mesa** tampoco fueran 100% reales, tienen que salir igual que este. Un portafolio con un solo testimonio real y honesto vale más que tres que no puedes respaldar.

---

## 2. Inglés real, indexable (antes era invisible para Google)

Antes el inglés se aplicaba solo en el navegador con JavaScript. Google nunca lo veía: no había URLs en inglés, así que para el buscador tu sitio era 100% en español y perdías todo el mercado internacional que dices querer.

Ahora hay una **versión inglesa real en `/en/`** — 15 páginas HTML de verdad, cada una con su `<title>`, descripción, Open Graph y canonical en inglés. Google ya puede indexarlas.

- Se generan con el script **`build-en.py`** (incluido). Cada vez que edites textos en español, corre `python3 build-en.py` y se regenera `/en/` completo.
- El botón ES/EN ahora **navega** a la URL equivalente en el otro idioma (antes solo intercambiaba texto en pantalla).
- `hreflang` es/en/x-default correcto en todas las páginas y en el sitemap.
- `/privacidad/` se queda solo en español (apunta siempre a la versión ES).

---

## 3. Analítica (antes tenías CERO datos)

No había ninguna medición en el sitio. No sabías cuántas visitas llegan, de dónde, ni cuántas hacen clic en WhatsApp. Estabas volando a ciegas.

- Nuevo archivo **`analytics.js`** (Google Analytics 4). Trae eventos ya cableados: clic en WhatsApp, clic en Calendly, clic en correo y envío del formulario (`generate_lead`).
- **No carga nada hasta que pongas tu ID** — así no rompe nada mientras tanto (ver paso manual #1).

---

## 4. Precio visible y filtro de clientes

Me dijiste: proyectos desde **$500 USD** para empezar. Ahora eso está a la vista, lo que filtra curiosos y atrae a quien sí tiene presupuesto:
- Microcopy en el hero: *"Proyectos desde $500 USD · Propuesta clara en 48 h · Empezamos solo si encaja"*.
- FAQ nueva: **"¿Cuánto cuesta un proyecto?"** (desde $500, la mayoría $500–$2.500).
- FAQ nueva: **"¿Qué pasa si no puedes continuar a mitad del proyecto?"** (cubre la duda del "one-person studio": trabajas por hitos, con contrato y archivos fuente entregados).
- En el formulario, la opción de presupuesto más baja ahora dice *"Menos de $500 USD — fuera de mi rango habitual"*.

---

## 5. Canal escrito (tu preferencia)

Como prefieres atender por escrito (tu inglés hablado aún es débil), reescribí la primera FAQ para que lo diga como una **ventaja**: toda la comunicación por WhatsApp o correo deja cada acuerdo y entrega documentado. Nada de "te llamo".

---

## 6. Dos puertas en el home (Cliente A / Cliente B)

Sección nueva justo antes de las estadísticas, con dos caminos claros:
- **A — "¿Tu marca no se ve seria?"** → `/servicios/identidad-visual/`
- **B — "¿Tu web no vende?"** → `/trabajo/orbidental/` (tu caso más fuerte: PageSpeed 40 → 97)

Ayuda a que cada visitante se identifique con un problema y sepa a dónde ir.

---

## 7. SEO, rendimiento y accesibilidad (arreglos técnicos)

- **Footer estático**: antes lo inyectaba JavaScript, así que Google no veía esos enlaces internos. Ahora es HTML real en las 16 páginas, con enlaces a tus secciones.
- **Schema FAQPage** en el home (puede darte resultados enriquecidos en Google).
- **Imagen principal (LCP)**: ahora con `srcset` en 3 tamaños → carga más rápido en móvil.
- **Demo ficticia** `/trabajo/pulse-digital/site/` marcada como `noindex` con canonical (no debe competir en Google con tu caso real).
- **Formulario**: honeypot anti-spam (campo trampa invisible para bots).
- **Accesibilidad**: se eliminó `outline: none` y se añadió foco visible dorado con teclado (`:focus-visible`).
- **WhatsApp**: los botones ahora son enlaces `<a>` reales (funcionan aunque el JS falle y son medibles).
- **`vercel.json`**: cabecera HSTS + cache de un año para `/assets/`.
- **`404.html`** nuevo, bilingüe y con tu estilo.
- **Títulos** mejorados (ej. `/sobre-mi/` ahora incluye "Diseñador y desarrollador freelance").

---

# ⚙️ LO QUE TIENES QUE HACER TÚ (4 pasos)

### Paso 1 — Poner tu ID de Google Analytics *(5 min)*
1. Entra a https://analytics.google.com y crea una propiedad GA4 para alexandercaro.com.
2. Copia tu **ID de medición** (tiene forma `G-XXXXXXXXXX`).
3. Abre **`analytics.js`** y reemplaza `G-XXXXXXXXXX` (línea del `GA_ID`) por el tuyo.
   Mientras tenga las X, no mide nada y no rompe nada.

### Paso 2 — Desplegar en Vercel
Sube los archivos como siempre (git push o el método que uses). Se publican tanto el sitio ES como la nueva carpeta `/en/`.

### Paso 3 — Reenviar el sitemap en Google Search Console
Ya tienes GSC verificado. Entra → **Sitemaps** → vuelve a enviar `https://alexandercaro.com/sitemap.xml`.
Ahora incluye las 31 URLs (15 ES + 15 EN + privacidad) con sus `hreflang`. Esto le dice a Google que existe la versión en inglés.

### Paso 4 *(recomendado, cuando puedas)* — Correo con tu dominio propio
Hoy tu contacto es `hosoyalexander@gmail.com`. Para verte más profesional ante clientes internacionales conviene algo como `hola@alexandercaro.com`.
**No lo cambié** porque ese buzón todavía no existe y no quiero dejarte un correo que rebote. Cuando lo crees (Hostinger te lo da con el dominio), búscalo y reemplázalo en: `index.html` (formulario + schema), `nav.js` (drawer) y donde aparezca el `mailto:`.

---

## Archivos nuevos
`analytics.js` · `404.html` · `build-en.py` · carpeta `/en/` (15 páginas)

## Archivos modificados (principales)
`index.html`, `i18n.js` (reescrito), `nav.js`, `script.js`, `style.css`, `vercel.json`, `sitemap.xml`, `lang/es.json`, `lang/en.json`, `trabajo/fueggo/index.html`, `trabajo/index.html`, `trabajo/pulse-digital/site/index.html`, `sobre-mi/index.html` + footer/analytics en las 15 páginas internas.

## Lo que dejé fuera a propósito (y por qué)
- **Minificar / pipeline de build**: cambiaría tu forma de desplegar. Tu sitio ya es rápido.
- **Schema de reseñas (AggregateRating)**: Google penaliza las reseñas que te pones a ti mismo. Con testimonios reales embebidos basta.
- **Google Business Profile**: es para negocio local; tú quieres remoto. Opcional.
- **Reescribir los breakpoints del CSS**: mucho riesgo, poco retorno. El diseño responsive actual funciona.

---

# CAMBIOS — 5 de julio de 2026 · Ofertas productizadas + reparación SEO crítica

## 1. Bug crítico reparado: tus páginas de servicios ES se estaban auto-desindexando

Los 4 archivos en español de `/servicios/{diseno-web, identidad-visual, diseno-grafico-freelance, fotografia-de-producto}/` habían sido **sobrescritos por el build EN**: tenían `lang="en"`, contenido en inglés y canonical apuntando a `/en/…`. Eso le dice a Google "esta URL es un duplicado de la versión en inglés" → Google saca las URLs en español del índice. Es la razón más probable de pérdida de tráfico orgánico en esas páginas.

- Reparado con **`restore-es.py`** (script nuevo en el repo): reaplica `lang/es.json`, restaura metas/canonical/OG en español y quita el prefijo `/en` de los enlaces.
- **`build-en.py` ahora tiene un guardián**: si una fuente ES tiene `lang="en"`, aborta con instrucciones. Este bug no puede volver a pasar en silencio.

> ⚠️ **PASO MANUAL**: en Google Search Console → Inspección de URL → "Solicitar indexación" para las 4 URLs ES reparadas, y en Sitemaps reenvía `sitemap.xml`.

## 2. Bug reparado: el botón dorado era invisible fuera de /trabajo/

`.btn--gold` lo usan 31 páginas (incluidos todos los CTA de WhatsApp de servicios), pero solo estaba definido en `trabajo/style.css`. Promovido a `style.css` global.

## 3. Bug reparado: la home en inglés mostraba textos en español

8 llaves `stat.*` (labels de las estadísticas del home) no existían en ningún JSON, así que `/en/` mostraba "Visualizaciones orgánicas", "Conversaciones en Meta Ads", etc. Añadidas en ES y EN.

## 4. Tres ofertas productizadas nuevas (ES + EN)

| Página | Precio | Promesa |
|---|---|---|
| `/servicios/web-express/` | USD 800 | Sitio de hasta 5 páginas en 14 días desde tu contenido |
| `/servicios/auditoria-seo-geo/` | USD 400 | Auditoría SEO + GEO (visibilidad en Google y en IA) en 10 días hábiles |
| `/servicios/plan-mensual/` | USD 600/mes | Bolsa de ~15 h de diseño + web, sin permanencia |

Cada página incluye: precio visible en el hero, qué incluye, **qué NO incluye** (honestidad visible — la misma regla del resto del sitio), proceso en 3 pasos, para quién es, FAQ en acordeón accesible con schema `FAQPage`, schema `Service + Offer` con precio en USD, y CTAs a WhatsApp (mensaje prellenado por oferta, bilingüe según la URL) y Calendly.

## 5. Tres landing pages de ciudad (ES + EN)

`/diseno-web-miami/` · `/diseno-web-houston/` · `/diseno-web-los-angeles/` — contenido diferenciado por ciudad (barrios reales, sectores típicos, FAQ locales sobre pagos desde EE. UU., invoice, idioma y horarios), schema `Service` con `areaServed` City + `AggregateOffer`, y los 3 paquetes enlazados. No son páginas doorway clonadas: cada una tiene copy propio.

## 6. Hub /servicios/ renovado

- Sección **"Paquetes con precio cerrado"** arriba (3 cards, Web Express destacado).
- Encabezado nuevo para las disciplinas + **4ª card de Fotografía de producto** (la página existía pero el hub nunca la enlazó).
- `ItemList` schema con 7 ítems, title/description con precios, enlace a las 3 ciudades.

## 7. GEO + sitemap

- **`llms.txt`** en la raíz: resumen bilingüe citable (servicios, precios exactos, URLs, resultados verificables, contacto) para ChatGPT, Claude, Perplexity y AI Overviews.
- Sitemap: **33 → 45 URLs** con hreflang; `lastmod` actualizado en todo lo tocado hoy.
- i18n: **771 → 1.060 llaves** por idioma. El copy de las 6 páginas nuevas vive en **`build-offers.py`**: si quieres cambiar textos, edítalos ahí y re-ejecuta (regenera HTML + JSON de una vez).

## Pasos manuales (solo tú puedes hacerlos)

1. `git add -A && git commit -m "Ofertas productizadas + fix canonical ES" && git push` → Vercel despliega solo.
2. **Search Console**: solicitar indexación de las 4 URLs ES reparadas + reenviar sitemap. Las 6 nuevas también puedes pedirlas, pero con el sitemap basta.
3. Probar `https://search.google.com/test/rich-results` con `/servicios/web-express/` — deben aparecer FAQ y la oferta con precio.
4. **Revisa las políticas comerciales que definí yo**: bolsa de 15 h/mes, rollover del 25%, páginas extra a USD 80–120, auditoría descontable en 30 días, pago 50/50. Son propuestas razonables, pero es TU negocio: ajústalas antes de publicar si no te cuadran.
