// Junta las notas de content/notas/*.json y los datos de content/hoy.json
// en assets/datos.js, que lee el sitio. Netlify lo ejecuta en cada publicación.
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const CARPETA = path.join(RAIZ, "content/notas");
const SECCIONES = ["nacional","politica","economia","seguridad","estados","cdmx","internacional","deportes","entretenimiento","tecnologia"];
const MAX_NOTAS = 600; // las más recientes que se publican

const errores = [];
const notas = [];
for (const archivo of fs.readdirSync(CARPETA).filter(f => f.endsWith(".json"))) {
  let o;
  try { o = JSON.parse(fs.readFileSync(path.join(CARPETA, archivo), "utf8")); }
  catch (e) { errores.push(`${archivo}: JSON inválido (${e.message})`); continue; }
  const id = archivo.replace(/\.json$/, "");
  if (!o.titulo) errores.push(`${archivo}: falta "titulo"`);
  if (!SECCIONES.includes(o.seccion)) errores.push(`${archivo}: sección "${o.seccion}" no existe`);
  if (!/^\d{4}-\d{2}-\d{2}/.test(o.fecha || "")) errores.push(`${archivo}: fecha inválida`);
  if (o.borrador) continue;
  notas.push({
    id,
    t: String(o.titulo || "").trim(),
    c: o.seccion,
    f: String(o.fecha || "").replace(" ", "T").slice(0, 16),
    r: String(o.resumen || "").trim(),
    b: String(o.cuerpo || "").trim(),
    img: o.imagen_tema || "",
    foto: o.imagen || "",
    cred: o.credito || "",
    src: (o.fuentes || []).filter(s => s && s.enlace).map(s => [s.medio || s.enlace, s.enlace]),
    dest: !!o.destacada,
    a: o.autor || "Redacción"
  });
}
if (errores.length) {
  console.error("Errores en las notas:\n- " + errores.join("\n- "));
  process.exit(1);
}
notas.sort((a, b) => (a.f < b.f ? 1 : a.f > b.f ? -1 : 0));
const hoy = JSON.parse(fs.readFileSync(path.join(RAIZ, "content/hoy.json"), "utf8"));
const salida = "/* Generado por scripts/build.mjs — no editar a mano. */\n" +
  "window.NOTAS=" + JSON.stringify(notas.slice(0, MAX_NOTAS)) + ";\n" +
  "window.HOY=" + JSON.stringify(hoy) + ";\n";
fs.writeFileSync(path.join(RAIZ, "assets/datos.js"), salida);
console.log(`Listo: ${Math.min(notas.length, MAX_NOTAS)} notas publicadas.`);
