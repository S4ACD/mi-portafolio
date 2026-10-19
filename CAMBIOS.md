# IMÁGENES PARA COMPARTIR Y ARTÍCULOS DE PRECIOS: 19 oct 2026

- Cada caso y cada artículo tiene su propia imagen para compartir (1200×630): etiqueta, título en Fraunces, tu nombre y la portada del proyecto. Es la que sale al pegar el enlace en LinkedIn, WhatsApp o X. Se crea sola en cada build (`scripts/lib/og.mjs`, fuente en `scripts/fonts/`). Si la portada de Cloudinary no se puede descargar en ese momento, sale con una franja del color del proyecto y se vuelve a intentar en el siguiente build.
- Dos artículos nuevos, en español e inglés: «Cuánto cuesta un logo en Colombia» y «Cuánto cuesta una página web en Colombia en 2026», con tus precios reales (identidad desde USD 500, Web Express USD 800, Plan mensual USD 600).
- Los filtros de /trabajo/ ya existían y se pueden compartir con enlace, por ejemplo `alexandercaro.com/trabajo/#dental`.

# RESEÑAS DE WORKANA: 19 oct 2026

- Bloque de reseñas con tu calificación (5,0 de 5, 9 calificaciones, 4 clientes que repitieron), 4 reseñas y el enlace a tu perfil de Workana. Sale en el inicio (Sobre mí), en Servicios y en el CV, en español y en inglés (marcadas como traducidas). En el PDF del CV no sale.
- Se editan desde el panel: **Reseñas → Reseñas de Workana** (archivo `content/resenas.yml`).
- Tu perfil de Workana se suma a los datos de Google (sameAs) en todas las páginas y artículos.

# ARTÍCULOS, 404, PRIVACIDAD Y LIMPIEZA: 19 oct 2026

- Cuatro artículos nuevos en español e inglés, de más de 6.000 caracteres cada uno: lanzar una marca en redes (DiaDent), qué incluye un manual de marca (ONCES y Fueggo), logo en Canva vs. sistema de marca (Rebel Street) y cómo aparecer en ChatGPT y en Google (SEO + GEO).
- El primer artículo (tienda lenta) se amplió a más de 6.000 caracteres.
- Los artículos ahora tienen recuadro «Lo más importante», índice, preguntas frecuentes (con datos estructurados FAQPage), palabra clave y datos del autor. Campos nuevos en el panel: «Lo más importante», «Preguntas frecuentes» y «SEO → Búsqueda principal».
- Página 404 nueva con el diseño del sitio (se ve en inglés si la dirección empieza por /en/).
- Política de privacidad con el diseño nuevo. Se corrigió: el sitio sí usa Google Analytics 4, y el formulario pide «correo o WhatsApp».
- `robots.txt`: el panel `/admin/` queda bloqueado también para los robots de IA.
- Se borraron 47 archivos que ya no se usaban: las páginas hechas a mano de los 10 casos antiguos (ahora salen de la plantilla), sus `style.css` y `script.js`, `hero.js`, `cv/style.css`, `cv/script.js`, `sobre-mi/style.css`, `sobre-mi/script.js`, `js/dental-media.js` y `css/dental-media.css`. Se dejó `trabajo/pulse-digital/site/`.

# CV: PDF a prueba de filtros (ATS), 19 oct 2026

- El PDF del CV (y lo que sale al imprimir /cv/) ahora va en una sola columna, con letra Arial, títulos de sección estándar y el contacto dentro del texto, para que los portales de empleo lo lean bien. Sigue en 2 hojas.
- Nueva sección «Logros destacados» al inicio del PDF; los proyectos secundarios van en una sola línea.
- Los PDF incluyen título, autor, tema y palabras clave.

# SERVICIOS, SOBRE MÍ Y ARTÍCULOS: 19 oct 2026

- /servicios/ y /sobre-mi/ (ES y EN) con el diseño nuevo: paquetes con precio en tarjetas, disciplinas con proyectos de ejemplo, historia en cuatro partes y certificaciones. Sobre mí ya tiene imagen para compartir en redes.
- Las páginas de cada servicio y de Miami, Houston y Los Ángeles se ajustan al estilo nuevo (botones y etiquetas sin mayúsculas) desde `css/landing.css`.
- Sección de artículos: `/articulos/` y `/en/articulos/`, una página por artículo, feed RSS, datos estructurados (BlogPosting), sitemap y `llms.txt`. Se publican desde el panel (colección «Artículos», archivos en `content/articulos/`, imágenes en `uploads/articulos/`).
- «Artículos» en el menú del sitio.
- Primer artículo: «Por qué tu tienda en línea carga lento y cuánto te está costando», sobre el caso Orbidental.
- Estilos en `css/paginas.css` y `css/articulos.css`; el build de artículos vive en `scripts/lib/articles.mjs`.

# CV v3: hoja de vida rediseñada, 16 oct 2026

- /cv/ y /en/cv/ con el diseño nuevo, en el orden en que lee un reclutador: datos y contacto, resultados, experiencia, habilidades, sector dental, proyectos, formación, certificaciones.
- Se suman la experiencia de Masterbag y de miniaturas para YouTube, las cifras de ventas atribuidas y el trabajo de DiaDent y Eighteeth, que estaban en el PDF o no estaban en la web.
- Al imprimir la página (o «Guardar como PDF») sale un CV en blanco y negro de 2 páginas. Los PDF de `assets/cv/` se generaron así y quedan iguales a la web.
- En el celular, una barra fija con WhatsApp y PDF.
- Estilos en `css/cv.css` (más las piezas de `css/inicio.css`). `cv/style.css` y `cv/script.js` quedaron sin uso.

# INICIO v3: inicio rediseñado, 16 oct 2026

- Hero nuevo: tu nombre a todo el ancho, el retrato delante y anillos y rocas en capas que se mueven a distinta profundidad con el cursor. Sin GSAP: lo mueve `js/inicio.js` (más liviano y rápido).
- El trabajo va justo después del hero: tres proyectos grandes y un índice con vista previa que sigue al cursor. Se generan desde el panel (orden «inicio» y máximo de proyectos en «Orden de proyectos»).
- De 14 secciones a 8: Lo que hago, Video, Cómo trabajamos, Sobre mí (certificaciones y testimonios), Preguntas frecuentes y Contacto.
- El formulario ahora pide «Correo o WhatsApp» (antes no había forma de responderle a quien escribía). Los mensajes del formulario salen en el idioma de la página.
- Las 179K visualizaciones ya no dicen «sin pauta» en el inicio ni en el CV.
- Estilos en `css/inicio.css`; `hero.js` quedó sin uso.

# PORTAFOLIO v2.1: casos antiguos con el diseño nuevo, 16 oct 2026

- Los 10 casos antiguos (Orbidental, DiaDent, Eighteeth, Social Media Dental, AcelerArte, MotoFaro, Pulse Digital, Fueggo, La Jungla Club y Rebel Street) pasan a la plantilla de caso. Sus textos en español e inglés, imágenes, videos, cifras, SEO y cierre se conservan y ahora se editan desde el panel.
- Bloques nuevos en la plantilla y en el panel: lista de puntos, videos (MP4 vertical u horizontal con portada), sitio web en vivo, cifras con título, explicación y nota, cita con autor, imagen como logotipo, paleta con uso de cada color, etiqueta sobre el nombre y cierre propio por caso. Los textos aceptan enlaces `[texto](url)` y frases destacadas con `> `.
- Las portadas verticales o alojadas en Cloudinary se encuadran a 16:10 para que la página no salte al cargar. «Completa sobre el color de la marca» muestra la pieza sin recortar (AcelerArte).
- Nueva portada de caso para Social Media Dental (`uploads/proyectos/social-media-dental/portada-caso.jpg`).
- Un proyecto con página automática ya no choca con su HTML hecho a mano: el build usa la versión del panel.
- Se quitó de Rebel Street el texto provisional «[DATO REAL: …]» y de la descripción SEO de Social Media Dental la frase «Sin pauta pagada», que contradecía el resto del caso («diseño + pauta»).

# PORTAFOLIO v2: proyectos automáticos y rediseño, 16 oct 2026

Uso diario: ver **GUIA.md**.

1. **Un proyecto, un archivo.** Los 16 proyectos viven en `content/proyectos/*.yml` (ES + EN). El build (`npm run build`, lo corre Vercel) genera las tarjetas del inicio, /trabajo/ y el CV en los dos idiomas, las páginas de caso nuevas, el sitemap, el JSON-LD y la lista de `llms.txt`.
2. **Panel `/admin`** (Sveltia CMS sobre GitHub) para crear, editar, ordenar y subir fotos sin tocar código.
3. **Rediseño de la zona de proyectos.** Nueva /trabajo/ (grilla editorial con filtros), tarjetas nuevas en inicio y CV, y una plantilla de caso cuya portada toma el color de la marca. Sin animaciones de entrada en esas páginas: el fundido del body impedía que Chrome registrara el LCP.
4. **6 proyectos nuevos**, todos marcados como concepto propio y con la nota de fotografía con IA en los créditos: ONCES, Hushwork, Double Notch, ¡HAY!, Logofolio I (20 marcas) y Logofolio II (12 marcas). Pulse Digital estrena portada y MotoFaro usa la captura del comparador.
5. **Imágenes optimizadas al publicar**: AVIF, WebP y JPG en varios tamaños con `srcset`, y `srcset` también para Cloudinary.
6. **Datos corregidos**: Orbidental dice 3.000+ productos en todo el sitio (antes 4.000 en /trabajo/ y /servicios/); el conteo de proyectos del CV ya no queda desactualizado; se arreglaron textos en español que aparecían en /en/ y viceversa en las tarjetas.
7. **Ya no se publican** los `.py` ni los `.md` del repositorio: antes eran accesibles en alexandercaro.com/build-en.py, etc.
8. `validate-site.py` ahora revisa `dist/`. Resultado: 65 páginas OK, 4.512 referencias locales sin enlaces rotos y 320 archivos idénticos al sitio anterior.

---

# RENDIMIENTO MÓVIL — 29 sept 2026

PageSpeed móvil daba 74 (escritorio 98). Cambios solo en `index.html` y `en/index.html`:

1. **Fuentes sin bloqueo.** La hoja de Google Fonts bloqueaba el primer render (~2,8 s en 4G lento). Ahora los `@font-face` van inline apuntando a los mismos woff2 de fonts.gstatic.com. Mismas fuentes, una petición bloqueante menos. Se quitó el preconnect a fonts.googleapis.com (ya no se usa).
2. **CSS crítico completo.** Le faltaba el reset (`*{margin:0;box-sizing:border-box}`), el `body` y `.scroll-progress`. Al llegar `style.css` el hero saltaba 8 px y cambiaba de alto → CLS 0,061. Ahora el CLS es 0.
3. **LCP de texto visible de inmediato en móvil.** En móvil el título en cursiva y la descripción ya no arrancan en opacidad 0 (eran el LCP y lo retrasaban). En escritorio la animación sigue igual.
4. **Preload del retrato solo en ≥768 px.** En móvil el retrato queda bajo la primera pantalla; precargarlo le robaba ancho de banda al texto. El logo ya no pide prioridad alta.
5. **Miniatura del video** con srcset 480/768/960/1280 y `sizes` real (antes bajaba 1280 px para mostrarse a ~380 px).

Si algún día Google cambia la versión de las fuentes (v38/v20/v22), las URLs viejas siguen sirviéndose; para actualizarlas basta abrir la URL css2 original en Chrome y copiar los bloques `latin`/`latin-ext`.

---

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
