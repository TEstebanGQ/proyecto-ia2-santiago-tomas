const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

function patch(nodes) {
  let mod = false;
  for (const n of nodes) {
    if (n.type === 'n8n-nodes-base.if') {
      console.log('Found If node:', n.name);
      n.typeVersion = 2;
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
              id: 'c_llm',
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
      mod = true;
    }
  }
  return mod;
}

db.all('SELECT id, name, nodes FROM workflow_entity', (err, rows) => {
  if (err) throw err;
  for (const r of rows) {
    const nodes = JSON.parse(r.nodes);
    if (patch(nodes)) {
      db.run('UPDATE workflow_entity SET nodes = ? WHERE id = ?', [JSON.stringify(nodes), r.id], (e) => {
        if (e) console.error(e);
        else console.log('Updated workflow_entity', r.name);
      });
    }
  }

  db.all('SELECT versionId, workflowId, nodes FROM workflow_history', (err2, rows2) => {
    if (err2) throw err2;
    for (const r2 of rows2) {
      const nodes = JSON.parse(r2.nodes);
      if (patch(nodes)) {
        db.run('UPDATE workflow_history SET nodes = ? WHERE versionId = ?', [JSON.stringify(nodes), r2.versionId], (e) => {
          if (e) console.error(e);
          else console.log('Updated workflow_history', r2.versionId);
        });
      }
    }
    setTimeout(() => {
      console.log('COMPLETE');
      process.exit(0);
    }, 1000);
  });
});
