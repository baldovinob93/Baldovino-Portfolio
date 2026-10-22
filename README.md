# Portfolio Baldovino

Portfolio personal de Baldovino, desarrollador Full Stack .NET. Presenta N|B Indumentary mediante capturas reales de escritorio y móvil, con un caso de estudio que recorre la experiencia de compra y la administración.

## Vista y tecnología

La portada combina una atmósfera galáctica en CSS con capturas reales del proyecto dentro de dispositivos dibujados con CSS. El sitio usa HTML estático generado con Node.js, CSS y JavaScript sin dependencias de producción ni fuentes externas. Esto mantiene la descarga pequeña, permite indexar el contenido y evita una SPA para navegación de dos páginas.

![Vista de escritorio del portfolio Baldovino](docs/portfolio-preview.webp)

## Requisitos y desarrollo

- Node.js 20 o superior.
- Para regenerar las imágenes: Python 3 con Pillow y el ZIP original suministrado por el propietario.

```bash
node scripts/dev.mjs
```

Abrir `http://127.0.0.1:4173/`. El servidor recompila al modificar `src/` o `public/`.

## Build de producción

```bash
node scripts/build.mjs
node scripts/check.mjs
```

El resultado publicable queda en `dist/`. `check.mjs` revisa rutas, anclas, archivos, imágenes y metadatos básicos. No requiere instalar paquetes.

## Estructura

```text
src/data/projects.mjs       Datos del sitio, proyectos, enlaces y etapas
src/styles.css              Design system, layout y responsive
src/main.js                 Menú, header, aparición y navegación del caso
scripts/build.mjs           Generador estático de portada y casos de estudio
scripts/dev.mjs             Servidor local con recompilación
scripts/check.mjs           Revisión de archivos y enlaces locales
scripts/prepare_assets.py   Copias WebP publicables a partir del ZIP original
public/assets/nib/         Capturas optimizadas
docs/portfolio-preview.webp Captura del portfolio para documentación
.github/workflows/pages.yml Preparación del despliegue en GitHub Pages
```

## Agregar proyectos

Editar **sólo** `src/data/projects.mjs` para registrar el proyecto: agregar un objeto al arreglo `projects` con `slug`, `name`, `summary`, `description`, `stack`, `hero.desktop`, `hero.mobile`, `demoUrl`, `githubUrl`, `featured` y `sections`. `mark` y `markCaption` son opcionales para el distintivo de la tarjeta. Cada sección usa `number`, `label`, `title`, `description` y `media` (`src`, `alt`, `type: 'desktop' | 'mobile'`). El build genera la tarjeta y la página `/projects/{slug}/` automáticamente. Guardar sus imágenes en `public/assets/`.

La sección muestra únicamente los proyectos registrados. La grilla se adapta automáticamente a la cantidad de proyectos reales, sin tarjetas de relleno.

## Configurar enlaces

En `src/data/projects.mjs`, completar `demoUrl` y `githubUrl` del proyecto con URLs HTTPS válidas. Completar `site.links.github`, `site.links.linkedin` y `site.links.email` (`mailto:...`) sólo con datos que se desee publicar. Los botones de demo y código se muestran únicamente cuando tienen una URL válida; los enlaces ausentes y los avisos de configuración no se renderizan.

## GitHub Pages

1. Crear un repositorio y subir este proyecto cuando se autorice la publicación.
2. Configurar **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. La acción `.github/workflows/pages.yml` compila, verifica y despliega desde `main`. También permite ejecutarla manualmente.
4. La acción detecta automáticamente el `SITE_BASE_PATH` de un repositorio de proyecto (`/nombre-del-repo/`) o de usuario (`/`). Define `SITE_URL` para `canonical`, Open Graph y `sitemap.xml`.

Para probar manualmente la ruta de un repositorio, establecer `SITE_BASE_PATH=/nombre-del-repo/` antes del build. Si se usa dominio propio, ajustar `SITE_URL` y `SITE_BASE_PATH` según ese dominio antes de publicar.

## Capturas y privacidad

Las 13 imágenes WebP provienen del ZIP proporcionado. El original permanece intacto fuera de este proyecto. Las copias publicadas ocultan los datos de contacto del checkout, los identificadores y la dirección del seguimiento, los datos de clientes y registros de prueba de administración, y el saldo e importes de la captura de pago. Las máscaras son opacas y reproducibles, conservan la interfaz y no inventan datos de reemplazo. No se incluyen secretos, contraseñas, URLs inventadas ni datos de contacto no provistos.

## Créditos

Diseño y desarrollo del portfolio: Baldovino. Capturas de N|B Indumentary: material proporcionado por el propietario del proyecto. Favicon y composiciones decorativas: SVG/CSS originales de este portfolio.
