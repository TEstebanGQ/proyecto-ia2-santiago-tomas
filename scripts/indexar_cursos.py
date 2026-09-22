import urllib.request
import json
import os
import sys

import os

API_KEY = os.getenv("OPENROUTER_API_KEY", "")
BACKEND_URL = "http://localhost:8080/api/cursos"
QDRANT_URL = "http://localhost:6333/collections/cursos_academicos"
OPENROUTER_EMBED_URL = "https://openrouter.ai/api/v1/embeddings"
MODEL = "openai/text-embedding-3-small"

def main():
    print("1. Obteniendo cursos activos desde Spring Boot...")
    req = urllib.request.Request(BACKEND_URL)
    with urllib.request.urlopen(req) as resp:
        cursos = json.loads(resp.read().decode("utf-8"))
    print(f"   -> Cursos recuperados: {len(cursos)}")

    print("2. Verificando/creando coleccion en Qdrant...")
    coll_payload = json.dumps({"vectors": {"size": 1536, "distance": "Cosine"}}).encode("utf-8")
    try:
        coll_req = urllib.request.Request(QDRANT_URL, data=coll_payload, headers={"Content-Type": "application/json"}, method="PUT")
        with urllib.request.urlopen(coll_req) as resp:
            print("   -> Coleccion creada en Qdrant.")
    except Exception as e:
        print(f"   -> Coleccion ya existe o lista: {e}")

    print("3. Generando embeddings e insertando puntos en Qdrant...")
    points = []
    for i, c in enumerate(cursos, start=1):
        texto = f"Curso: {c['nombre']}. Categoría: {c['categoria']}. Nivel: {c['nivel']}. Duración: {c['duracionHoras']} horas. Descripción: {c['descripcion']}"
        print(f"   [{i}/{len(cursos)}] Generando embedding para: {c['nombre'][:40]}...")

        embed_payload = json.dumps({
            "model": MODEL,
            "input": texto
        }).encode("utf-8")

        embed_req = urllib.request.Request(
            OPENROUTER_EMBED_URL,
            data=embed_payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}"
            },
            method="POST"
        )

        with urllib.request.urlopen(embed_req) as resp:
            embed_res = json.loads(resp.read().decode("utf-8"))
            vector = embed_res["data"][0]["embedding"]

        point = {
            "id": c["id"],
            "vector": vector,
            "payload": {
                "curso_id": c["id"],
                "nombre": c["nombre"],
                "descripcion": c["descripcion"],
                "categoria": c["categoria"],
                "nivel": c["nivel"],
                "duracion_horas": c["duracionHoras"],
                "activo": c["activo"]
            }
        }
        points.append(point)

    print(f"4. Insertando {len(points)} puntos en Qdrant...")
    upsert_payload = json.dumps({"points": points}).encode("utf-8")
    upsert_req = urllib.request.Request(
        f"{QDRANT_URL}/points?wait=true",
        data=upsert_payload,
        headers={"Content-Type": "application/json"},
        method="PUT"
    )
    with urllib.request.urlopen(upsert_req) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        print(f"   -> Respuesta de Qdrant: {result}")

    print("5. Verificando estado de la coleccion en Qdrant...")
    with urllib.request.urlopen(QDRANT_URL) as resp:
        coll_info = json.loads(resp.read().decode("utf-8"))
        p_count = coll_info["result"]["points_count"]
        print(f"   === EXITO: Qdrant ahora contiene {p_count} cursos vectorizados ===")

if __name__ == "__main__":
    main()
