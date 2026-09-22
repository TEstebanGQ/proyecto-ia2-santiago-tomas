const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

function patchThreshold(nodes) {
  let modified = false;
  for (const n of nodes) {
    if (n.name === 'Evaluar Umbral y Contexto RAG') {
      if (n.parameters && n.parameters.jsCode) {
        console.log('Updating UMBRAL in Evaluar Umbral y Contexto RAG...');
        n.parameters.jsCode = n.parameters.jsCode.replace(/const UMBRAL = [0-9.]+;/g, 'const UMBRAL = 0.55;');
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
    if (patchThreshold(nodes)) {
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
      if (patchThreshold(nodes)) {
        db.run('UPDATE workflow_history SET nodes = ? WHERE versionId = ?', [JSON.stringify(nodes), h.versionId], (upErr) => {
          if (upErr) console.error('Error updating workflow_history:', upErr);
          else console.log(`Updated workflow_history for version ${h.versionId}`);
        });
      }
    }

    setTimeout(() => {
      console.log('Finished updating threshold in SQLite!');
      process.exit(0);
    }, 1000);
  });
});
