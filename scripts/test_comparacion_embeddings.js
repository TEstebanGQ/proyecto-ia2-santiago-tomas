#!/usr/bin/env node
/**
 * RutaIA - Comparación Semántica de Preguntas mediante Embeddings (Sin LLM)
 * Node.js Script
 */

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  const config = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        config[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  return config;
}

async function getEmbedding(text, apiKey, model = 'openai/text-embedding-3-small') {
  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/TEstebanGQ/proyecto-ia2-santiago-tomas',
      'X-Title': 'RutaIA Embedding Comparison'
    },
    body: JSON.stringify({
      model,
      input: text
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error HTTP ${res.status} al generar embedding: ${errText}`);
  }

  const data = await res.json();
  if (!data.data || !data.data[0] || !Array.isArray(data.data[0].embedding)) {
    throw new Error('Respuesta inválida de embeddings de OpenRouter');
  }

  return data.data[0].embedding;
}

function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    throw new TypeError('Ambos embeddings deben ser vectores numéricos');
  }
  if (vecA.length === 0 || vecB.length === 0) {
    throw new Error('Uno o ambos vectores están vacíos');
  }
  if (vecA.length !== vecB.length) {
    throw new Error(`Incompatibilidad de dimensiones: ${vecA.length} vs ${vecB.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

async function main() {
  const env = loadEnv();
  const apiKey = process.env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_EMBEDDING_MODEL || env.OPENROUTER_EMBEDDING_MODEL || 'openai/text-embedding-3-small';

  if (!apiKey) {
    console.error('Error: OPENROUTER_API_KEY no encontrada en entorno ni en .env');
    process.exit(1);
  }

  const preguntaA = process.argv[2] || 'Quiero aprender a crear páginas web';
  const preguntaB = process.argv[3] || 'Me interesa desarrollar sitios con HTML y CSS';

  try {
    const [vecA, vecB] = await Promise.all([
      getEmbedding(preguntaA, apiKey, model),
      getEmbedding(preguntaB, apiKey, model)
    ]);

    const similitud = cosineSimilarity(vecA, vecB);

    const salida = {
      preguntaA,
      preguntaB,
      similitud: Number(similitud.toFixed(4))
    };

    console.log(JSON.stringify(salida, null, 2));
  } catch (err) {
    console.error('Error durante la comparación semántica:', err.message);
    process.exit(1);
  }
}

main();
