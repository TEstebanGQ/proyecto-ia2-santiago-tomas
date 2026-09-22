import urllib.request, json, time

queries = [
    ("CP-01", "Quiero aprender a crear páginas web."),
    ("CP-02", "Necesito aprender Java para trabajar con Spring Boot."),
    ("CP-03", "Me interesa analizar datos y construir dashboards."),
    ("CP-04", "Quiero automatizar procesos empresariales."),
    ("CP-05", "¿Qué puedo estudiar para trabajar con inteligencia artificial?"),
    ("CP-06", "Quiero aprender a proteger aplicaciones web."),
    ("CP-07", "Necesito desplegar aplicaciones usando contenedores."),
    ("CP-08 (Fuera de Catálogo)", "Quiero aprender cocina italiana.")
]

print("=" * 75)
print("VERIFICACIÓN COMPLETA DE RECOMENDACIONES (Spring Boot -> n8n -> Qdrant/LLM)")
print("=" * 75)

for code, q in queries:
    t0 = time.time()
    data = json.dumps({"estudianteId": 1, "pregunta": q}).encode("utf-8")
    req = urllib.request.Request(
        "http://localhost:8080/api/consultas/recomendar",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            elapsed = round(time.time() - t0, 2)
            res = json.loads(resp.read().decode("utf-8"))
            estado = res.get("estadoFinal")
            fuentes = res.get("fuentes", [])
            top_fuente = fuentes[0] if fuentes else None
            top_nombre = top_fuente.get("nombre") if top_fuente else "Ninguno"
            top_sim = top_fuente.get("similitud") if top_fuente else "N/A"
            resp_preview = res.get("respuesta", "").replace("\n", " ")[:90]
            
            status_icon = "[OK]" if (estado == "Respondida" and fuentes) or (estado == "Sin resultados" and not fuentes) else "[FAIL]"
            print(f"{status_icon} [{code}] Estado: {estado} | Fuentes: {len(fuentes)} | Tiempo: {elapsed}s")
            print(f"   Top Curso: {top_nombre} (Similitud: {top_sim})")
            print(f"   Respuesta: {resp_preview}...")
            print("-" * 75)
    except Exception as e:
        print(f"[ERROR] [{code}] ERROR: {e}")
        print("-" * 75)
