const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

const API_KEY = process.env.OPENROUTER_API_KEY || '';

function patchNodes(nodes) {
  let modified = false;
  for (const n of nodes) {
    if (n.parameters && n.parameters.headerParameters && Array.isArray(n.parameters.headerParameters.parameters)) {
      for (const h of n.parameters.headerParameters.parameters) {
        if (h.name === 'Authorization') {
          console.log(`  Updating node "${n.name}": was "${h.value}"`);
          h.value = 'Bearer ' + API_KEY;
          modified = true;
        }
      }
    }
  }
  return modified;
}

db.all('SELECT id, name, nodes FROM workflow_entity', (err, workflows) => {
  if (err) { console.error(err); process.exit(1); }

  console.log(`Found ${workflows.length} workflows in workflow_entity.`);
  for (const wf of workflows) {
    const nodes = JSON.parse(wf.nodes);
    if (patchNodes(nodes)) {
      db.run('UPDATE workflow_entity SET nodes = ? WHERE id = ?', [JSON.stringify(nodes), wf.id], (upErr) => {
        if (upErr) console.error('Error updating workflow_entity:', upErr);
        else console.log(`Updated workflow_entity for "${wf.name}" (${wf.id})`);
      });
    }
  }

  db.all('SELECT versionId, workflowId, nodes FROM workflow_history', (errH, histories) => {
    if (errH) { console.error(errH); process.exit(1); }

    console.log(`Found ${histories.length} entries in workflow_history.`);
    for (const h of histories) {
      const nodes = JSON.parse(h.nodes);
      if (patchNodes(nodes)) {
        db.run('UPDATE workflow_history SET nodes = ? WHERE versionId = ?', [JSON.stringify(nodes), h.versionId], (upErr) => {
          if (upErr) console.error('Error updating workflow_history:', upErr);
          else console.log(`Updated workflow_history for version ${h.versionId}`);
        });
      }
    }

    setTimeout(() => {
      console.log('Finished updating both workflow_entity and workflow_history!');
      process.exit(0);
    }, 1000);
  });
});
