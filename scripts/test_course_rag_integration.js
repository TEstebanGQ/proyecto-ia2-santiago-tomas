/*
 * Prueba E2E manual de RutaIA.
 * Crea un curso real, confirma API + Qdrant y comprueba que el asesor RAG lo cite.
 * Ejecutar: node scripts/test_course_rag_integration.js
 */

const API = process.env.RUTAIA_API_URL || 'http://localhost:8080/api';
const QDRANT = process.env.RUTAIA_QDRANT_URL || 'http://localhost:6335';
const ADMIN_EMAIL = process.env.RUTAIA_ADMIN_EMAIL || 'admin@universidad.edu.co';
const ADMIN_PASSWORD = process.env.RUTAIA_ADMIN_PASSWORD || 'password123';
const STUDENT_ID = Number(process.env.RUTAIA_STUDENT_ID || 1);
const marker = `E2E-${Date.now()}`;
const courseName = `Laboratorio ${marker}: Agentes de IA con RAG`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(120000) });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { response, body };
}

async function main() {
  console.log(`1/5 Iniciando sesión administrativa: ${ADMIN_EMAIL}`);
  const login = await request(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, rol: 'ADMINISTRADOR' })
  });
  assert(login.response.ok, `Login falló (${login.response.status}): ${JSON.stringify(login.body)}`);
  const setCookie = login.response.headers.get('set-cookie') || '';
  const cookie = setCookie.split(';')[0];
  assert(cookie.startsWith('rutaia_token='), 'El login no entregó la cookie segura de sesión.');

  console.log(`2/5 Creando curso: ${courseName}`);
  const course = await request(`${API}/cursos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      nombre: courseName,
      descripcion: 'Curso práctico para diseñar agentes de inteligencia artificial que consultan una base vectorial, recuperan fuentes verificables y generan respuestas con arquitectura RAG.',
      categoria: 'Inteligencia Artificial',
      nivel: 'Intermedio',
      duracionHoras: 36,
      prerrequisitos: 'Fundamentos de Python y conceptos básicos de APIs REST',
      activo: true
    })
  });
  assert(course.response.status === 201, `No se creó el curso (${course.response.status}): ${JSON.stringify(course.body)}`);
  assert(course.body?.id, 'La API creó el curso pero no retornó su identificador.');
  const courseId = course.body.id;

  console.log(`3/5 Verificando persistencia API del curso #${courseId}`);
  const persisted = await request(`${API}/cursos/${courseId}`, { headers: { Cookie: cookie } });
  assert(persisted.response.ok, `El curso #${courseId} no se puede consultar después de crearlo.`);
  assert(persisted.body?.nombre === courseName, 'El curso persistido no coincide con el curso creado.');

  console.log(`4/5 Verificando indexación en Qdrant del curso #${courseId}`);
  const vector = await request(`${QDRANT}/collections/cursos_academicos/points/${courseId}`);
  assert(vector.response.ok && vector.body?.result?.id === courseId,
    `El curso #${courseId} no fue indexado correctamente en Qdrant: ${JSON.stringify(vector.body)}`);

  console.log('5/5 Consultando al asesor IA sobre el curso creado');
  const question = `Quiero aprender a crear agentes de IA con RAG y bases vectoriales. ¿Qué curso nuevo me recomiendas y por qué?`;
  const rag = await request(`${API}/consultas/recomendar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ estudianteId: STUDENT_ID, pregunta: question })
  });
  assert(rag.response.ok, `La consulta al asesor falló (${rag.response.status}): ${JSON.stringify(rag.body)}`);
  assert(rag.body?.estadoFinal === 'Respondida', `El asesor no respondió correctamente: ${JSON.stringify(rag.body)}`);
  const cited = (rag.body?.fuentes || []).some(source => source.id === courseId || source.nombre === courseName);
  assert(cited, `El asesor respondió, pero no citó el curso creado #${courseId}.`);

  console.log(JSON.stringify({ ok: true, courseId, courseName, recommendation: rag.body }, null, 2));
}

main().catch(error => {
  console.error(`PRUEBA E2E FALLÓ: ${error.message}`);
  process.exitCode = 1;
});
