#!/usr/bin/env bash
# Netlify lo ejecuta antes de cada publicación (netlify.toml → [build] ignore).
# Salida 0 = NO publicar (no gasta créditos). Salida 1 = publicar normal.
#
# Lo que se publica desde /admin (notas, ediciones, borrados, fotos, datos del día) no necesita
# una publicación nueva: assets/en-vivo.js lo lee directo de GitHub. Solo se omite cuando
# el último commit viene del panel y, desde la última publicación, no cambió nada más que
# content/ o img/subidas/. Las publicaciones automáticas y los cambios de diseño se publican normal.

msg=$(git log -1 --pretty=%s "${COMMIT_REF:-HEAD}" 2>/dev/null)
case "$msg" in
  "Nueva nota:"*|"Edita nota:"*|"Borra nota:"*|"Upload "*|"Delete "*|"Sube "*|"Borra archivo"*|"Create "*|"Update "*) ;;
  *) echo "Publicación normal: $msg"; exit 1 ;;
esac

if [ -z "$CACHED_COMMIT_REF" ] || [ "$CACHED_COMMIT_REF" = "$COMMIT_REF" ] || ! git cat-file -e "$CACHED_COMMIT_REF^{commit}" 2>/dev/null; then
  echo "Sin publicación anterior para comparar: se publica."
  exit 1
fi

if git diff --quiet "$CACHED_COMMIT_REF" "$COMMIT_REF" -- . ':(exclude)content' ':(exclude)img/subidas'; then
  echo "Cambio desde el panel: se ve en el sitio sin publicar (assets/en-vivo.js). Se omite para no gastar créditos."
  exit 0
fi
echo "Hay otros cambios pendientes desde la última publicación: se publica."
exit 1
