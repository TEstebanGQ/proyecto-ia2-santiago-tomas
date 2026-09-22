const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

function patchIfNode(nodes) {
  let modified = false;
  for (const n of nodes) {
    if (n.name === '¿Superó Umbral?') {
      n.parameters = {
        conditions: {
          combinator: 'and',
          options: {
            caseSensitive: true,
            leftValue: '',
            typeValidation: 'strict',
            version: 2
          },
          conditions: [
            {
              id: 'cond_ejecutar_llm',
              leftValue: '={{ $json.ejecutar_llm }}',
              rightValue: true,
              operator: {
                type: 'boolean',
                operation: 'true',
                singleValue: true
              }
            }
          ]
        }
      };
      modified = true;
      console.log('Patched ¿Superó Umbral? node');
    }
  }
  return modified;
}

db.all('SELECT id, name, nodes FROM workflow_entity', (err, workflows) => {
  if (err) { console.error(err); process.exit(1); }

  for (const wf of workflows) {
    const nodes = JSON.parse(wf.nodes);
    if (patchIfNode(nodes)) {
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
      if (patchIfNode(nodes)) {
        db.run('UPDATE workflow_history SET nodes = ? WHERE versionId = ?', [JSON.stringify(nodes), h.versionId], (upErr) => {
          if (upErr) console.error('Error updating workflow_history:', upErr);
          else console.log(`Updated workflow_history for version ${h.versionId}`);
        });
      }
    }

    setTimeout(() => {
      console.log('Finished updating If node in SQLite!');
      process.exit(0);
    }, 1000);
  });
});
