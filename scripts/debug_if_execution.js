const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

db.get('SELECT * FROM execution_data ORDER BY executionId DESC LIMIT 1', (err, row) => {
  if (err || !row) return;
  const raw = JSON.parse(row.data);
  // Find where node name is ¿Superó Umbral?
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '¿Superó Umbral?') {
      console.log('¿Superó Umbral? found at index', i);
    }
  }
  // Let's print runData node names
  const runDataKey = raw[2] && raw[2].runData;
  if (runDataKey && raw[runDataKey]) {
    console.log('Nodes executed in runData:', Object.keys(raw[runDataKey]));
  }
});
