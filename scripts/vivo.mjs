// Agrega a assets/datos.js los datos que usa assets/en-vivo.js:
// repositorio, rama, commit con el que se publicó el sitio, secciones válidas y autor por defecto.
// Con eso el sitio muestra lo que se publica desde /admin sin esperar otra publicación de Netlify.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

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
}
