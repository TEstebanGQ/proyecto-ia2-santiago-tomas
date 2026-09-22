# Flujos de Automatización en n8n - RutaIA

Este directorio contiene los flujos de trabajo de n8n requeridos para la arquitectura de orientación académica inteligente:

## 1. Workflows Disponibles

### `01 Indexacion de Cursos en Qdrant` (`workflows/indexacion_cursos.json`)
- **Objetivo**: Conectar con la API de Spring Boot (`GET /api/cursos`), estructurar la representación textual de cada curso activo, calcular su vector de embedding mediante OpenRouter (`openai/text-embedding-3-small`) y realizar el upsert en la colección `cursos_academicos` de Qdrant.
- **Webhook**: `POST /webhook/indexar-cursos` (o ejecución manual mediante el editor de n8n).

### `02 Consulta y Recomendacion RAG` (`workflows/rag_recomendacion.json`)
- **Objetivo**: Recibir la consulta enviada por Spring Boot, validar la entrada, generar el embedding de la pregunta, buscar los cursos más similares en Qdrant (top 3 a 5), aplicar el umbral de relevancia semántica (0.65), y generar la recomendación vocacional fundamentada con OpenRouter LLM.
- **Webhook**: `POST /webhook/recomendar-cursos`
- **Entrada esperada**:
  ```json
  {
    "id_consulta": 1,
    "pregunta": "¿Qué puedo estudiar para trabajar con inteligencia artificial?",
    "nivel_experiencia": "Intermedio",
    "area_interes": "Inteligencia Artificial"
  }
  ```
- **Salida retornada**:
  ```json
  {
    "id_consulta": 1,
    "pregunta": "¿Qué puedo estudiar para trabajar con inteligencia artificial?",
    "respuesta": "Para ingresar al campo de la Inteligencia Artificial te recomendamos la siguiente ruta...",
    "fuentes": [
      {
        "id": 12,
        "nombre": "Inteligencia Artificial Generativa, Modelos LLM y Arquitecturas RAG",
        "descripcion": "...",
        "categoria": "Inteligencia Artificial",
        "nivel": "Avanzado",
        "duracion_horas": 60,
        "similitud": 0.8842
      }
    ],
    "similitudes": [0.8842],
    "estado_final": "Respondida"
  }
  ```

---

## 2. Instrucciones de Importación en n8n

1. Iniciar los contenedores con Docker Compose:
   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```
2. Abrir la interfaz web de n8n en el navegador: `http://localhost:5678`.
3. En el panel lateral, seleccionar **Workflows** > **Import from File...** y seleccionar el archivo `n8n/workflows/indexacion_cursos.json` y posteriormente `n8n/workflows/rag_recomendacion.json`.
4. En las variables de entorno de n8n (o en el nodo correspondiente), verificar que `OPENROUTER_API_KEY` tenga asignada una clave válida de OpenRouter.
5. Activar los workflows haciendo clic en el switch **Active** en la esquina superior derecha de cada flujo.
