# Crónica Nacional · cronicanacional.org

Periodismo en tiempo real. Sitio estático (HTML, CSS y JavaScript sin dependencias) publicado en Netlify.

## Cómo publicar una nota (panel)
1. Entra a **https://cronicanacional.org/admin**.
2. Inicia sesión con GitHub.
3. En **Notas → Nueva nota**, llena titular, sección, resumen y, si quieres, el texto completo y una foto.
4. Pulsa **Guardar / Publicar**. En uno o dos minutos aparece en el sitio.

Desde el mismo panel puedes editar o borrar notas y cambiar los **Datos del día** (El dato e indicadores de la columna lateral).

> El panel guarda en el repositorio `despiertanoticias/cronicanacional` (rama `main`). Si el repositorio tiene otro nombre, cámbialo en `admin/config.yml` → `backend.repo`.

## Secciones
Nacional, Política, Economía, Seguridad, Estados, CDMX, Internacional, Deportes, Entretenimiento y Tecnología.
Las claves (para los archivos) son: `nacional`, `politica`, `economia`, `seguridad`, `estados`, `cdmx`, `internacional`, `deportes`, `entretenimiento`, `tecnologia`.

## Publicación automática
Una tarea programada puede agregar notas y actualizar los datos del día siguiendo `AUTOMATIZACION.md`.

## Estructura
- `content/notas/*.json` — una nota por archivo
- `content/hoy.json` — El dato e indicadores de la columna lateral
- `scripts/build.mjs` — junta todo en `assets/datos.js` (Netlify lo ejecuta en cada publicación)
- `scripts/paginas.mjs` — en el mismo build genera una página HTML estática por nota en `/notas/<slug>/` (slug tomado del titular), `sitemap.xml` y `_redirects` (301 de `nota.html?id=…` a la URL nueva). Esos archivos no se versionan.
- Campo `"patrocinado": true` en una nota — muestra la etiqueta «Contenido patrocinado» y marca sus enlaces con `rel="sponsored noopener"`.
- `assets/imagenes.js` — fotos de archivo (Wikimedia Commons) e imágenes de marca por tema
- `assets/logo.webp`, `assets/logo-blanco.webp` — logotipo para fondo claro y oscuro
- `img/marca/` — piezas de identidad (portada, Última hora, estudio)
- `admin/` — panel de publicación
- `img/subidas/` — fotos que subes desde el panel

## Netlify
- Comando de build: `node scripts/build.mjs` · Carpeta publicada: `.` (ya está en `netlify.toml`).
- Dominio: `cronicanacional.org` (y `www.cronicanacional.org` redirige al dominio principal).

## Lo que publicas desde /admin no gasta créditos de Netlify
Netlify cobra 15 créditos por cada publicación del sitio. Para que lo que subes desde el panel no cueste:
- `scripts/omitir-build.sh` le dice a Netlify que **no** publique cuando el cambio viene del panel (notas nuevas, ediciones, borrados, fotos o datos del día).
- `assets/en-vivo.js` hace que el sitio lea esos cambios directo de GitHub y los muestre de inmediato (la nota abre en `nota.html?id=...`).
- La siguiente publicación automática (o cualquier cambio de diseño) sí publica el sitio completo y la nota recibe su página fija y su lugar en el sitemap.
