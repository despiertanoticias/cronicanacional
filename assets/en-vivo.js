/* Notas en vivo.
   Lo que se publica desde /admin (notas nuevas, ediciones, borrados, fotos y datos del día)
   se guarda en GitHub y Netlify NO vuelve a publicar el sitio por eso (ver scripts/omitir-build.sh),
   así que no gasta créditos. Este script compara la versión con la que se publicó el sitio
   (window.VIVO.commit, lo escribe scripts/vivo.mjs) contra lo último en GitHub y agrega esos
   cambios a la página. Si GitHub no responde, el sitio se ve igual que siempre. */
(function(){
"use strict";
var V=window.VIVO;
if(!V||!V.repo||!V.commit||!window.fetch||!window.Promise)return;
var CLAVE="vivo:"+V.repo, VIGENCIA=3*60*1000;
var BASE_NOTAS=(window.NOTAS||[]).slice(), BASE_HOY=window.HOY;
var RAW="https://raw.githubusercontent.com/"+V.repo+"/";

function leer(){try{var c=JSON.parse(localStorage.getItem(CLAVE)||"null");return c&&c.base===V.commit?c:null}catch(e){return null}}
function guardar(c){try{localStorage.setItem(CLAVE,JSON.stringify(c))}catch(e){}}
function firma(c){return c?JSON.stringify([c.notas,c.hoy]):"[{},null]"}

/* Mismo formato que scripts/build.mjs */
function texto(v){return String(v==null?"":v).trim()}
function fechaCorta(v){return String(v||"").replace(" ","T").slice(0,16)}
function convertir(id,o,subidas,head){
  if(!o||o.borrador||!o.titulo||(V.secciones&&V.secciones.length&&V.secciones.indexOf(o.seccion)<0)||!/^\d{4}-\d{2}-\d{2}/.test(o.fecha||""))return null;
  var foto=o.imagen||"", ruta=foto.replace(/^\//,"");
  if(ruta&&subidas[ruta])foto=RAW+head+"/"+ruta.split("/").map(encodeURIComponent).join("/");
  var n={id:id,t:texto(o.titulo),c:o.seccion,f:fechaCorta(o.fecha),r:texto(o.resumen),b:texto(o.cuerpo),
    img:o.imagen_tema||"",foto:foto,cred:o.credito||"",
    src:(o.fuentes||[]).filter(function(s){return s&&s.enlace}).map(function(s){return [s.medio||s.enlace,s.enlace]}),
    dest:!!o.destacada,a:o.autor||V.autor||"Redacción",vivo:true};
  if(o.patrocinado)n.p=true;
  if(o.modificado)n.m=fechaCorta(o.modificado);
  if(o.actualizado)n.mod=fechaCorta(o.actualizado);
  return n;
}

function aplicar(c){
  var idx={},orden=[];
  BASE_NOTAS.forEach(function(n){idx[n.id]=n;orden.push(n.id)});
  window.HOY=BASE_HOY;
  if(!c){window.NOTAS=BASE_NOTAS.slice();return}
  Object.keys(c.notas||{}).forEach(function(id){
    var n=c.notas[id], prev=idx[id];
    if(!n){delete idx[id];return}
    n=JSON.parse(JSON.stringify(n));
    if(prev){if(prev.s)n.s=prev.s;if(prev.u)n.u=prev.u}
    if(!prev)orden.push(id);
    idx[id]=n;
  });
  var lista=[];orden.forEach(function(id){if(idx[id])lista.push(idx[id])});
  lista.sort(function(a,b){return a.f<b.f?1:a.f>b.f?-1:0});
  window.NOTAS=lista;
  if(c.hoy)window.HOY=c.hoy;
}

function repintar(){
  var s0=document.querySelector('script[src*="assets/app.js"]');if(!s0)return;
  var y=window.pageYOffset||0, s=document.createElement("script");
  s.src=s0.src;s.onload=function(){if(y)window.scrollTo(0,y)};
  document.body.appendChild(s);
}

function pedir(head,ruta){
  return fetch(RAW+head+"/"+ruta.split("/").map(encodeURIComponent).join("/")).then(function(r){if(!r.ok)throw r.status;return r.json()});
}

function revisar(previo){
  fetch("https://api.github.com/repos/"+V.repo+"/compare/"+V.commit+"..."+encodeURIComponent(V.rama||"main"),{headers:{Accept:"application/vnd.github+json"}})
  .then(function(r){if(!r.ok)throw r.status;return r.json()})
  .then(function(d){
    var commits=d.commits||[], head=commits.length?commits[commits.length-1].sha:V.commit;
    if(previo&&previo.head===head){previo.t=Date.now();guardar(previo);return}
    var nuevo={base:V.commit,head:head,t:Date.now(),notas:{},hoy:null}, archivos=d.files||[], subidas={}, pedidos=[];
    archivos.forEach(function(f){if(f.status!=="removed"&&/^img\//.test(f.filename))subidas[f.filename]=1});
    archivos.forEach(function(f){
      var m=/^content\/notas\/([^\/]+)\.json$/.exec(f.filename);
      if(f.previous_filename){var p=/^content\/notas\/([^\/]+)\.json$/.exec(f.previous_filename);if(p)nuevo.notas[p[1]]=null}
      if(m){
        if(f.status==="removed"){nuevo.notas[m[1]]=null;return}
        pedidos.push(pedir(head,f.filename).then(function(o){nuevo.notas[m[1]]=convertir(m[1],o,subidas,head)},function(){delete nuevo.notas[m[1]]}));
      }else if(f.filename==="content/hoy.json"&&f.status!=="removed"){
        pedidos.push(pedir(head,f.filename).then(function(o){nuevo.hoy=o},function(){}));
      }
    });
    return Promise.all(pedidos).then(function(){
      guardar(nuevo);
      if(firma(nuevo)!==firma(previo)){aplicar(nuevo);repintar()}
    });
  })
  .catch(function(){});
}

var cache=leer();
aplicar(cache);
if(!cache||Date.now()-cache.t>VIGENCIA){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){revisar(cache)});
  else revisar(cache);
}
})();
