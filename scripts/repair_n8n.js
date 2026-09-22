const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

const API_KEY = process.env.OPENROUTER_API_KEY || '';

function fixNodes(nodes) {
  let changed = false;
  for (const n of nodes) {
    // 1. Fix Authorization Header with raw API_KEY
    if (n.parameters && n.parameters.headerParameters && Array.isArray(n.parameters.headerParameters.parameters)) {
      for (const h of n.parameters.headerParameters.parameters) {
        if (h.name === 'Authorization') {
          h.value = 'Bearer ' + API_KEY;
          changed = true;
        }
      }
    }

    // 2. Fix LLM Model to google/gemini-3.5-flash with max_tokens 120 and continueOnFail
    if (n.name === 'Generar Recomendacion LLM') {
      n.continueOnFail = true;
      n.parameters.jsonBody = `={
  "model": "google/gemini-3.5-flash",
  "max_tokens": 120,
  "messages": [
    {
      "role": "system",
      "content": "Eres RutaIA, asesor académico. Recomienda los cursos disponibles en el contexto. Sé conciso y claro (máximo 2 párrafos breves)."
    },
    {
      "role": "user",
      "content": {{ JSON.stringify("Pregunta: " + $json.pregunta + "\\n\\nCursos:\\n" + $json.contexto) }}
    }
  ]
}`;
      changed = true;
    }

    // 3. Fix Embedding nodes with proper JSON stringify
    if (n.name === 'Generar Embedding Pregunta') {
      n.parameters.jsonBody = `={
  "model": "openai/text-embedding-3-small",
  "input": {{ JSON.stringify($json.pregunta) }}
}`;
      changed = true;
    }

    if (n.name === 'Generar Embedding Curso') {
      n.parameters.jsonBody = `={
  "model": "openai/text-embedding-3-small",
  "input": {{ JSON.stringify($json.textoEmbed) }}
}`;
      changed = true;
    }

    // 4. Fix Umbral check in Evaluar Umbral
    if (n.name === 'Evaluar Umbral y Contexto RAG') {
      n.parameters.jsCode = `const qdrantItem = $input.first() ? $input.first().json : {};
let points = [];
if (Array.isArray(qdrantItem.result)) {
  points = qdrantItem.result;
} else if (Array.isArray(qdrantItem)) {
  points = qdrantItem;
} else if (qdrantItem.score !== undefined) {
  points = $input.all().map(i => i.json);
}

const UMBRAL = 0.40;
let topScore = 0;
let contextoPartes = [];
let cursosFuentes = [];

for (const p of points) {
  const score = p.score || 0;
  if (score > topScore) {
    topScore = score;
  }
  if (score >= UMBRAL) {
    const payload = p.payload || {};
    const cursoId = payload.curso_id || payload.id || p.id;
    cursosFuentes.push({
      id: cursoId,
      nombre: payload.nombre,
      categoria: payload.categoria,
      nivel: payload.nivel,
      duracionHoras: payload.duracion_horas || payload.duracionHoras,
      duracion_horas: payload.duracion_horas || payload.duracionHoras,
      similitud: Math.round(score * 1000) / 1000
    });
    contextoPartes.push(
      \`- \${payload.nombre} (Categoría: \${payload.categoria}, Nivel: \${payload.nivel}, \${payload.duracionHoras}h): \${payload.descripcion}\`
    );
  }
}

const inputPregunta = $('Validar Consulta').first().json;

if (cursosFuentes.length > 0) {
  return [{
    json: {
      ejecutar_llm: true,
      supera_umbral: true,
      top_score: topScore,
      pregunta: inputPregunta.pregunta,
      contexto: contextoPartes.join('\\n\\n'),
      fuentes: cursosFuentes,
      similitudes: cursosFuentes.map(c => c.similitud),
      id_consulta: inputPregunta.id_consulta
    }
  }];
} else {
  return [{
    json: {
      ejecutar_llm: false,
      supera_umbral: false,
      top_score: topScore,
      pregunta: inputPregunta.pregunta,
      respuesta: 'No se encontraron cursos en el catálogo institucional directamente afines a tu búsqueda (similitud máxima obtenida: ' + (Math.round(topScore * 1000) / 10) + '%). Te sugerimos consultar la oferta de cursos extracurriculares o reformular tu consulta con términos asociados a ingeniería, sistemas o tecnología.',
      contexto: '',
      fuentes: [],
      similitudes: [],
      estado_final: 'Sin resultados',
      id_consulta: inputPregunta.id_consulta
    }
  }];
}`;
      changed = true;
    }

    // 5. Fix Formatear Respuesta Respondida
    if (n.name === 'Formatear Respuesta Respondida') {
      n.parameters.jsCode = `const llmChoice = $json.choices && $json.choices[0] && $json.choices[0].message ? $json.choices[0].message.content : '';
const evaluacion = $('Evaluar Umbral y Contexto RAG').first().json;
const topCurso = (evaluacion.fuentes && evaluacion.fuentes.length > 0) ? evaluacion.fuentes[0] : null;

let respuestaFinal = llmChoice;
if (!respuestaFinal || respuestaFinal.trim() === '') {
  if (topCurso) {
    respuestaFinal = \`¡Hola! Basado en tu consulta "\${evaluacion.pregunta}", te recomendamos inscribirte en el curso "\${topCurso.nombre}" (Nivel: \${topCurso.nivel}, Duración: \${topCurso.duracionHoras} horas), el cual se ajusta a tus objetivos formativos según nuestro catálogo institucional.\`;
  } else {
    respuestaFinal = 'No se pudo generar la recomendación en este momento.';
  }
}

return {
  json: {
    id_consulta: evaluacion.id_consulta,
    pregunta: evaluacion.pregunta,
    respuesta: respuestaFinal,
    fuentes: evaluacion.fuentes,
    similitudes: evaluacion.similitudes,
    estado_final: 'Respondida'
  }
};`;
      changed = true;
    }

    // 6. Fix ¿Superó Umbral? IF node
    if (n.name.includes('Umbral') && n.type.includes('if')) {
      n.type = 'n8n-nodes-base.if';
      n.typeVersion = 1;
      n.parameters = {
        conditions: {
          string: [
            {
              value1: "={{ $json.ejecutar_llm ? 'SI' : 'NO' }}",
              value2: 'SI'
            }
          ]
        }
      };
      changed = true;
    }
  }
  return changed;
}

db.all('SELECT id, name, nodes FROM workflow_entity', (err, rows) => {
  if (err) { console.error('Error fetching workflows:', err); process.exit(1); }
  for (const r of rows) {
    const nodes = JSON.parse(r.nodes);
    if (fixNodes(nodes)) {
      db.run('UPDATE workflow_entity SET nodes = ? WHERE id = ?', [JSON.stringify(nodes), r.id], (upErr) => {
        if (upErr) console.error('Error updating workflow_entity:', upErr);
        else console.log('Successfully updated workflow_entity for', r.name);
      });
    }
  }

  db.all('SELECT versionId, workflowId, nodes FROM workflow_history', (errH, rowsH) => {
    if (errH) { console.error('Error fetching history:', errH); process.exit(1); }
    for (const h of rowsH) {
      const nodes = JSON.parse(h.nodes);
      if (fixNodes(nodes)) {
        db.run('UPDATE workflow_history SET nodes = ? WHERE versionId = ?', [JSON.stringify(nodes), h.versionId]);
      }
    }
    console.log('Updated ' + rowsH.length + ' history records.');

    setTimeout(() => {
      console.log('REPAIR COMPLETED SUCCESSFULLY!');
      process.exit(0);
    }, 1500);
  });
});
