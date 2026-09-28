#!/usr/bin/env python3
"""
RutaIA - Script de Comparación Semántica de Preguntas mediante Embeddings (Sin LLM)

Escenario:
  Pregunta A: "Quiero aprender a crear páginas web"
  Pregunta B: "Me interesa desarrollar sitios con HTML y CSS"

Requerimientos cumplidos:
1. Recibir dos textos diferentes.
2. Generar un embedding para cada texto utilizando exactamente el mismo modelo (OpenRouter: text-embedding-3-small).
3. Comprobar que ambos vectores sean válidos y compatibles en dimensión.
4. Calcular la similitud del coseno directamente entre los vectores (sin usar un LLM para juzgar la afinidad).
5. Devolver las dos preguntas y el valor numérico de similitud con formato JSON exacto.
"""

import os
import sys
import json
import math
import urllib.request
import urllib.error

def cargar_env():
    """Lee el archivo .env de la raíz del proyecto para obtener la API key y configuración."""
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    config = {}
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    config[key.strip()] = val.strip().strip('"').strip("'")
    return config

def obtener_embedding(texto, api_key, model="openai/text-embedding-3-small"):
    """
    Genera el vector de embedding para un texto dado mediante la API de OpenRouter.
    """
    url = "https://openrouter.ai/api/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/TEstebanGQ/proyecto-ia2-santiago-tomas",
        "X-Title": "RutaIA Embedding Comparison"
    }
    payload = json.dumps({
        "model": model,
        "input": texto
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if "data" in data and len(data["data"]) > 0:
                return data["data"][0]["embedding"]
            else:
                raise ValueError(f"Respuesta inesperada de embeddings: {data}")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='ignore')
        raise RuntimeError(f"Error HTTP {e.code} al obtener embedding: {err_body}")

def validar_vectores(vector_a, vector_b):
    """
    Verifica que ambos resultados sean vectores válidos, no vacíos y compatibles en dimensión.
    """
    if not isinstance(vector_a, list) or not isinstance(vector_b, list):
        raise TypeError("Los embeddings deben ser listas numéricas.")
    if len(vector_a) == 0 or len(vector_b) == 0:
        raise ValueError("Uno o ambos vectores están vacíos.")
    if len(vector_a) != len(vector_b):
        raise ValueError(f"Incompatibilidad de dimensiones: Vector A ({len(vector_a)}) vs Vector B ({len(vector_b)}).")
    
    # Comprobar que todos los elementos sean numéricos
    for val in vector_a:
        if not isinstance(val, (int, float)):
            raise TypeError("Vector A contiene elementos no numéricos.")
    for val in vector_b:
        if not isinstance(val, (int, float)):
            raise TypeError("Vector B contiene elementos no numéricos.")

def calcular_similitud_coseno(vec_a, vec_b):
    """
    Calcula la similitud del coseno entre dos vectores numéricos sin utilizar ningún LLM.
    Fórmula: dot_product(A, B) / (norm(A) * norm(B))
    """
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return dot_product / (norm_a * norm_b)

def comparar_preguntas(pregunta_a, pregunta_b, api_key=None, model=None):
    env = cargar_env()
    api_key = api_key or env.get("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("No se encontró OPENROUTER_API_KEY en variables de entorno ni en archivo .env")

    model = model or env.get("OPENROUTER_EMBEDDING_MODEL", "openai/text-embedding-3-small")

    # 1 y 2: Generar embeddings con el mismo modelo
    emb_a = obtener_embedding(pregunta_a, api_key, model=model)
    emb_b = obtener_embedding(pregunta_b, api_key, model=model)

    # 3: Comprobar validez y compatibilidad
    validar_vectores(emb_a, emb_b)

    # 4: Calcular medida de similitud algebraica pura (Coseno)
    similitud = calcular_similitud_coseno(emb_a, emb_b)

    # 5: Estructurar salida esperada
    resultado = {
        "preguntaA": pregunta_a,
        "preguntaB": pregunta_b,
        "similitud": round(similitud, 4)
    }

    return resultado

if __name__ == "__main__":
    pregunta_a = sys.argv[1] if len(sys.argv) > 1 else "Quiero aprender a crear páginas web"
    pregunta_b = sys.argv[2] if len(sys.argv) > 2 else "Me interesa desarrollar sitios con HTML y CSS"

    try:
        resultado = comparar_preguntas(pregunta_a, pregunta_b)
        print(json.dumps(resultado, indent=2, ensure_ascii=False))
    except Exception as e:
        sys.stderr.write(f"Error en la comparación: {e}\n")
        sys.exit(1)
