# Publicación automática — instrucciones para la tarea programada

Esta tarea corre dos veces al día (mañana y tarde, hora del centro de México) y publica en cronicanacional.net.

## 1. Buscar las noticias
- Busca en la web las noticias más importantes de las últimas 12 horas en México y en el mundo.
- Prioridad: Nacional > Política > Economía > Seguridad > Estados > CDMX > Internacional > Deportes > Entretenimiento > Tecnología.
- Revisa resúmenes de portadas (Uno TV "Las de hoy", Infobae México, Milenio, El Universal, La Jornada, Reforma, Excélsior, El Financiero, El Economista, Expansión, Proceso, Animal Político) y abre las notas para confirmar los datos.
- Antes de escribir, lee los títulos de `content/notas/` de los últimos 2 días y **no repitas** una nota que ya existe. Si un tema avanzó, escribe una nota nueva con el dato nuevo.

## 2. Escribir 20 notas
Crea **exactamente 20** archivos nuevos en `content/notas/`, uno por nota, con nombre `AAAA-MM-DD-titular-en-minusculas-con-guiones.json` (máximo 70 caracteres después de la fecha) y este formato:

```json
{
  "titulo": "Titular claro, en tus palabras",
  "seccion": "nacional",
  "fecha": "2026-10-21T06:20",
  "resumen": "Dos o tres frases con los hechos: qué pasó, dónde, cifras y quién lo dijo.",
  "cuerpo": "",
  "imagen_tema": "palacio",
  "imagen": "",
  "credito": "",
  "fuentes": [{ "medio": "Infobae", "enlace": "https://..." }],
  "destacada": false,
  "autor": "Redacción"
}
```

Reglas:
- `seccion`: nacional, politica, economia, seguridad, estados, cdmx, internacional, deportes, entretenimiento o tecnologia. Reparte las 20 notas: al menos 4 de `nacional` o `politica`, 3 de `economia`, 2 de `seguridad` y 2 de `estados`.
- `fecha`: la hora de la ejecución en el centro de México. Usa minutos distintos para conservar el orden de importancia (la más importante con la hora más reciente).
- Marca `"destacada": true` en las 4 más importantes (de alcance nacional, no locales).
- `imagen_tema`: una de las claves de `assets/imagenes.js` que corresponda al tema (lugar o asunto). Si ninguna encaja, usa `palacio` para temas del país, `zocalo` para la capital o `ultimahora` para noticias de último momento.
- **Redacta todo con tus propias palabras.** No copies frases de los medios; como máximo, una cita breve (menos de 15 palabras) entre comillas si la frase exacta importa.
- **No inventes datos.** Cada cifra, nombre o fecha debe estar en la fuente enlazada. Si una fuente solo da el titular, escribe una nota breve con eso.
- Cada nota lleva al menos una fuente con su enlace real.
- Temas delicados (violencia, salud, política): tono neutral, sin adjetivos ni opiniones.

## 3. Actualizar los datos del día
Edita `content/hoy.json` (mismo formato que ya tiene):
- `fecha` ("Miércoles 21 de octubre de 2026") y `actualizado` (hora, por ejemplo "18:25 h").
- `dato`: una cifra oficial reciente y relevante (INEGI, Banxico, SESNSP, Coneval, IMSS…), con texto corto, fuente y enlace al documento oficial. Cámbialo solo si hay un dato nuevo y mejor.
- `indicadores`: tipo de cambio de cierre, petróleo y otros dos datos económicos del día. Cada uno con `tendencia` (sube, baja o igual) y, si existe, `nota` con el nombre del archivo (sin `.json`) de la nota que lo explica.
Si no encuentras un dato, deja el anterior y no lo inventes.

## 4. Revisar y publicar
1. Ejecuta `node scripts/build.mjs`. Si marca errores, corrígelos.
2. Confirma que hay 20 archivos nuevos y que ninguno repite una nota anterior.
3. Haz commit en `main` con el mensaje `Noticias del AAAA-MM-DD (mañana|tarde)` y push. Netlify publica solo.
4. Envía al usuario un mensaje corto: cuántas notas se publicaron, los 4 titulares destacados y cualquier problema.
