# Diagrama Entidad-Relación y Diccionario de Datos - RutaIA

## 1. Diagrama Entidad-Relación (Mermaid)

```mermaid
erDiagram
    ESTUDIANTES ||--o{ CONSULTAS : "realiza"
    CONSULTAS ||--o| RECOMENDACIONES : "origina"
    RECOMENDACIONES ||--|{ FUENTES : "contiene"
    CURSOS ||--o{ FUENTES : "es_fuente_de"
    RECOMENDACIONES ||--o| CALIFICACIONES : "recibe"

    ESTUDIANTES {
        bigserial id PK
        varchar(150) nombre_completo
        varchar(150) correo_electronico UK
        varchar(30) nivel_experiencia "CHECK: Principiante, Intermedio, Avanzado"
        varchar(100) area_interes
        timestamp fecha_creacion
    }

    CURSOS {
        bigserial id PK
        varchar(200) nombre
        text descripcion
        varchar(100) categoria
        varchar(30) nivel "CHECK: Básico, Intermedio, Avanzado"
        integer duracion_horas "CHECK: > 0"
        boolean activo "DEFAULT: TRUE"
        timestamp fecha_creacion
    }

    CONSULTAS {
        bigserial id PK
        bigint estudiante_id FK
        text pregunta
        timestamp fecha
        varchar(30) estado "CHECK: Pendiente, Respondida, Sin resultados, Error"
    }

    RECOMENDACIONES {
        bigserial id PK
        bigint consulta_id FK,UK
        text respuesta_texto
        timestamp fecha
        varchar(30) estado
    }

    FUENTES {
        bigserial id PK
        bigint recomendacion_id FK
        bigint curso_id FK
        numeric(5,4) similitud_score "CHECK: 0.0 a 1.0"
    }

    CALIFICACIONES {
        bigserial id PK
        bigint recomendacion_id FK,UK
        integer puntuacion "CHECK: 1 a 5"
        text comentario
        timestamp fecha
    }
```

---

## 2. Diccionario de Datos

### 2.1 Tabla `estudiantes`
Almacena los datos personales y académicos de los usuarios del sistema.
- `id` (BIGSERIAL, PK): Identificador único secuencial del estudiante.
- `nombre_completo` (VARCHAR 150, NOT NULL): Nombres y apellidos.
- `correo_electronico` (VARCHAR 150, UNIQUE, NOT NULL): Correo electrónico único institucional o personal.
- `nivel_experiencia` (VARCHAR 30, NOT NULL): Nivel de entrada del estudiante (`Principiante`, `Intermedio`, `Avanzado`).
- `area_interes` (VARCHAR 100, NOT NULL): Área de afinidad vocacional (ej. Desarrollo Web, IA, Datos).
- `fecha_creacion` (TIMESTAMP, NOT NULL): Marca temporal del registro.

### 2.2 Tabla `cursos`
Catálogo institucional de cursos ofrecidos.
- `id` (BIGSERIAL, PK): Identificador único del curso.
- `nombre` (VARCHAR 200, NOT NULL): Título del curso.
- `descripcion` (TEXT, NOT NULL): Descripción exhaustiva de temáticas, tecnologías y competencias.
- `categoria` (VARCHAR 100, NOT NULL): Área disciplinar (ej. Inteligencia Artificial, Desarrollo Web).
- `nivel` (VARCHAR 30, NOT NULL): Grado de dificultad (`Básico`, `Intermedio`, `Avanzado`).
- `duracion_horas` (INT, NOT NULL, CHECK > 0): Intensidad horaria en horas lectivas.
- `activo` (BOOLEAN, NOT NULL, DEFAULT TRUE): Estado operativo del curso (solo activos pueden ser recomendados).
- `fecha_creacion` (TIMESTAMP, NOT NULL): Fecha de registro en la institución.

### 2.3 Tabla `consultas`
Registro de las solicitudes en lenguaje natural formuladas por los estudiantes.
- `id` (BIGSERIAL, PK): Identificador único de la consulta.
- `estudiante_id` (BIGINT, FK -> estudiantes.id, NOT NULL): Estudiante que emitió la consulta.
- `pregunta` (TEXT, NOT NULL): Texto de la consulta en lenguaje natural.
- `fecha` (TIMESTAMP, NOT NULL): Momento exacto de emisión.
- `estado` (VARCHAR 30, NOT NULL): Estado del procesamiento (`Pendiente`, `Respondida`, `Sin resultados`, `Error`).

### 2.4 Tabla `recomendaciones`
Respuesta fundamentada generada para una consulta.
- `id` (BIGSERIAL, PK): Identificador único de la recomendación.
- `consulta_id` (BIGINT, FK -> consultas.id, UNIQUE, NOT NULL): Consulta asociada (relación 1 a 1).
- `respuesta_texto` (TEXT, NOT NULL): Contenido textual generado por el sistema RAG.
- `fecha` (TIMESTAMP, NOT NULL): Fecha y hora de generación.
- `estado` (VARCHAR 30, NOT NULL): Estado final de la recomendación (`Respondida`, etc.).

### 2.5 Tabla `fuentes`
Detalle de trazabilidad de los cursos recuperados desde la base vectorial y utilizados como fundamento.
- `id` (BIGSERIAL, PK): Identificador único del registro fuente.
- `recomendacion_id` (BIGINT, FK -> recomendaciones.id, NOT NULL): Recomendación receptora.
- `curso_id` (BIGINT, FK -> cursos.id, NOT NULL): Curso del catálogo utilizado como fuente.
- `similitud_score` (NUMERIC 5,4, NOT NULL): Puntuación de similitud semántica calculada por Qdrant (0.0000 a 1.0000).
- Restricción: `UNIQUE(recomendacion_id, curso_id)` para evitar duplicación de fuentes.

### 2.6 Tabla `calificaciones`
Evaluación otorgada por el estudiante a la recomendación recibida.
- `id` (BIGSERIAL, PK): Identificador único de la calificación.
- `recomendacion_id` (BIGINT, FK -> recomendaciones.id, UNIQUE, NOT NULL): Recomendación evaluada (máximo 1 por recomendación).
- `puntuacion` (INT, NOT NULL, CHECK 1 a 5): Valoración numérica entera entre 1 y 5 estrellas.
- `comentario` (TEXT, NULL): Observaciones cualitativas opcionales del estudiante.
- `fecha` (TIMESTAMP, NOT NULL): Fecha y hora del registro de la calificación.
