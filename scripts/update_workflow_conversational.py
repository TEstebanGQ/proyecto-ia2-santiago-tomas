import json

WF_PATH = "/home/camper/proyecto-ia2-santiago-tomas/n8n/workflows/RutaIA_RAG_Optimizado_n8n.json"

with open(WF_PATH, "r", encoding="utf-8") as f:
    wf = json.load(f)

respond_identity_code = """
const d = $json;
const apiKey = $env.GEMINI_API_KEY || '';

const prompt = `Eres RutaIA Asesor, el orientador académico y vocacional inteligente de la plataforma educativa RutaIA.
Tu rol es orientar a los estudiantes en su trayectoria formativa con calidez, cercanía, empatía y profesionalismo humano.

INSTRUCCIONES CLAVE:
1. Responde de forma muy natural, empática y conversacional, adaptándote exactamente a lo que el estudiante te dice o pregunta.
2. Si te pregunta "¿cómo estás?" o "¿cómo te va?", salúdalo amablemente, dile cómo te encuentras con entusiasmo por poder orientarlo, y pregúntale cómo está él o en qué meta académica está pensando.
3. Si te saluda ("hola", "buenas", "buenos días"), dale una bienvenida amigable y cercana, y motívalo a contarte qué le gustaría aprender hoy.
4. Si te agradece ("gracias"), responde con calidez y entusiasmo de seguir apoyándolo.
5. Si te pregunta qué es RutaIA o quién eres, explícale tu propósito institucional de forma clara y accesible.
6. Mantén siempre tu identidad como asesor de RutaIA: recuérdale que estás listo para ayudarle a explorar áreas tecnológicas (programación, inteligencia artificial, desarrollo web, DevOps, ciberseguridad, bases de datos) o a revisar el catálogo institucional de cursos.
7. Sé conciso pero humano (2 a 3 párrafos breves o viñetas cuando amerite). No suenes como un menú telefónico ni repitas textos acartonados.

DATOS DEL ESTUDIANTE:
Nivel: ${d.nivel_experiencia || 'No especificado'}
Área de interés: ${d.area_interes || 'Tecnología'}

MENSAJE DEL ESTUDIANTE:
${d.pregunta}

Responde directamente al estudiante:`;

let respuestaTexto = '';
const models = ['gemini-flash-lite-latest', 'gemma-4-26b-a4b-it', 'gemini-flash-latest'];

for (const model of models) {
  try {
    const res = await this.helpers.httpRequest({
      method: 'POST',
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      headers: { 'Content-Type': 'application/json' },
      body: {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      },
      json: true
    });
    const text = res?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text && text.trim()) {
      respuestaTexto = text.trim();
      break;
    }
  } catch (err) {}
}

if (!respuestaTexto) {
  if (d.intent === 'greeting') {
    respuestaTexto = `¡Hola! 👋 Qué alegría saludarte. Te doy la bienvenida a **RutaIA**, tu orientador académico inteligente.\\n\\nEstoy aquí para acompañarte a descubrir tu camino formativo según tus metas e intereses en tecnología (como programación, IA, desarrollo web o cloud).\\n\\n¿En qué estás pensando enfocarte hoy o qué te gustaría aprender? ¡Te escucho!`;
  } else if (d.intent === 'thanks') {
    respuestaTexto = `¡Con mucho gusto! 😊 Me alegra un montón poder orientarte. Si tienes más dudas o quieres explorar nuevas áreas, aquí estaré listo para ayudarte. ¡Muchos éxitos!`;
  } else if (d.intent === 'farewell') {
    respuestaTexto = `¡Hasta pronto! 👋 Que tengas un excelente día. Recuerda que siempre puedes volver a consultar a **RutaIA** cuando lo necesites.`;
  } else {
    respuestaTexto = `RutaIA es tu plataforma inteligente de orientación académica vocacional. Mi misión es guiarte para descubrir los cursos ideales según tus intereses y metas profesionales en tecnología.`;
  }
}

return {json: {
  id_consulta: d.id_consulta,
  pregunta: d.pregunta,
  respuesta: respuestaTexto,
  fuentes: [],
  similitudes: [],
  estado_final: "Respondida",
  intent: d.intent
}};
"""

llm_code = """const d = $json;
const apiKey = $env.GEMINI_API_KEY || '';

const prompt = `Eres RutaIA Asesor, asistente de orientación vocacional y académica institucional.

REGLA PRINCIPAL:
Orienta al estudiante recomendándole el o los cursos más pertinentes de nuestro catálogo institucional. Redacta de forma cálida, cercana y motivadora, siguiendo este estilo y estructura:
- Saluda amablemente y valida el interés del estudiante en el tema.
- Recomienda con entusiasmo el curso más afín, destacando su nombre exacto en **negrita**, su nivel y duración en horas.
- Explica de forma clara y pedagógica por qué este curso es ideal para él o ella, usando viñetas con motivos concretos (por ejemplo: "* **Nivel Básico y Práctico:** ...", "* **Habilidades clave:** ...").
- Jamás escribas etiquetas frías como "Descripción:" o "Detalles del curso:". La explicación debe fluir de forma natural.
- Si hay cursos complementarios en el contexto, menciónalos brevemente como sugerencia de ruta futura.

FUENTE DE VERDAD:
Solo usa los cursos del CONTEXTO DEL CATÁLOGO. No inventes cursos, nombres, niveles ni duraciones.

PERFIL:
Nivel: ${d.nivel_experiencia || 'Principiante'}
Área: ${d.area_interes || 'General'}
Cursos previos: ${(d.cursos_previos || []).join(', ') || 'Ninguno'}
Contexto previo: ${d.contexto_previo || 'Sin contexto'}

PREGUNTA ACTUAL:
${d.pregunta}

CONTEXTO DEL CATÁLOGO:
${d.contexto}

Genera la orientación para el estudiante:`;

let respuestaTexto = '';
const models = ['gemini-flash-lite-latest', 'gemma-4-26b-a4b-it', 'gemini-flash-latest', 'gemini-3.8-flash'];

for (const model of models) {
  try {
    const res = await this.helpers.httpRequest({
      method: 'POST',
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      headers: { 'Content-Type': 'application/json' },
      body: {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
      },
      json: true
    });
    const text = res?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text && text.trim()) {
      respuestaTexto = text.trim();
      break;
    }
  } catch (err) {}
}

if (!respuestaTexto && d.fuentes && d.fuentes.length > 0) {
  const top = d.fuentes[0];
  const dur = top.duracion_horas || top.duracionHoras || 40;
  respuestaTexto = `¡Hola! Qué gusto poder guiarte en tu camino hacia ${d.pregunta}. Para comenzar a dominar esta tecnología, te recomiendo encarecidamente el curso **${top.nombre}** de nuestro catálogo.\\n\\nEste curso es ideal para ti porque:\\n* **Nivel ${top.nivel} y Enfoque Práctico:** Te proporcionará los fundamentos sólidos que necesitas, con ${dur} horas de formación.\\n* **Dominio de herramientas:** ${top.descripcion}\\n\\n¡Estoy aquí para acompañarte en tu formación!`;
}

return {json: {
  id_consulta: d.id_consulta,
  pregunta: d.pregunta,
  respuesta: respuestaTexto || 'No encontramos cursos que coincidan con tu búsqueda en este momento.',
  fuentes: d.fuentes || [],
  similitudes: d.similitudes || [],
  estado_final: (d.fuentes && d.fuentes.length > 0) ? 'Respondida' : 'Sin resultados',
  intent: d.intent || 'search'
}};"""

for node in wf["nodes"]:
    if node.get("id") == "respond-identity":
        node["parameters"]["jsCode"] = respond_identity_code
        print("Updated respond-identity node")
    elif node.get("id") == "llm":
        node["parameters"]["jsCode"] = llm_code
        print("Updated llm node")

with open(WF_PATH, "w", encoding="utf-8") as f:
    json.dump(wf, f, indent=2, ensure_ascii=False)

print("Workflow JSON successfully updated.")
