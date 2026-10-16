# Guía del portafolio v2

Cada proyecto vive **en un solo archivo** (`content/proyectos/<proyecto>.yml`, con español e inglés juntos). Al publicar, el sitio se arma solo:

- **Inicio**: los 3 primeros de la lista «inicio» salen grandes y los siguientes en un índice (máximo 9 en total). También las tarjetas de **/trabajo/** (todos) y del **CV** (portafolio y sector dental), en ES y EN.
- **Página del caso** en `/trabajo/<proyecto>/` y `/en/trabajo/<proyecto>/` para los proyectos con página automática.
- **Imágenes optimizadas**: cada foto se convierte a AVIF, WebP y JPG en varios tamaños.
- **SEO**: sitemap, datos estructurados (JSON-LD) y la lista de proyectos en `llms.txt`.

Lo subes desde **alexandercaro.com/admin**, sin tocar código.

---

## 1. Puesta en marcha (una sola vez)

1. **Sube el código a tu repositorio.** Copia el contenido del zip sobre tu repositorio (conserva tu carpeta `.git`), haz commit y push a `main`.
2. **Vercel no necesita cambios.** `vercel.json` ya indica el comando (`npm run build`) y la carpeta (`dist`). El primer build tarda 2 o 3 minutos porque procesa todas las imágenes; los siguientes, unos segundos.
3. **Conecta el panel a tu repositorio.** En `admin/config.yml` cambia esta línea por tu usuario y repositorio, y haz commit:
   ```yaml
   repo: TU-USUARIO/TU-REPOSITORIO
   ```
4. **Crea una llave de acceso en GitHub.** Ve a GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token:
   - Repository access: **Only select repositories** → tu repositorio.
   - Permissions → Repository permissions → **Contents: Read and write**.
   - Copia el token.
5. **Entra al panel.** Abre `alexandercaro.com/admin/`, elige **Sign In with Token** y pega el token. Queda guardado en ese navegador.

> El token da acceso de escritura a tu repositorio: no lo compartas. Si lo pierdes o cambias de equipo, crea otro.

---

## 2. Subir un proyecto nuevo

1. En el panel: **Proyectos → New**.
2. Llena la pestaña **ES**:
   - **Nombre**: también define la URL (`ONCES` → `/trabajo/onces/`).
   - **Fecha** y **Año**.
   - **Áreas**: alimentan los filtros de /trabajo/.
   - **Mostrar en**: inicio, /trabajo/, CV.
   - **Concepto propio**: actívalo si no hubo cliente real.
   - **Color de la marca**: fondo de la portada del caso.
   - **Portada**: sube la imagen o pega una URL de Cloudinary.
   - **Resumen**, **Disciplinas** y, si lo tienes, **Resultado**.
   - **SEO** y **Página del caso**. El caso se arma con bloques: texto (con `> ` al inicio de un párrafo lo vuelves frase destacada), imagen (también como logotipo centrado), galería de 1 a 4 columnas, cita con autor, cifras con explicación y nota, lista de puntos, videos MP4 verticales u horizontales, sitio web en vivo dentro de una ventana de navegador y paleta de color con proporción de uso. Al final puedes cambiar el **cierre de la página** (la pregunta y el texto antes del botón de WhatsApp).
3. Pasa a la pestaña **EN** y traduce. Lo que dejes vacío en inglés usa el texto en español.
4. **Save**. En 1 o 2 minutos el proyecto está publicado en todas las páginas.

**Fotos:** súbelas grandes (unos 2400 px de ancho) y sin preocuparte por el peso. El panel las convierte a WebP y el build crea las versiones para cada pantalla.

**Si algo falta** (por ejemplo, una imagen que no existe o un resumen vacío), Vercel no publica el cambio y deja el sitio como estaba. El error aparece en el log del deploy de Vercel con el nombre del archivo y el campo.

---

## 3. Ordenar

**Orden de proyectos** (en el panel) tiene una lista por página: inicio, /trabajo/, CV portafolio y CV sector dental. Arrastra para reordenar.

- Un proyecto nuevo que todavía no está en la lista **aparece primero** sin que hagas nada.
- El proyecto marcado como **Destacado** va arriba en /trabajo/, a ancho completo. Deja solo uno.
- Desde ahí también eliges cuántos proyectos salen como máximo en el inicio y en el CV.

---

## 4. Trabajar en tu computador (opcional)

Necesitas Node 20 o más reciente.

```bash
npm install
npm run dev      # arma el sitio y lo sirve en http://localhost:4321, se actualiza al guardar
npm run build    # solo arma el sitio en dist/
npm run check    # solo valida el contenido
python3 validate-site.py   # tu validador de siempre, ahora revisa dist/
```

El panel también funciona sin GitHub: en Chrome, abre `http://localhost:4321/admin/` y elige **Work with Local Repository**.

---

## 5. Qué hay en el repositorio

| Ruta | Qué es |
|---|---|
| `content/proyectos/*.yml` | Un archivo por proyecto (ES + EN). Es lo que edita el panel. |
| `content/portafolio.yml` | Orden de los proyectos en cada página. |
| `uploads/proyectos/` | Fotos originales. No se publican tal cual; el build publica las versiones optimizadas en `/assets/proyectos/`. |
| `admin/` | El panel (Sveltia CMS) y su configuración. |
| `scripts/` | El build: `build.mjs` y sus módulos en `scripts/lib/`. |
| `css/proyectos.css`, `js/proyectos.js` | Diseño de la zona de proyectos y filtros de /trabajo/. |
| `dist/` | El sitio generado. No se sube al repositorio; Vercel lo crea en cada deploy. |

**Zonas automáticas.** En `index.html`, `trabajo/index.html`, `cv/index.html` y sus versiones en `/en/` hay bloques marcados así:

```html
<!-- @auto:inicio --> … <!-- /@auto:inicio -->
```

Lo que está entre esas marcas lo escribe el build: no lo edites a mano. El resto de cada página se edita como siempre.

**Casos antiguos.** Los 10 casos que ya tenías (Orbidental, Fueggo, etc.) ya usan el diseño nuevo: sus textos, imágenes y videos están en el panel como bloques, igual que los proyectos nuevos. Sus páginas hechas a mano siguen en `trabajo/<proyecto>/index.html`, pero el build las reemplaza por la versión del panel; no hace falta borrarlas. La carpeta `trabajo/pulse-digital/site/` (el sitio de Pulse que se ve dentro del caso) sí se sigue usando.

**Scripts de Python anteriores** (`build-en.py`, `restore-es.py`, `build-offers.py`): siguen en el repositorio para el resto del sitio, pero ya no se publican. Las zonas de proyectos no dependen de ellos.
