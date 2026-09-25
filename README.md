<p align="center">
  <img src="https://github.com/TEstebanGQ.png" width="112" alt="Logo de Tomas Gonzalez" />
</p>

# RutaIA: Sistema Inteligente de Orientación Académica y Recomendación Curricular (RAG + JWT + Redis + Umbral Dinámico)

[![Java](https://img.shields.io/badge/Java-17_LTS-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-6.4-green.svg)](https://spring.io/projects/spring-security)
[![Redis](https://img.shields.io/badge/Redis-7_Alpine-red.svg)](https://redis.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-crimson.svg)](https://qdrant.tech/)
[![n8n](https://img.shields.io/badge/n8n-Automation-pink.svg)](https://n8n.io/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-RAG_AI-purple.svg)](https://openrouter.ai/)

---

## 1. Integrantes del Proyecto
- **Tomas Gonzalez**
- **Santiago Suarez**
- **Asignatura**: Inteligencia Artificial 2 (IA2)

---

## 2. Descripción del Proyecto

### 2.1 Problemática
En entornos académicos y tecnológicos universitarios, los estudiantes se enfrentan a catálogos curriculares extensos y cambiantes. Los motores de búsqueda tradicionales basados exclusivamente en palabras clave literales fracasan cuando la inquietud del estudiante no contiene los términos exactos del curso, arrojando resultados vacíos o irrelevantes. Además, se requiere garantizar que la inteligencia artificial **no invente asignaturas** (alucinaciones) y que la oferta institucional se sincronice fielmente en tiempo real.

### 2.2 Solución: RutaIA
**RutaIA** es una plataforma web enterprise que implementa una arquitectura **RAG (Retrieval-Augmented Generation)** fundamentada exclusivamente en la oferta académica real de la institución:
- **Asesor Vocacional Inteligente**: Procesa consultas en lenguaje natural, recupera cursos mediante similitud semántica en **Qdrant** utilizando embeddings de alta dimensión (`openai/text-embedding-3-small`, 1536 dimensiones) y sintetiza recomendaciones fundamentadas citando fuentes oficiales con su porcentaje de afinidad.
- **Umbral de Confianza Dinámico (Configurable en Admin)**: Permite ajustar en tiempo real el umbral de similitud semántica para las búsquedas RAG (por defecto 0.65). Si la afinidad de una consulta está por debajo del umbral configurado (por ejemplo, *"cocina italiana"* o *"mantenimiento aeronáutico"*), el motor rechaza inventar información y reporta con honestidad *"Sin resultados curriculares aplicables"*.
- **Módulo de Analíticas e Indicadores Institucionales**: Panel de control con métricas avanzadas en tiempo real (total de estudiantes registrados, volumen de consultas realizadas, promedio de calificaciones de respuestas, distribución de ratings y ranking de cursos más consultados).
- **Directorio y Búsqueda Flexible de Estudiantes**: Permite consultar alumnos por nombre completo, correo electrónico o identificador numérico (ID), mostrando la ficha del estudiante con su historial completo de interacciones y valoraciones RAG.
- **Gestión Curricular Completa con Prerrequisitos**: Administración de cursos con soporte para asignaturas prerrequisito, categorización jerárquica por nivel (*Principiante*, *Intermedio*, *Avanzado*) y visualización de descripciones sin truncamiento.
- **Autenticación Empresarial JWT + Redis**: Sesiones protegidas por tokens firmados criptográficamente (HMAC-SHA256) validados en tiempo real en un cluster de **Redis**, impidiendo el almacenamiento inseguro de tokens en `localStorage` mediante **HttpOnly Cookies**.
- **Sincronización Automática Base Relacional ⟷ Qdrant**: Cada operación administrativa sobre cursos (alta, modificación o reactivación) reindexa su vector semántico en Qdrant en tiempo real. **Al desactivar un curso, su vector se elimina de inmediato de Qdrant** para evitar recomendaciones obsoletas.

---

## 3. Arquitectura General del Sistema

```
                                      [ NAVEGADOR DEL CLIENTE ]
                                    (http://localhost:3000)
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
              [ login.html ]                                   [ index.html ]
          (Portal Split-Screen)                     (Dashboard / Panel Admin / Analíticas)
                      │                                               │
                      │  HTTP REST + HttpOnly Cookie                  │
                      └───────────────────────┬───────────────────────┘
                                              ▼
                                 [ SPRING BOOT 3.4.3 BACKEND ]
                                    (http://localhost:8080)
                                              │
       ┌──────────────────────┬───────────────┼───────────────┬──────────────────────┐
       ▼                      ▼               ▼               ▼                      ▼
[ Spring Security ]  [ CursoService ] [ ConfiguracionService ] [ EstadisticaService ] [ N8nOrquestador ]
       │                      │               │               │                      │
       ▼ (Valida Token)       ▼ (Sync Vector) ▼ (Umbral RAG)  ▼ (Métricas)           ▼ (Webhook)
 [ REDIS 7 DB ]      [ QDRANT VECTOR DB ] └──────────────┬──┘                 [ n8n WORKFLOW ]
  (Puerto 6379)        (Puerto 6333)                    │                     (Puerto 5678)
       ▲                      ▲                         ▼                            │
       │                      │                 [ POSTGRESQL DB ]                    ▼
[ auth:token:... ]   [ cursos_academicos ]        (Puerto 5432)                [ OPENROUTER AI ]
                                                                            (Embeddings & LLM)
```

---

## 4. Requisitos Previos del Entorno

Antes de comenzar, asegúrate de tener instalado en tu equipo las siguientes herramientas:

| Herramienta | Versión Recomendada | Comando de Comprobación | Propósito |
| :--- | :--- | :--- | :--- |
| **Git** | 2.x o superior | `git --version` | Clonar y versionar el código fuente |
| **Java JDK** | **Java 17 LTS** | `java -version` | Requerido para compilar y ejecutar Spring Boot 3.4 |
| **Docker & Docker Compose** | Docker Desktop 4.x+ | `docker --version` y `docker compose version` | Orquestar PostgreSQL, Qdrant, Redis y n8n |
| **Node.js** | v18.x o superior | `node -v` | Servir el frontend y scripts de verificación |
| **Cuenta OpenRouter** | Gratuita / Saldo | [openrouter.ai](https://openrouter.ai) | API Key para embeddings (`text-embedding-3-small`) y LLM |

---

## 5. ⚡ Guía Rápida de Inicio (Para el que recibe el proyecto por primera vez)

Si acabas de descargar o clonar el proyecto y quieres tenerlo **corriendo en menos de 5 minutos**, ejecuta esta secuencia en tu terminal:

```bash
# 1. Clona y entra a la carpeta
git clone https://github.com/TU_USUARIO/proyecto-IA2-SANTIAGO-TOMAS.git
cd proyecto-IA2-SANTIAGO-TOMAS

# 2. Configura tu API Key de OpenRouter
cp .env.example .env
# (Abre .env y pega tu OPENROUTER_API_KEY=sk-or-v1-...)

# 3. Levanta los 4 contenedores (PostgreSQL, Qdrant, Redis, n8n)
docker compose -f docker/docker-compose.yml up -d

# 4. Inicia el Backend en una terminal (espera a ver 'Started RutaiaApplication')
cd backend
# En Windows:
.\gradlew.bat bootRun
# En Linux/macOS:
./gradlew bootRun

# 5. En OTRA terminal, inicia el Frontend (desde la raíz del proyecto):
node scripts/serve_frontend.js

# 6. Abre tu navegador en:
# 👉 http://localhost:3000/login.html
```

---

## 6. Despliegue en Producción

RutaIA se despliega como servicios separados. Esta división permite que el frontend se entregue rápido, el backend conserve las reglas de negocio y n8n procese las consultas RAG.

| Plataforma | Servicio | Función |
| :--- | :--- | :--- |
| **GitHub** | Repositorio y ramas | Control de versiones, revisiones y despliegues automáticos. |
| **Vercel** | `frontend/` | Publicación estática del portal. Redirige `/` a `login.html` y reenvía `/api/*` al backend. |
| **Render** | Spring Boot | API REST, autenticación JWT, Redis y operaciones curriculares. |
| **Render** | PostgreSQL | Persistencia de usuarios, estudiantes, cursos, consultas y recomendaciones. |
| **Render** | n8n | Orquestación de webhooks, búsqueda RAG y respuesta del asesor. Se aprovisiona con `render.n8n.yaml`. |
| **Google Identity Services** | OAuth | Selección de la cuenta Google real del navegador e inicio de sesión seguro. |
| **OpenRouter** | IA | Embeddings y generación de las respuestas de orientación. |
| **Qdrant** | Base vectorial | Índice semántico de cursos para recuperación RAG. |

### 6.1 Desplegar el frontend en Vercel

1. Importa el repositorio en Vercel y selecciona la rama que vas a publicar.
2. En **Settings → Build and Deployment**, configura:
   - **Framework Preset:** `Other`
   - **Root Directory:** `frontend`
   - **Build Command:** vacío
   - **Output Directory:** `.`
3. Vercel sirve el frontend y el archivo `frontend/vercel.json` redirige la raíz al acceso y hace proxy de `/api/*` hacia Render. Esto mantiene frontend y API bajo el mismo origen del navegador, evitando la pérdida de cookies de sesión.

### 6.2 Desplegar backend, base de datos y n8n en Render

1. Despliega el backend Spring Boot como Web Service y conecta el PostgreSQL y Redis de Render.
2. En el backend define como mínimo:

   ```text
   GOOGLE_OAUTH_CLIENT_ID=tu-client-id.apps.googleusercontent.com
   APP_COOKIE_SECURE=true
   N8N_WEBHOOK_URL=https://rutaia-n8n.onrender.com/webhook/recomendar-cursos
   OPENROUTER_API_KEY=tu-clave-privada
   ```

3. Para n8n ve a **New → Blueprint**, selecciona la rama del proyecto y especifica el archivo `render.n8n.yaml`.
4. Render solicitará las credenciales internas del PostgreSQL existente, `OPENROUTER_API_KEY`, `GEMINI_API_KEY` si se usa Gemini y `QDRANT_URL`. Estos valores se guardan como secretos de Render, nunca en Git.
5. Cuando Render genere la URL pública de n8n, usa esa misma URL para `WEBHOOK_URL` y `N8N_EDITOR_BASE_URL` en n8n; luego coloca la URL del webhook en `N8N_WEBHOOK_URL` del backend.
6. Importa y activa el flujo `n8n/workflows/RutaIA_RAG_Optimizado_n8n.json` desde el editor de n8n.

### 6.3 Configurar Google para producción

En Google Cloud Console, en el cliente OAuth, agrega cada dominio de Vercel en **Authorized JavaScript origins**. No se debe publicar el Client Secret: el frontend solo usa el Client ID y el backend valida la credencial de Google.

---

## 7. Guía de Instalación y Puesta en Marcha Exhaustiva Paso a Paso

A continuación se detalla cada componente, qué hace por debajo y cómo verificar que todo funcione a la perfección:

### Paso 1: Clonar el Repositorio
Abre tu terminal favorita (PowerShell, Git Bash, Terminal de macOS o Linux) y clona el proyecto:
```bash
git clone https://github.com/TU_USUARIO/proyecto-IA2-SANTIAGO-TOMAS.git
cd proyecto-IA2-SANTIAGO-TOMAS
```

---

### Paso 2: Configurar las Variables de Entorno
El proyecto necesita tu clave de **OpenRouter** para que el modelo generativo y el cálculo de embeddings vectoriales funcionen.

1. En la raíz del repositorio, copia la plantilla `.env.example`:
   - En Windows (PowerShell):
     ```powershell
     Copy-Item .env.example .env
     ```
   - En Linux/macOS/Git Bash:
     ```bash
     cp .env.example .env
     ```
2. Abre el archivo `.env` con tu editor (VS Code, Notepad, etc.) y reemplaza la clave de ejemplo por tu clave real:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-tu-clave-real-de-openrouter-aqui
   ```
3. Verifica que en `docker/.env` se encuentren los parámetros predeterminados de las bases de datos:
   ```env
   POSTGRES_DB=rutaia_db
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   OPENROUTER_API_KEY=sk-or-v1-tu-clave-real-de-openrouter-aqui
   ```

---

### Paso 3: Levantar los Servicios con Docker Compose
El archivo [`docker/docker-compose.yml`](docker/docker-compose.yml) orquesta de manera automatizada los 4 servicios de infraestructura:
- **`rutaia_postgres`** (Puerto `5432`): Base de datos relacional PostgreSQL 16. Al iniciar por primera vez, ejecuta automáticamente el script [`database/init.sql`](database/init.sql) creando el esquema DDL y poblando los **22 cursos oficiales semilla** con sus prerrequisitos e información institucional.
- **`rutaia_qdrant`** (Puerto `6333`): Motor de base de datos vectorial de alto rendimiento donde se guardan los embeddings de los cursos.
- **`rutaia_redis`** (Puerto `6379`): Base de datos en memoria ultrarrápida encargada de gestionar los tokens JWT activos y permitir revocación instantánea (cierre de sesión seguro sin depender del almacenamiento del navegador).
- **`rutaia_n8n`** (Puerto `5678`): Plataforma de orquestación visual que conecta los webhooks de consulta con el motor RAG.

Ejecuta el siguiente comando desde la raíz del proyecto:
```bash
docker compose -f docker/docker-compose.yml up -d
```

**Comprobación de los Contenedores**:
```bash
docker ps
```
Los 4 contenedores deben mostrar el estado `Up`:
```text
CONTAINER ID   IMAGE                 PORTS                               NAMES
xxxxxxxxxxxx   n8nio/n8n:latest      0.0.0.0:5678->5678/tcp              rutaia_n8n
xxxxxxxxxxxx   qdrant/qdrant:latest  0.0.0.0:6333-6334->6333-6334/tcp    rutaia_qdrant
xxxxxxxxxxxx   redis:7-alpine        0.0.0.0:6379->6379/tcp              rutaia_redis
xxxxxxxxxxxx   postgres:16           0.0.0.0:5432->5432/tcp              rutaia_postgres
```

---

### Paso 4: Configurar los Workflows en n8n
1. Abre tu navegador en **`http://localhost:5678`**.
2. Si entras por primera vez, n8n te solicitará crear una cuenta de administrador local (nombre, email y contraseña personal).
3. Dirígete al menú lateral **Workflows** e importa los dos flujos ubicados en la carpeta `n8n/workflows/`:
   - **`01 Indexacion de Cursos en Qdrant`**: Archivo `n8n/workflows/indexacion_cursos.json`.
   - **`02 RAG Recomendacion de Cursos`**: Archivo `n8n/workflows/rag_recomendacion.json`.
4. En los nodos que se comunican con OpenRouter, valida que en la cabecera `Authorization` esté configurada tu API Key (`Bearer TU_API_KEY`).
5. **Muy Importante**: Activa ambos workflows con el switch superior **Active (On)**.

---

### Paso 5: Indexación Vectorial Inicial en Qdrant
Para cargar los embeddings de los 22 cursos semilla de PostgreSQL en Qdrant, dispara el webhook de n8n:
- **Desde PowerShell**:
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:5678/webhook/indexar-cursos" -Method POST
  ```
- **Desde Bash / Terminal**:
  ```bash
  curl -X POST http://localhost:5678/webhook/indexar-cursos
  ```

**Comprobación Visual en Qdrant**:
Abre en tu navegador el panel de Qdrant:
👉 **`http://localhost:6333/dashboard`**
Ingresa a la colección `cursos_academicos`. Observarás los **22 vectores semánticos** listados con sus metadatos (título, descripción, nivel, créditos, categoría y prerrequisitos).

---

### Paso 6: Compilar y Ejecutar el Backend (Spring Boot)
1. Abre una terminal dedicada para el backend y navega a la carpeta correspondiente:
   ```bash
   cd backend
   ```
2. Arranca el servicio con Gradle:
   - **En Windows (PowerShell o CMD)**:
     ```powershell
     .\gradlew.bat bootRun
     ```
   - **En Linux / macOS**:
     ```bash
     chmod +x gradlew
     ./gradlew bootRun
     ```
3. Espera a que la terminal muestre:
   ```text
   Tomcat started on port 8080 (http) with context path '/'
   Started RutaiaApplication in X.XXX seconds
   ```
4. **Comprobación de la API (Swagger UI)**:
   Abre en tu navegador la documentación interactiva:
   👉 **`http://localhost:8080/swagger-ui/index.html`**
   Allí podrás ver todos los controladores documentados (`AuthController`, `CursoController`, `EstudianteController`, `ConsultaController`, `ConfiguracionController`, `EstadisticaController`, `CalificacionController`).

---

### Paso 7: Iniciar el Servidor Frontend
1. Abre otra terminal desde la raíz del proyecto y arranca el servidor local de Node.js:
   ```bash
   node scripts/serve_frontend.js
   ```
2. Verás en consola:
   ```text
   Servidor Frontend de RutaIA iniciado en http://localhost:3000
   Ruta principal: http://localhost:3000/login.html
   ```
3. **Acceso Inmediato**: Abre en tu navegador:
   👉 **`http://localhost:3000/login.html`**

---

## 7. Roles y Credenciales de Acceso

La plataforma cuenta con separación estricta de responsabilidades por rol:

| Rol | Correo de Prueba | Contraseña | Permisos y Capacidades |
| :--- | :--- | :--- | :--- |
| **Estudiante** | `santiago.gomez@universidad.edu.co` | `password123` | Descubrir cursos con el Asesor RAG en lenguaje natural, ver fuentes y score de similitud, calificar con estrellas, consultar historial académico y explorar catálogo con prerrequisitos. |
| **Administrador** | `admin@universidad.edu.co` | `password123` | Gestión CRUD completa de cursos (alta, edición, activación/desactivación con borrado vectorial en Qdrant), **Configuración del Umbral RAG**, **Analíticas y Métricas Institucionales** y **Búsqueda General de Estudiantes (Nombre/Correo/ID)**. |
| **Nuevo Estudiante** | *Registro libre en pantalla de Login* | *Definida por el usuario* | Registro inmediato en PostgreSQL con inicio de sesión automático y generación de token seguro en Redis. |
| **Google Sign-In** | Botón *"Continuar con Google"* | *OAuth2 Simulado* | Acceso instantáneo con perfil institucional verificado. |

---

## 8. Guía de Uso de la Aplicación: Primer Ingreso y Navegación

### A. Experiencia del Estudiante
1. **Acceso al Portal**:
   - Ingresa a `http://localhost:3000/login.html`.
   - Puedes ingresar con la cuenta de prueba `santiago.gomez@universidad.edu.co` (`password123`) o hacer clic en **"Registrarse gratis"** para crear un estudiante nuevo desde cero.
2. **Asesor Vocacional RAG (Pantalla Principal)**:
   - En la sección **Inicio / Asesor**, escribe en lenguaje natural tus intereses, dudas o metas vocacionales (ejemplo: *"Quiero aprender a crear aplicaciones web interactivas con React"*).
   - Haz clic en **Consultar Asesor**.
   - El sistema invoca el webhook de n8n pasando la consulta y el **umbral dinámico activo**, busca los cursos más afines en Qdrant mediante similitud de cosenos y redacta una respuesta pedagógica estructurada.
   - Debajo de la respuesta, verás las **Fuentes Verificables Oficiales**: tarjetas con el título del curso, código de asignatura, número de créditos, prerrequisitos y porcentaje de afinidad semántica.
3. **Calificación y Retroalimentación**:
   - Puedes calificar la recomendación de 1 a 5 estrellas y dejar un comentario opcional para evaluar la calidad del asesor.
4. **Catálogo Completo de Cursos**:
   - Haz clic en **Catálogo** en el menú superior/lateral para explorar los 22 cursos disponibles, con descripciones completas, prerrequisitos y filtros interactivos por nivel (*Principiante*, *Intermedio*, *Avanzado*) y área de conocimiento.
5. **Historial Académico Personal**:
   - En la pestaña **Historial**, consulta el registro histórico de todas tus consultas previas, fecha, cursos sugeridos y la calificación que otorgaste.

---

### B. Experiencia del Administrador
1. **Acceso**:
   - En `http://localhost:3000/login.html`, haz clic en la pestaña **Administrador** e ingresa con `admin@universidad.edu.co` (`password123`).
2. **Navegación del Panel Administrador**:
   - En el menú lateral se habilitan las herramientas exclusivas de administración:
3. **Sub-panel 1: Analíticas y Métricas Institucionales**:
   - Tarjetas informativas con métricas globales en tiempo real: Total de Estudiantes, Total de Consultas, Promedio de Calificación, Gráficos de distribución de estrellas y Cursos más consultados.
4. **Sub-panel 2: Directorio y Búsqueda de Estudiantes**:
   - **Búsqueda Flexible**: Permite buscar estudiantes ingresando su **Nombre**, **Correo** o **ID numérico**.
   - **Ficha Académica Integrada**: Al seleccionar un estudiante, se despliega su perfil con datos de contacto e historial cronológico completo de consultas RAG y calificaciones emitidas.
   - **Manejo de Errores (HTTP 404)**: Si no existen coincidencias, el sistema muestra un mensaje amigable indicando que no se encontraron resultados.
5. **Sub-panel 3: Configuración del Umbral RAG**:
   - **Ajuste Dinámico del Umbral**: Permite modificar el nivel de exigencia de similitud semántica (entre `0.00` y `1.00`). Cambios aplicados aquí surten efecto inmediato en las siguientes recomendaciones del Asesor.
6. **Sub-panel 4: Gestión y Sincronización de Cursos**:
   - **Crear/Editar Curso**: Incluye campos de código, nombre, nivel, créditos, categoría, descripción extendida y **prerrequisitos**. Al guardar, el backend reindexa el vector en Qdrant de forma automática.
   - **Desactivar Curso**: Al pulsar `Desactivar`, el curso pasa a inactivo en PostgreSQL y **su vector semántico es eliminado de inmediato de Qdrant**.
   - **Reactivar Curso**: Al reactivar el curso, se reindexa en Qdrant en milisegundos.

---

## 9. Arquitectura de Seguridad: JWT + Redis + HttpOnly Cookies

Para garantizar los más rigurosos estándares de seguridad y evitar almacenar tokens en la caché o `localStorage` del navegador:

1. **Emisión y Validación en Servidor**:
   - Al autenticarse con éxito, Spring Boot emite un JWT firmado (HMAC-SHA256) con los claims del usuario.
   - El token se registra en **Redis** (`auth:token:<jwt>`) con un TTL exacto de 24 horas.
2. **Cero Exposición en el Navegador**:
   - El backend transporta el token en una **Cookie con flag `HttpOnly=true`** y `SameSite=Lax`.
   - JavaScript no tiene acceso de lectura a la cookie, por lo que **nunca se almacena en `localStorage`**, blindando el sistema contra ataques XSS.
3. **Filtro de Seguridad (`JwtAuthFilter`)**:
   - En cada petición, Spring Boot extrae el token de la cookie segura y verifica en tiempo real que exista y esté activo en Redis.
4. **Cierre de Sesión Seguro (`POST /api/auth/logout`)**:
   - Destruye la clave en Redis de manera instantánea y expira la cookie en el cliente (`Max-Age=0`). Intentos posteriores con ese token son rechazados con **HTTP 403 Forbidden**.

---

## 10. Sincronización Automática Base Relacional ⟷ Qdrant

El servicio [`QdrantSyncService.java`](backend/src/main/java/com/rutaia/service/QdrantSyncService.java) garantiza la consistencia entre PostgreSQL y la base vectorial:

```
[ POST /api/cursos ] ──────► [ Genera Embedding OpenRouter ] ──► [ PUT /points en Qdrant ]
[ PATCH /desactivar ] ─────► [ Marca inactivo en PostgreSQL ]  ──► [ POST /points/delete en Qdrant ]
[ PATCH /activar ] ────────► [ Marca activo en PostgreSQL ]    ──► [ Recalcula y Reindexa en Qdrant ]
```

- **ID Compartido**: El punto en Qdrant conserva exactamente el mismo identificador numérico que el registro relacional en PostgreSQL.
- **Eliminación Garantizada**: Un curso desactivado deja de existir como vector en Qdrant; n8n nunca lo incluirá en el Top-K semántico.

---

## 11. Matriz de Consultas de Prueba Recomendadas

Puedes ensayar los siguientes casos utilizando el asistente RAG y las funciones del sistema:

| Caso de Prueba | Entrada / Acción | Comportamiento Esperado del Sistema |
| :--- | :--- | :--- |
| **1. Desarrollo Web** | *"Quiero aprender a crear páginas web modernas con frontend y backend."* | Recomienda Fundamentos de HTML5/CSS/JS, React.js y APIs REST con Spring Boot. |
| **2. Inteligencia Artificial** | *"¿Qué cursos tienen para aprender machine learning y redes neuronales?"* | Sugiere Machine Learning con Python, Deep Learning y Modelos del Lenguaje. |
| **3. Análisis de Datos** | *"Me interesa analizar datos y crear reportes empresariales."* | Sugiere Análisis de Datos con Pandas y Power BI. |
| **4. DevOps y Cloud** | *"Quiero aprender a desplegar aplicaciones en contenedores."* | Sugiere Docker, Kubernetes y Cloud Computing. |
| **5. Fuera de Dominio** | *"Quiero aprender cocina italiana y preparar pastas."* | **Similitud < Umbral (0.65)**. Responde *"Sin resultados curriculares aplicables"*. **NO inventa cursos**. |
| **6. Umbral Personalizado** | Cambiar Umbral a `0.85` en Panel Admin y realizar consulta limite | El filtro se vuelve más estricto, descartando asignaturas con afinidad menor a 85%. |
| **7. Búsqueda de Estudiante** | Escribir *"Santiago"* o *"santiago.gomez"* en Panel Admin | Despliega los resultados de coincidencia con ficha detallada e historial. |
| **8. Pregunta Vacía** | *Enviar consulta sin texto* | Validación local y rechazo HTTP 400 antes de invocar a n8n. |
| **9. Alumno Inexistente** | *Buscar `estudiante_fantasma` en panel admin* | Respuesta adecuada HTTP 404 con tarjeta explicativa visual de "No encontrado". |

---

## 12. Estructura del Repositorio

```
proyecto-IA2-SANTIAGO-TOMAS/
├── backend/                              # Backend en Spring Boot 3.4.3
│   ├── src/main/java/com/rutaia/
│   │   ├── config/SecurityConfig.java    # Configuración Spring Security, CORS y Endpoints Protegidos
│   │   ├── controller/                   # Controllers (Auth, Cursos, Estudiantes, Consultas, Configuracion, Estadistica)
│   │   ├── dto/                          # DTOs (UmbralConfigDTO, N8nRecomendacionRequest, CursoDTO, etc.)
│   │   ├── entity/                       # Entidades JPA (Estudiante, Curso, Consulta, Configuracion, Calificacion)
│   │   ├── repository/                   # Repositorios JPA (ConfiguracionRepository, EstudianteRepository, etc.)
│   │   ├── security/                     # JwtUtil y JwtAuthFilter
│   │   └── service/                      # Lógica de negocio (ConfiguracionService, EstadisticaService, QdrantSyncService)
│   ├── src/main/resources/
│   │   └── application.properties        # Configuración DB, Redis, JWT, Qdrant y rag.threshold.default
│   └── build.gradle                      # Dependencias y construcción con Gradle
├── frontend/                             # Aplicación Web Frontend
│   ├── css/
│   │   ├── styles.css                    # Sistema de diseño, modales admin, tarjetas de analíticas
│   │   └── variables.css                 # Paleta de colores, tipografía y tokens CSS
│   ├── js/
│   │   ├── api.js                        # Cliente HTTP REST con endpoints de configuración y estadísticas
│   │   ├── app.js                        # Lógica del dashboard, gráficos de analíticas y eventos
│   │   ├── login.js                      # Controlador de inicio de sesión y registro
│   │   ├── state.js                      # Estado global reactivo de la aplicación
│   │   └── ui.js                         # Renderizado de componentes DOM, modales y tablas
│   ├── index.html                        # Dashboard principal institucional y panel admin
│   ├── login.html                        # Pantalla de acceso split-screen enterprise
│   ├── robots.txt                        # Directivas SEO para indexación
│   └── sitemap.xml                       # Mapa del sitio estructurado
├── database/
│   └── init.sql                          # Esquema DDL + 22 cursos semilla con prerrequisitos
├── docker/
│   ├── docker-compose.yml                # postgres, qdrant, redis, n8n
│   └── .env                              # Variables de entorno de contenedores
├── n8n/
│   └── workflows/
│       ├── indexacion_cursos.json        # Flujo de carga inicial vectorial
│       └── rag_recomendacion.json        # Flujo RAG con evaluación dinámica del umbral
├── scripts/
│   ├── check_health.js                   # Verificación de salud de la infraestructura
│   ├── indexar_cursos.py                 # Script de indexación directa a Qdrant
│   ├── serve_frontend.js                 # Servidor HTTP estático de desarrollo
│   └── test_query_score.js               # Script de prueba de puntuaciones de similitud RAG
├── .env.example                          # Plantilla de variables de entorno
├── .gitignore                            # Archivos excluidos del control de versiones
└── README.md                             # Documentación maestra del proyecto
```

---

## 13. Solución de Problemas Frecuentes (Troubleshooting)

- **Puerto 8080 en uso**: Si al ejecutar `./gradlew bootRun` recibes `Port 8080 was already in use`, termina el proceso que lo ocupa con `netstat -ano | findstr :8080` y `taskkill /PID <PID> /F`.
- **Error de Docker Desktop**: Asegúrate de que Docker Desktop esté encendido antes de correr `docker compose up -d`. Si un contenedor falla, revisa sus logs con `docker logs rutaia_postgres` o `docker logs rutaia_redis`.
- **OpenRouter sin créditos o error 401**: Verifica que tu variable `OPENROUTER_API_KEY` en `.env` tenga créditos disponibles y sea válida.
- **La cookie de sesión no se envía**: Asegúrate de abrir el frontend a través de un servidor HTTP local (`http://localhost:3000`), no abriendo directamente el archivo como `file:///...`, ya que los navegadores restringen las cookies sobre el protocolo de archivo local.
- **El umbral configurado no filtra correctamente**: Comprueba que el workflow `02 RAG Recomendacion de Cursos` en n8n esté activo (`Active`) y reciba el campo `umbralSimilitud` enviado por el backend.

