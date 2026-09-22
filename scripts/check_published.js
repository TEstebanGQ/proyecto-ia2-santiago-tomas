const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

db.all("SELECT * FROM workflow_published_version", (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('workflow_published_version count:', rows ? rows.length : 0);
    if (rows && rows.length > 0) {
      console.log('Columns:', Object.keys(rows[0]));
      for (const r of rows) {
        console.log('Workflow ID:', r.workflowId, 'Version ID:', r.versionId);
      }
    }
  }
});

db.all("SELECT workflowId, versionId, nodes FROM workflow_history LIMIT 5", (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('workflow_history count:', rows ? rows.length : 0);
  }
});
