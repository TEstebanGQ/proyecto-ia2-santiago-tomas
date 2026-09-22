import urllib.request, json

def test_q(q):
    print(f'=== Testing: {q} ===')
    data = json.dumps({'pregunta': q}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:5678/webhook/recomendar-cursos', data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print('Estado Final:', res.get('estado_final'))
        print('Fuentes count:', len(res.get('fuentes', [])))
        for f in res.get('fuentes', []):
            print(f"  - {f.get('nombre')} (similitud: {f.get('similitud')})")
        print('Respuesta preview:', res.get('respuesta', '')[:180])
        print()

test_q('Quiero aprender a crear paginas web.')
test_q('Quiero aprender cocina italiana.')
