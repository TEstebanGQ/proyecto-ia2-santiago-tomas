const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

db.get('SELECT * FROM execution_data ORDER BY executionId DESC LIMIT 1', (err, row) => {
  if (err || !row) {
    console.error('No execution found', err);
    return;
  }
  console.log('Execution ID:', row.executionId);
  try {
    const raw = JSON.parse(row.data);
    // n8n stores flatted data
    // Let's search for "message" or "error" or node names in raw
    console.log('Raw data length:', Array.isArray(raw) ? raw.length : Object.keys(raw).length);
    for (let i = 0; i < Math.min(raw.length, 30); i++) {
      const item = raw[i];
      if (typeof item === 'object' && item !== null) {
        if (item.error || item.message || item.lastNodeExecuted) {
          console.log(`[${i}] Object:`, item);
        }
      } else if (typeof item === 'string' && (item.includes('Error') || item.includes('failed') || item.includes('401') || item.includes('400') || item.includes('500'))) {
        console.log(`[${i}] String:`, item.slice(0, 200));
      }
    }
  } catch (e) {
    console.error('Parse error:', e);
  }
});
