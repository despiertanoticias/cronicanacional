# Crónica Nacional · cronicanacional.net

Periodismo en tiempo real. Sitio estático (HTML, CSS y JavaScript sin dependencias) publicado en Netlify.

## Cómo publicar una nota (panel)
1. Entra a **https://cronicanacional.net/admin**.
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
- `assets/imagenes.js` — fotos de archivo (Wikimedia Commons) e imágenes de marca por tema
- `assets/logo.webp`, `assets/logo-blanco.webp` — logotipo para fondo claro y oscuro
- `img/marca/` — piezas de identidad (portada, Última hora, estudio)
- `admin/` — panel de publicación
- `img/subidas/` — fotos que subes desde el panel

## Netlify
- Comando de build: `node scripts/build.mjs` · Carpeta publicada: `.` (ya está en `netlify.toml`).
- Dominio: `cronicanacional.net` (y `www.cronicanacional.net` redirige al dominio principal).
