// Agrega a assets/datos.js los datos que usa assets/en-vivo.js:
// repositorio, rama, commit con el que se publicó el sitio, secciones válidas y autor por defecto.
// Con eso el sitio muestra lo que se publica desde /admin sin esperar otra publicación de Netlify.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

export function agregarVivo(RAIZ) {
  const cfg = fs.readFileSync(path.join(RAIZ, "admin/config.yml"), "utf8");
  const repo = (cfg.match(/^\s*repo:\s*["']?([\w.-]+\/[\w.-]+)/m) || [])[1] || "";
  const rama = (cfg.match(/^\s*branch:\s*["']?([\w.\/-]+)/m) || [])[1] || "main";
  let commit = process.env.COMMIT_REF || "";
  if (!commit) {
    try { commit = execSync("git rev-parse HEAD", { cwd: RAIZ, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); }
    catch (e) { commit = ""; }
  }
  const build = fs.readFileSync(path.join(RAIZ, "scripts/build.mjs"), "utf8");
  let secciones = [];
  const lista = build.match(/const SECCIONES = \[([^\]]*)\]/);
  const cats = build.match(/const CATS = \{([^}]*)\}/);
  if (lista) secciones = [...lista[1].matchAll(/"([^"]+)"/g)].map(m => m[1]);
  else if (cats) secciones = [...cats[1].matchAll(/(\w+):\s*"/g)].map(m => m[1]);
  const autor = (build.match(/a: o\.autor \|\| "([^"]*)"/) || [])[1] || "Redacción";
  const vivo = { repo, rama, commit, secciones, autor };
  fs.appendFileSync(path.join(RAIZ, "assets/datos.js"), "window.VIVO=" + JSON.stringify(vivo) + ";\n");
  versionar(RAIZ);
}

// Le pone ?v=<huella> a datos.js, app.js y en-vivo.js en todas las páginas, para que el
// navegador descargue la versión nueva en cada publicación y nunca use una copia vieja guardada.
export function versionar(RAIZ) {
  const huella = f => { try { return crypto.createHash("sha1").update(fs.readFileSync(path.join(RAIZ, "assets", f))).digest("hex").slice(0, 10); } catch (e) { return ""; } };
  const v = { "datos.js": huella("datos.js"), "app.js": huella("app.js"), "en-vivo.js": huella("en-vivo.js") };
  const patron = /(assets\/(datos\.js|app\.js|en-vivo\.js))(\?v=[^"']*)?(["'])/g;
  const omitir = new Set([".git", "node_modules", "admin", "img", "content", "scripts", "netlify"]);
  let paginas = 0;
  const recorrer = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) { if (!omitir.has(e.name)) recorrer(path.join(dir, e.name)); continue; }
      if (!e.name.endsWith(".html")) continue;
      const f = path.join(dir, e.name), s = fs.readFileSync(f, "utf8");
      const s2 = s.replace(patron, (m, ruta, archivo, _v, comilla) => v[archivo] ? `${ruta}?v=${v[archivo]}${comilla}` : m);
      if (s2 !== s) { fs.writeFileSync(f, s2); paginas++; }
    }
  };
  recorrer(RAIZ);
  console.log(`Versión de scripts en ${paginas} páginas (datos ${v["datos.js"]}).`);
}
