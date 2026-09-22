const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

db.get('SELECT * FROM execution_data ORDER BY executionId DESC LIMIT 1', (err, row) => {
  if (err || !row) { console.error(err); return; }
  const raw = JSON.parse(row.data);
  // Find runData
  for (let i = 0; i < raw.length; i++) {
    const s = JSON.stringify(raw[i]);
    if (s && s.includes('Buscar en Qdrant')) {
      console.log('Index', i, 'mentions Buscar en Qdrant:', s.slice(0, 200));
    }
    if (s && s.includes('result') && s.includes('score')) {
      console.log('Found score in index', i, s.slice(0, 200));
    }
  }
});
