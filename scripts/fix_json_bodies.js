const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

function patchJsonBodies(nodes) {
  let modified = false;
  for (const n of nodes) {
    if (n.name === 'Generar Embedding Pregunta') {
      n.parameters.jsonBody = `={{
  JSON.stringify({
    model: "openai/text-embedding-3-small",
    input: $json.pregunta
  })
}}`;
      modified = true;
      console.log('Patched Generar Embedding Pregunta jsonBody');
    }

    if (n.name === 'Generar Recomendacion LLM') {
      n.parameters.jsonBody = `={{
  JSON.stringify({
    model: "google/gemini-3.5-flash",
    max_tokens: 1000,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "Eres RutaIA, el asesor vocacional y académico inteligente de la institución. Tu misión es orientar al estudiante recomendándole exclusivamente los cursos provistos en el CONTEXTO DEL CATÁLOGO. Reglas estrictas:\\n1. Basa tus recomendaciones ÚNICAMENTE en los cursos listados en el contexto.\\n2. NO inventes nombres de cursos, códigos, duraciones ni contenidos que no estén en el contexto.\\n3. Si los cursos del contexto no son suficientes para cubrir la pregunta del estudiante, reconócelo explícitamente.\\n4. Presenta una recomendación motivadora, estructurada y profesional, explicando cómo cada curso seleccionado se articula con la necesidad del estudiante.\\n5. Menciona de forma destacada el nombre exacto de cada curso recomendado."
      },
      {
        role: "user",
        content: \`Perfil del Estudiante:
- Nivel: \${$json.nivel_experiencia || 'Principiante'}
- Área de interés: \${$json.area_interes || 'General'}

Pregunta del Estudiante:
"\${$json.pregunta}"

CONTEXTO DEL CATÁLOGO INSTITUCIONAL (Cursos recuperados por relevancia semántica):
\${$json.contexto}

Por favor genera la recomendación fundamentada para el estudiante:\`
      }
    ]
  })
}}`;
      modified = true;
      console.log('Patched Generar Recomendacion LLM jsonBody');
    }
  }
  return modified;
}

db.all('SELECT id, name, nodes FROM workflow_entity', (err, workflows) => {
  if (err) { console.error(err); process.exit(1); }

  for (const wf of workflows) {
    const nodes = JSON.parse(wf.nodes);
    if (patchJsonBodies(nodes)) {
      db.run('UPDATE workflow_entity SET nodes = ? WHERE id = ?', [JSON.stringify(nodes), wf.id], (upErr) => {
        if (upErr) console.error('Error updating workflow_entity:', upErr);
        else console.log(`Updated workflow_entity for "${wf.name}"`);
      });
    }
  }

  db.all('SELECT versionId, workflowId, nodes FROM workflow_history', (errH, histories) => {
    if (errH) { console.error(errH); process.exit(1); }

    for (const h of histories) {
      const nodes = JSON.parse(h.nodes);
      if (patchJsonBodies(nodes)) {
        db.run('UPDATE workflow_history SET nodes = ? WHERE versionId = ?', [JSON.stringify(nodes), h.versionId], (upErr) => {
          if (upErr) console.error('Error updating workflow_history:', upErr);
          else console.log(`Updated workflow_history for version ${h.versionId}`);
        });
      }
    }

    setTimeout(() => {
      console.log('Finished updating jsonBodies in SQLite!');
      process.exit(0);
    }, 1000);
  });
});
