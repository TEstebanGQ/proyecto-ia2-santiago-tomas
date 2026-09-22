const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

function patchLLM(nodes) {
  let modified = false;
  for (const n of nodes) {
    if (n.name === 'Generar Recomendacion LLM') {
      if (n.parameters && n.parameters.jsonBody) {
        console.log('Found Generar Recomendacion LLM, updating model and max_tokens...');
        // Replace google/gemini-2.0-flash-001 with google/gemini-3.5-flash and add max_tokens
        let body = n.parameters.jsonBody;
        body = body.replace(/\"model\":\s*\"[^\"]+\"/g, '"model": "google/gemini-3.5-flash",\n  "max_tokens": 1000');
        n.parameters.jsonBody = body;
        modified = true;
      }
    }
  }
  return modified;
}

db.all('SELECT id, name, nodes FROM workflow_entity', (err, workflows) => {
  if (err) { console.error(err); process.exit(1); }

  for (const wf of workflows) {
    const nodes = JSON.parse(wf.nodes);
    if (patchLLM(nodes)) {
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
      if (patchLLM(nodes)) {
        db.run('UPDATE workflow_history SET nodes = ? WHERE versionId = ?', [JSON.stringify(nodes), h.versionId], (upErr) => {
          if (upErr) console.error('Error updating workflow_history:', upErr);
          else console.log(`Updated workflow_history for version ${h.versionId}`);
        });
      }
    }

    setTimeout(() => {
      console.log('Finished updating LLM model in SQLite!');
      process.exit(0);
    }, 1000);
  });
});
