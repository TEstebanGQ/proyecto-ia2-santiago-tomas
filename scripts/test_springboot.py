import urllib.request, json, time

data = json.dumps({
    "estudianteId": 1,
    "pregunta": "Quiero aprender a crear paginas web."
}).encode("utf-8")

req = urllib.request.Request(
    "http://localhost:8080/api/consultas/recomendar",
    data=data,
    headers={"Content-Type": "application/json"}
)

t0 = time.time()
try:
    with urllib.request.urlopen(req, timeout=60) as resp:
        print("SPRING BOOT STATUS:", resp.status)
        body = json.loads(resp.read().decode("utf-8"))
        print("Elapsed:", round(time.time() - t0, 2), "s")
        print("ID:", body.get("id"))
        print("Estado:", body.get("estadoFinal"))
        print("Fuentes:", len(body.get("fuentes", [])))
        for f in body.get("fuentes", []):
            print(f"  - {f.get('nombre')} ({f.get('similitud')})")
        print("Orientacion:", body.get("respuestaOrientacion", "")[:180])
except Exception as e:
    print("Elapsed:", round(time.time() - t0, 2), "s")
    print("SPRING BOOT ERROR:", e)
