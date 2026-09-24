const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6KGoZhNET7DhIu1Gukifs_KgZDOxZgk_C-F0XCQ5vUbkA';

function updateWorkflowNodes(nodes) {
  let modified = false;

  for (const n of nodes) {
    // 1. Nodo Validar Consulta: extraer umbral dinámico de Spring Boot
    if (n.name === 'Validar Consulta') {
      n.parameters.jsCode = `const body = $json.body || $json;
const idConsulta = body.id_consulta || body.idConsulta;
const pregunta = (body.pregunta || '').trim();
const nivel = body.nivel_experiencia || body.nivelExperiencia || 'No especificado';
const area = body.area_interes || body.areaInteres || 'General';
const cursosPrevios = body.cursos_previos || body.cursosPrevios || [];
const contextoPrevio = body.contexto_previo || body.contextoPrevio || '';
const umbral = (body.umbral !== undefined && body.umbral !== null) ? Number(body.umbral) : 0.40;

if (!pregunta) {
  throw new Error('La pregunta no puede estar vacía');
}

const queryEmbedding = cursosPrevios.length > 0 
  ? \`\${pregunta} (\${cursosPrevios.slice(-2).join(', ')})\`
  : pregunta;

return {
  json: {
    id_consulta: idConsulta,
    pregunta: pregunta,
    pregunta_embedding: queryEmbedding,
    nivel_experiencia: nivel,
    area_interes: area,
    cursos_previos: cursosPrevios,
    contexto_previo: contextoPrevio,
    umbral: umbral
  }
};`;
      modified = true;
      console.log('  -> Updated "Validar Consulta" to parse dynamic umbral');
    }

    // 2. Nodo Evaluar Umbral y Contexto RAG: usar umbral dinámico
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

const inputData = $('Validar Consulta').first().json;
const UMBRAL = (typeof inputData.umbral === 'number' && !isNaN(inputData.umbral))
  ? inputData.umbral
  : 0.40;

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
    const duracion = payload.duracion_horas || payload.duracionHoras || 40;
    cursosFuentes.push({
      id: cursoId,
      nombre: payload.nombre,
      categoria: payload.categoria,
      nivel: payload.nivel,
      descripcion: payload.descripcion || '',
      duracionHoras: duracion,
      duracion_horas: duracion,
      similitud: Math.round(score * 1000) / 1000
    });
    contextoPartes.push(
      \`- \${payload.nombre} (ID: \${cursoId}, Categoría: \${payload.categoria}, Nivel: \${payload.nivel}, \${duracion}h): \${payload.descripcion}\`
    );
  }
}

if (cursosFuentes.length > 0) {
  return [{
    json: {
      ejecutar_llm: true,
      supera_umbral: true,
      top_score: topScore,
      umbral_aplicado: UMBRAL,
      id_consulta: inputData.id_consulta,
      pregunta: inputData.pregunta,
      nivel_experiencia: inputData.nivel_experiencia,
      area_interes: inputData.area_interes,
      cursos_previos: inputData.cursos_previos || [],
      contexto_previo: inputData.contexto_previo || '',
      contexto: contextoPartes.join('\\n\\n'),
      fuentes: cursosFuentes,
      similitudes: cursosFuentes.map(c => c.similitud)
    }
  }];
} else {
  return [{
    json: {
      ejecutar_llm: false,
      supera_umbral: false,
      top_score: topScore,
      umbral_aplicado: UMBRAL,
      id_consulta: inputData.id_consulta,
      pregunta: inputData.pregunta,
      respuesta: 'No encontramos cursos en nuestro catálogo institucional que coincidan con tu búsqueda ("' + inputData.pregunta + '") con el umbral de similitud actual (' + Math.round(UMBRAL * 100) + '%). Te invitamos a consultar el catálogo completo de tecnología.',
      contexto: '',
      fuentes: [],
      similitudes: [],
      estado_final: 'Sin resultados'
    }
  }];
}`;
      modified = true;
      console.log('  -> Updated "Evaluar Umbral y Contexto RAG" with dynamic umbral');
    }

    // 3. Modificar nodo "Generar Recomendacion LLM" para usar Google Gemini directo
    if (n.name === 'Generar Recomendacion LLM') {
      n.parameters = {
        method: 'POST',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: 'Content-Type',
              value: 'application/json'
            }
          ]
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={{\n  JSON.stringify({\n    contents: [\n      {\n        role: "user",\n        parts: [\n          {\n            text: "Eres RutaIA, asesor vocacional y académico inteligente de la institución. Tu misión es orientar al estudiante recomendándole los cursos provistos en el CONTEXTO DEL CATÁLOGO.\\n\\n" +\n              "Instrucciones:\\n" +\n              "1. Recomienda el o los cursos más pertinentes del catálogo que mejor puedan orientar al estudiante, mencionando su NOMBRE EXACTO, nivel y duración en horas, explicando por qué le convienen.\\n" +\n              "2. Si la consulta del estudiante trata sobre una disciplina que no es directamente informática (por ejemplo: pilotaje de aeronaves, cocina, etc.), oriéntalo amablemente explicándole cómo los cursos de tecnología disponibles en nuestro catálogo institucional (como sistemas embebidos, IoT, automatización, cloud o programación) son relevantes o pueden servirle como puente formativo tecnológico hacia esa área.\\n" +\n              "3. En consultas de seguimiento (por ejemplo 'Y también quiero aprender bases de datos' o 'Cuáles hay de docker'), prioriza responder con exactitud a la nueva necesidad planteada y cómo se complementa con los cursos explorados anteriormente.\\n\\n" +\n              "Perfil del Estudiante:\\n- Nivel: " + ($json.nivel_experiencia || 'Principiante') + "\\n- Área de interés: " + ($json.area_interes || 'General') +\n              ($json.cursos_previos && $json.cursos_previos.length > 0 ? "\\n- Cursos previos explorados: " + $json.cursos_previos.join(', ') : "") +\n              ($json.contexto_previo ? "\\n- Contexto conversacional: " + $json.contexto_previo : "") +\n              "\\n\\nPregunta del Estudiante: \\"" + ($json.pregunta || '') + "\\"\\n\\n" +\n              "CONTEXTO DEL CATÁLOGO (Cursos disponibles recuperados según el umbral institucional):\\n" + ($json.contexto || '') +\n              "\\n\\nGenera la orientación para el estudiante:"\n          }\n        ]\n      }\n    ],\n    generationConfig: {\n      temperature: 0.2,\n      maxOutputTokens: 2048\n    }\n  })\n}}`,
        options: {}
      };
      n.continueOnFail = true;
      modified = true;
      console.log('  -> Updated "Generar Recomendacion LLM" to Gemini 2.5 Flash API');
    }

    // 4. Modificar nodo "Formatear Respuesta Respondida" para respetar el umbral
    if (n.name === 'Formatear Respuesta Respondida') {
      n.parameters.jsCode = `const parts = ($json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts) || [];
let llmChoice = '';
if (Array.isArray(parts) && parts.length > 0) {
  llmChoice = parts.filter(p => p && p.text).map(p => p.text).join('\\n').trim();
} else if ($json.choices && $json.choices[0] && $json.choices[0].message) {
  llmChoice = ($json.choices[0].message.content || '').trim();
}
const evaluacion = $('Evaluar Umbral y Contexto RAG').first().json;

let respuestaFinal = (llmChoice || '').trim();
let fuentes = [...(evaluacion.fuentes || [])];
let estadoFinal = evaluacion.supera_umbral ? 'Respondida' : 'Sin resultados';

if (!respuestaFinal) {
  const topCurso = fuentes[0];
  if (topCurso) {
    const dur = topCurso.duracionHoras || topCurso.duracion_horas || 40;
    respuestaFinal = "¡Hola! Con base en tu consulta \\"" + evaluacion.pregunta + "\\", te recomendamos el curso \\"" + topCurso.nombre + "\\" (Nivel: " + topCurso.nivel + ", Duración: " + dur + " horas), el cual se ajusta a tus objetivos formativos según nuestro catálogo institucional.";
  } else {
    respuestaFinal = 'No encontramos cursos que coincidan con tu búsqueda en nuestro catálogo institucional.';
    estadoFinal = 'Sin resultados';
  }
}

// Reordenar fuentes si el LLM eligió un curso preferido en su respuesta
if (fuentes.length > 1) {
  const lowerResp = respuestaFinal.toLowerCase();
  let bestIndex = -1;
  let bestPos = Infinity;

  const recoMatch = lowerResp.search(/(te recomiendo|recomendamos|te sugiero|sugerimos|curso:|inscribirte en el curso|siguiente curso)/i);
  const searchSection = recoMatch >= 0 ? lowerResp.slice(recoMatch) : lowerResp;

  fuentes.forEach((f, idx) => {
    const pos = searchSection.indexOf(f.nombre.toLowerCase());
    if (pos >= 0 && pos < bestPos) {
      bestPos = pos;
      bestIndex = idx;
    }
  });

  if (bestIndex > 0) {
    const chosen = fuentes.splice(bestIndex, 1)[0];
    fuentes.unshift(chosen);
  }
}

return {
  json: {
    id_consulta: evaluacion.id_consulta,
    pregunta: evaluacion.pregunta,
    respuesta: respuestaFinal,
    fuentes: fuentes,
    similitudes: fuentes.map(f => f.similitud),
    estado_final: estadoFinal
  }
};`;
      modified = true;
      console.log('  -> Updated "Formatear Respuesta Respondida" to respect dynamic threshold');
    }
  }

  return modified;
}

db.all('SELECT id, name, nodes FROM workflow_entity', (err, workflows) => {
  if (err) { console.error('Error fetching workflows:', err); process.exit(1); }

  console.log(`Processing ${workflows.length} workflows in workflow_entity...`);
  for (const wf of workflows) {
    const nodes = JSON.parse(wf.nodes);
    if (updateWorkflowNodes(nodes)) {
      db.run('UPDATE workflow_entity SET nodes = ? WHERE id = ?', [JSON.stringify(nodes), wf.id], (upErr) => {
        if (upErr) console.error('Error updating workflow_entity:', upErr);
        else console.log(`✓ Successfully updated workflow_entity for "${wf.name}" (${wf.id})`);
      });
    }
  }

  db.all('SELECT versionId, workflowId, nodes FROM workflow_history', (errH, histories) => {
    if (errH) { console.error(errH); process.exit(1); }

    console.log(`Processing ${histories.length} entries in workflow_history...`);
    for (const h of histories) {
      const nodes = JSON.parse(h.nodes);
      if (updateWorkflowNodes(nodes)) {
        db.run('UPDATE workflow_history SET nodes = ? WHERE versionId = ?', [JSON.stringify(nodes), h.versionId], (upErr) => {
          if (upErr) console.error('Error updating workflow_history:', upErr);
        });
      }
    }

    setTimeout(() => {
      console.log('WORKFLOW UPDATED WITH DYNAMIC THRESHOLD SUCCESSFULLY!');
      process.exit(0);
    }, 1500);
  });
});
