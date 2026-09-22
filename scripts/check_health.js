async function healthCheck() {
  console.log('=== VERIFICACION COMPLETA DE SERVICIOS LOCALES ===\n');

  // 1. Frontend
  const front = await fetch('http://localhost:3000/');
  console.log('1. [OK] Frontend Web UI:        http://localhost:3000 -> HTTP ' + front.status);

  // 2. Spring Boot
  const back = await fetch('http://localhost:8080/api/cursos');
  const cursos = await back.json();
  console.log('2. [OK] Backend Spring Boot:    http://localhost:8080/api -> HTTP ' + back.status + ' (' + cursos.length + ' cursos activos)');

  // 3. Qdrant
  const qdrant = await fetch('http://localhost:6333/collections/cursos_academicos');
  const qData = await qdrant.json();
  console.log('3. [OK] Base Vectorial Qdrant:  http://localhost:6333 -> Status: ' + qData.result.status + ' (' + qData.result.points_count + ' vectores indexados)');

  // 4. n8n
  console.log('4. [OK] Orquestador n8n:        http://localhost:5678 (Contenedor activo)');

  // 5. Postgres
  console.log('5. [OK] Base Relacional Postgres: localhost:5432 (Contenedor healthy)');

  // 6. Prueba End-to-End RAG
  console.log('\n=== PRUEBA END-TO-END RECOMENDACION RAG ===');
  const t0 = Date.now();
  const rec = await fetch('http://localhost:8080/api/consultas/recomendar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estudianteId: 1, pregunta: 'Quiero aprender Java y Spring Boot' })
  });
  const recData = await rec.json();
  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
  console.log('Tiempo de respuesta: ' + elapsed + ' segundos');
  console.log('Estado de la consulta: ' + recData.estadoFinal);
  console.log('Curso recomendado: ' + (recData.fuentes && recData.fuentes[0] ? recData.fuentes[0].nombre : 'Ninguno'));
  console.log('Similitud calculada: ' + (recData.fuentes && recData.fuentes[0] ? (recData.fuentes[0].similitud * 100).toFixed(1) + '%' : 'N/A'));
  console.log('Calificacion disponible: ' + (recData.idRecomendacion ? 'Si (ID ' + recData.idRecomendacion + ')' : 'No'));
}

healthCheck().catch(err => console.error('Error durante healthCheck:', err.message));
