# Arquitectura del Sistema - RutaIA

## 1. Diagrama de Arquitectura de la Solución (Mermaid)

```mermaid
flowchart TB
    subgraph CLIENTE ["Capa de Presentación (Frontend)"]
        UI["Interfaz Web SPA<br/>(HTML5 / CSS3 / Vanilla JS)"]
    end

    subgraph BACKEND ["Capa de Negocio y Persistencia (Backend)"]
        API["Spring Boot 3 REST API<br/>(Java 21)"]
        SWAGGER["Documentación OpenAPI<br/>(Swagger UI)"]
        DB[(PostgreSQL 16<br/>Relacional)]
    end

    subgraph AUTOMATIZACION ["Capa de Orquestación e IA (n8n)"]
        N8N_INDEX["Workflow 01:<br/>Indexación Qdrant"]
        N8N_RAG["Workflow 02:<br/>Consulta RAG"]
    end

    subgraph VECTORES ["Capa Vectorial y Modelos"]
        QDRANT[(Qdrant Vector DB<br/>Colección: cursos_academicos)]
        OR_EMB["OpenRouter Embeddings<br/>(text-embedding-3-small)"]
        OR_LLM["OpenRouter LLM<br/>(Gemini 2.0 Flash)"]
    end

    %% Relaciones
    UI -->|1. HTTP REST Requests| API
    API -.->|Acceso a Docs| SWAGGER
    API -->|2. Persistencia JPA| DB

    API -->|3. Dispara Webhook RAG| N8N_RAG
    N8N_INDEX -->|Consulta Cursos Activos| API

    N8N_INDEX -->|Genera Embeddings Cursos| OR_EMB
    N8N_INDEX -->|Upsert Puntos + Payload| QDRANT

    N8N_RAG -->|Genera Embedding Pregunta| OR_EMB
    N8N_RAG -->|Búsqueda Semántica Top-5| QDRANT
    N8N_RAG -->|Filtro Umbral >= 0.65| N8N_RAG
    N8N_RAG -->|Prompt Contextualizado RAG| OR_LLM
    N8N_RAG -->|Retorna Recomendación + Fuentes| API
```

---

## 2. Componentes y Responsabilidades

### 2.1 Frontend Web
- **Tecnologías**: HTML5 semántico, CSS3 moderno (paleta HSL, tema oscuro con acentos violeta/cian, glassmorphism, responsive design), JavaScript ES6+ modular (Fetch API, async/await).
- **Responsabilidad**: Brindar una experiencia de usuario interactiva y fluida.
- **Regla Estricta**: Se comunica **únicamente** con la API REST de Spring Boot (`http://localhost:8080`). Nunca realiza llamadas directas a n8n, Qdrant u OpenRouter.

### 2.2 Backend Spring Boot
- **Tecnologías**: Java 21 LTS, Spring Boot 3, Spring Data JPA, Jakarta Validation, SpringDoc OpenAPI.
- **Responsabilidad**: Centralizar la lógica del negocio, validar entidades, registrar transaccionalmente las consultas, orquestar la llamada síncrona a n8n, almacenar las recomendaciones resultantes y sus fuentes con score, y exponer endpoints REST conformes a los estándares.
- **Manejo de Errores**: Controlador global de excepciones (`@RestControllerAdvice`) que formatea las respuestas de error bajo el estándar RFC 7807 (ProblemDetail).

### 2.3 Automatización n8n
- **Tecnologías**: n8n ejecutado en contenedor Docker.
- **Responsabilidad**: Orquestar el flujo de inteligencia artificial sin acoplar dependencias pesadas de IA al backend. Realiza la indexación por lotes de cursos y procesa las solicitudes RAG en tiempo real.

### 2.4 Base de Datos Vectorial Qdrant
- **Tecnologías**: Qdrant Engine v1.12 en Docker.
- **Responsabilidad**: Almacenar vectores de 1536 dimensiones correspondientes a las descripciones y metadatos de los cursos. Ejecuta búsquedas semánticas por similitud de coseno en milisegundos con filtrado por metadatos (`activo = true`).

### 2.5 OpenRouter (IA & Embeddings)
- **Modelos**:
  - `openai/text-embedding-3-small`: Para la generación de representaciones densas y normalizadas de 1536 dimensiones tanto de cursos como de consultas.
  - `google/gemini-2.0-flash-001`: Para la síntesis fundamentada y razonamiento vocacional basado estrictamente en el contexto institucional recuperado.
