import urllib.request
import json
import os
import sys

def load_env():
    # Cargar .env desde la raíz del proyecto si existe
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip()
                    if k not in os.environ:
                        os.environ[k] = v

load_env()

API_KEY = os.getenv("OPENROUTER_API_KEY", "tu_openrouter_api_key_aqui")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080/api/cursos")
QDRANT_PORT = os.getenv("QDRANT_PORT", "6333")
OPENROUTER_EMBED_URL = "https://openrouter.ai/api/v1/embeddings"
MODEL = "openai/text-embedding-3-small"

def get_qdrant_url():
    # Probar puertos 6333 y 6335
    ports = [QDRANT_PORT, "6333", "6335"]
    for p in ports:
        try:
            url = f"http://localhost:{p}/collections"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=2) as resp:
                print(f"   -> Conectado a Qdrant en puerto: {p}")
                return f"http://localhost:{p}/collections/cursos_academicos"
        except Exception:
            continue
    return f"http://localhost:{QDRANT_PORT}/collections/cursos_academicos"

def main():
    qdrant_url = get_qdrant_url()
    print(f"1. Obteniendo cursos activos desde Spring Boot ({BACKEND_URL})...")
    req = urllib.request.Request(BACKEND_URL)
    with urllib.request.urlopen(req) as resp:
        cursos = json.loads(resp.read().decode("utf-8"))
    print(f"   -> Cursos recuperados: {len(cursos)}")

    print(f"2. Verificando/creando colección en Qdrant en {qdrant_url}...")
    coll_payload = json.dumps({"vectors": {"size": 1536, "distance": "Cosine"}}).encode("utf-8")
    try:
        coll_req = urllib.request.Request(qdrant_url, data=coll_payload, headers={"Content-Type": "application/json"}, method="PUT")
        with urllib.request.urlopen(coll_req) as resp:
            print("   -> Colección creada exitosamente en Qdrant.")
    except Exception as e:
        print(f"   -> Colección ya lista/existente: {e}")

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
        f"{qdrant_url}/points?wait=true",
        data=upsert_payload,
        headers={"Content-Type": "application/json"},
        method="PUT"
    )
    with urllib.request.urlopen(upsert_req) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        print(f"   -> Respuesta de Qdrant: {result}")

    print("5. Verificando estado de la colección en Qdrant...")
    with urllib.request.urlopen(qdrant_url) as resp:
        coll_info = json.loads(resp.read().decode("utf-8"))
        p_count = coll_info["result"]["points_count"]
        print(f"   === ÉXITO: Qdrant ahora contiene {p_count} cursos vectorizados ===")

if __name__ == "__main__":
    main()
