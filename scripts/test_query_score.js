async function testQuery() {
  const query = 'quierO APRENDER DE UN LENGUAJE DE PROGRAMCION APENAS ESTOY EMPEZANDO';
  
  const embRes = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/text-embedding-3-small',
      input: query
    })
  });
  const embData = await embRes.json();
  if (!embData.data) {
    console.error('Error embeddings:', embData);
    return;
  }
  const vector = embData.data[0].embedding;
  
  const qPort = process.env.QDRANT_PORT || '6335';
  const qRes = await fetch(`http://localhost:${qPort}/collections/cursos_academicos/points/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vector: vector,
      limit: 5,
      with_payload: true
    })
  });
  const qData = await qRes.json();
  console.log('Top 5 en Qdrant para: \"' + query + '\"');
  qData.result.forEach((p, idx) => {
    console.log((idx + 1) + '. Score: ' + (p.score * 100).toFixed(1) + '% | ID ' + p.payload.curso_id + ' | ' + p.payload.nombre + ' (' + p.payload.nivel + ')');
  });
}
testQuery().catch(console.error);
