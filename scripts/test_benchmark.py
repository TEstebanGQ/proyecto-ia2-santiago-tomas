import urllib.request
import json

import os
API_KEY = os.getenv("OPENROUTER_API_KEY", "")
queries = [
    'Quiero aprender a crear páginas web.',
    'Necesito aprender Java para trabajar con Spring Boot.',
    'Me interesa analizar datos y construir dashboards.',
    'Quiero automatizar procesos empresariales.',
    '¿Qué puedo estudiar para trabajar con inteligencia artificial?',
    'Quiero aprender a proteger aplicaciones web.',
    'Necesito desplegar aplicaciones usando contenedores.',
    'Quiero aprender cocina italiana.'
]

for q in queries:
    req1 = urllib.request.Request(
        'https://openrouter.ai/api/v1/embeddings',
        data=json.dumps({'model': 'openai/text-embedding-3-small', 'input': q}).encode('utf-8'),
        headers={'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req1) as r1:
        vec = json.loads(r1.read().decode('utf-8'))['data'][0]['embedding']

    req2 = urllib.request.Request(
        'http://localhost:6333/collections/cursos_academicos/points/search',
        data=json.dumps({'vector': vec, 'limit': 3, 'with_payload': True}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req2) as r2:
        res = json.loads(r2.read().decode('utf-8'))['result']
        top = res[0] if res else None
        score = top['score'] if top else 0
        name = top['payload']['nombre'] if top else 'None'
        print(f"'{q}'\n  -> Top Score: {score:.4f} | Course: {name}\n")
