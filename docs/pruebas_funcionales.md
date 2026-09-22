# Guía de Pruebas Funcionales y Consultas Obligatorias - RutaIA

Este documento describe la matriz de pruebas funcionales para validar el cumplimiento riguroso de los Requerimientos Funcionales (RF 01 al RF 18) y las 10 consultas obligatorias.

---

## 1. Matriz de Consultas de Prueba Obligatorias

| ID | Consulta / Escenario | Categoría Esperada | Validación RAG / Regla de Negocio | Código HTTP | Estado Final |
|----|----------------------|--------------------|-----------------------------------|-------------|--------------|
| **CP-01** | *"Quiero aprender a crear páginas web."* | Desarrollo Web | Recupera cursos de HTML5/CSS3/JS y React. Similitud > 0.65. LLM recomienda ruta progresiva. | 200 OK | `Respondida` |
| **CP-02** | *"Necesito aprender Java para trabajar con Spring Boot."* | Programación / Backend | Recupera cursos de Java 21 POO y Spring Boot REST APIs. Explica complementariedad. | 200 OK | `Respondida` |
| **CP-03** | *"Me interesa analizar datos y construir dashboards."* | Análisis de Datos | Recupera cursos de Python Pandas y Power BI. | 200 OK | `Respondida` |
| **CP-04** | *"Quiero automatizar procesos empresariales."* | Automatización | Recupera cursos de n8n y RPA con Python. | 200 OK | `Respondida` |
| **CP-05** | *"¿Qué puedo estudiar para trabajar con inteligencia artificial?"* | Inteligencia Artificial | Recupera cursos de Machine Learning, LLMs/RAG y Deep Learning. | 200 OK | `Respondida` |
| **CP-06** | *"Quiero aprender a proteger aplicaciones web."* | Ciberseguridad | Recupera cursos de OWASP Top 10 y Hacking Ético. | 200 OK | `Respondida` |
| **CP-07** | *"Necesito desplegar aplicaciones usando contenedores."* | DevOps y Cloud | Recupera cursos de Docker y Kubernetes. | 200 OK | `Respondida` |
| **CP-08** | *"Quiero aprender cocina italiana."* | **Fuera de catálogo** | **Caso de información insuficiente**: Puntuación de similitud semántica en Qdrant es < 0.65. El sistema NO inventa cursos de gastronomía ni llama al LLM con información irrelevante. | 200 OK | `Sin resultados` |
| **CP-09** | Enviar una pregunta vacía (`""` o solo espacios) | Validación de Entrada | Spring Boot valida con `@NotBlank` y rechaza la solicitud sin enviarla a n8n. | 400 Bad Request | Rechazada |
| **CP-10** | Consulta con estudiante inexistente (`id: 999999`) | Validación de Entidad | Spring Boot verifica la existencia del estudiante en PostgreSQL. Rechaza antes de llamar a n8n. | 404 Not Found | Rechazada |

---

## 2. Pruebas de Gestión y Reglas de Negocio

- **RF 01 - Correo duplicado**:
  - Intentar registrar un estudiante con `santiago.gomez@universidad.edu.co`.
  - Resultado esperado: HTTP 409 Conflict o 400 Bad Request informando que el correo ya está registrado.
- **RF 01 - Nivel de experiencia inválido**:
  - Intentar registrar estudiante con nivel `"Experto"` en lugar de `Principiante`, `Intermedio` o `Avanzado`.
  - Resultado esperado: HTTP 400 Bad Request.
- **RF 03 - Duración del curso <= 0**:
  - Intentar crear o actualizar curso con `duracion_horas: 0` o `-5`.
  - Resultado esperado: HTTP 400 Bad Request.
- **RF 04 - Filtro de cursos inactivos**:
  - Desactivar un curso (`PATCH /api/cursos/{id}/desactivar`).
  - Consultar `GET /api/cursos`.
  - Resultado esperado: El curso desactivado NO aparece en el catálogo del estudiante ni es recuperable por la búsqueda vectorial.
- **RF 17 - Calificación duplicada y fuera de rango**:
  - Calificar una recomendación con puntuación `6` o `0` -> HTTP 400.
  - Intentar calificar por segunda vez la misma recomendación -> HTTP 409 Conflict.
