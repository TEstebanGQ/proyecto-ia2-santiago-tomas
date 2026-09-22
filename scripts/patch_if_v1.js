const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

function patchIfV1(nodes) {
  let modified = false;
  for (const n of nodes) {
    if (n.name === '¿Superó Umbral?') {
      n.type = 'n8n-nodes-base.if';
      n.typeVersion = 1;
      n.parameters = {
        conditions: {
          boolean: [
            {
              value1: '={{ $json.ejecutar_llm }}',
              value2: true
            }
          ]
        }
      };
      modified = true;
      console.log('Patched ¿Superó Umbral? to IfV1');
    }
  }
  return modified;
}

db.all('SELECT id, name, nodes FROM workflow_entity', (err, workflows) => {
  if (err) { console.error(err); process.exit(1); }

  for (const wf of workflows) {
    const nodes = JSON.parse(wf.nodes);
    if (patchIfV1(nodes)) {
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
      if (patchIfV1(nodes)) {
        db.run('UPDATE workflow_history SET nodes = ? WHERE versionId = ?', [JSON.stringify(nodes), h.versionId], (upErr) => {
          if (upErr) console.error('Error updating workflow_history:', upErr);
          else console.log(`Updated workflow_history for version ${h.versionId}`);
        });
      }
    }

    setTimeout(() => {
      console.log('Finished updating to IfV1 in SQLite!');
      process.exit(0);
    }, 1000);
  });
});
