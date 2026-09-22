-- ==========================================================
-- SISTEMA INTELIGENTE DE ORIENTACIÓN ACADÉMICA - RUTAIA
-- Script de Creación del Esquema y Datos Semilla
-- Compatible con PostgreSQL 16
-- ==========================================================

-- Limpieza si existen tablas previas
DROP TABLE IF EXISTS calificaciones CASCADE;
DROP TABLE IF EXISTS fuentes CASCADE;
DROP TABLE IF EXISTS recomendaciones CASCADE;
DROP TABLE IF EXISTS consultas CASCADE;
DROP TABLE IF EXISTS cursos CASCADE;
DROP TABLE IF EXISTS estudiantes CASCADE;

-- ----------------------------------------------------------
-- 1. TABLA: estudiantes (RF 01, RF 02)
-- ----------------------------------------------------------
CREATE TABLE estudiantes (
    id BIGSERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    correo_electronico VARCHAR(150) UNIQUE NOT NULL,
    nivel_experiencia VARCHAR(30) NOT NULL CHECK (nivel_experiencia IN ('Principiante', 'Intermedio', 'Avanzado')),
    area_interes VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_estudiantes_correo ON estudiantes(correo_electronico);

-- ----------------------------------------------------------
-- 2. TABLA: cursos (RF 03, RF 04)
-- ----------------------------------------------------------
CREATE TABLE cursos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    nivel VARCHAR(30) NOT NULL CHECK (nivel IN ('Básico', 'Intermedio', 'Avanzado')),
    duracion_horas INT NOT NULL CHECK (duracion_horas > 0),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_cursos_activo_categoria ON cursos(activo, categoria);
CREATE INDEX idx_cursos_nivel ON cursos(nivel);

-- ----------------------------------------------------------
-- 3. TABLA: consultas (RF 07, RF 08)
-- ----------------------------------------------------------
CREATE TABLE consultas (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
    pregunta TEXT NOT NULL,
    fecha TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado VARCHAR(30) NOT NULL CHECK (estado IN ('Pendiente', 'Respondida', 'Sin resultados', 'Error'))
);

CREATE INDEX idx_consultas_estudiante ON consultas(estudiante_id);
CREATE INDEX idx_consultas_estado ON consultas(estado);

-- ----------------------------------------------------------
-- 4. TABLA: recomendaciones (RF 13, RF 14)
-- ----------------------------------------------------------
CREATE TABLE recomendaciones (
    id BIGSERIAL PRIMARY KEY,
    consulta_id BIGINT UNIQUE NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
    respuesta_texto TEXT NOT NULL,
    fecha TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado VARCHAR(30) NOT NULL
);

CREATE INDEX idx_recomendaciones_consulta ON recomendaciones(consulta_id);

-- ----------------------------------------------------------
-- 5. TABLA: fuentes (RF 14, RF 15)
-- ----------------------------------------------------------
CREATE TABLE fuentes (
    id BIGSERIAL PRIMARY KEY,
    recomendacion_id BIGINT NOT NULL REFERENCES recomendaciones(id) ON DELETE CASCADE,
    curso_id BIGINT NOT NULL REFERENCES cursos(id) ON DELETE RESTRICT,
    similitud_score NUMERIC(5, 4) NOT NULL CHECK (similitud_score >= 0 AND similitud_score <= 1),
    CONSTRAINT uq_recomendacion_curso UNIQUE (recomendacion_id, curso_id)
);

CREATE INDEX idx_fuentes_recomendacion ON fuentes(recomendacion_id);
CREATE INDEX idx_fuentes_curso ON fuentes(curso_id);

-- ----------------------------------------------------------
-- 6. TABLA: calificaciones (RF 17)
-- ----------------------------------------------------------
CREATE TABLE calificaciones (
    id BIGSERIAL PRIMARY KEY,
    recomendacion_id BIGINT UNIQUE NOT NULL REFERENCES recomendaciones(id) ON DELETE CASCADE,
    puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT NULL,
    fecha TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_calificaciones_recomendacion ON calificaciones(recomendacion_id);

-- ==========================================================
-- DATOS SEMILLA (SEED DATA)
-- Mínimo 20 cursos con descripciones enriquecidas para RAG
-- ==========================================================

INSERT INTO cursos (nombre, descripcion, categoria, nivel, duracion_horas, activo) VALUES
(
    'Fundamentos de Creación de Páginas Web con HTML5, CSS3 y JavaScript',
    'Aprende a crear páginas web desde cero utilizando los estándares modernos de la web. Domina la semántica de HTML5, maquetación profesional con Flexbox y CSS Grid, diseño responsivo para dispositivos móviles, y fundamentos de JavaScript para añadir interactividad, eventos en el DOM y consumo de APIs básicas.',
    'Desarrollo Web',
    'Básico',
    40,
    TRUE
),
(
    'Desarrollo Frontend Moderno con React, TypeScript y Tailwind CSS',
    'Construye aplicaciones web interactivas y dinámicas de una sola página (SPA). Profundiza en componentes basados en funciones, hooks avanzados, gestión de estado global, tipado estricto con TypeScript, estilos ágiles con Tailwind CSS y mejores prácticas de arquitectura frontend.',
    'Desarrollo Web',
    'Intermedio',
    50,
    TRUE
),
(
    'Programación Orientada a Objetos y Algoritmia con Java 21',
    'Domina el lenguaje Java desde los conceptos elementales hasta características modernas de Java 21 como virtual threads, pattern matching y record classes. Aprende encapsulamiento, herencia, polimorfismo, manejo de colecciones, programación funcional con Streams y pruebas unitarias con JUnit.',
    'Programación',
    'Básico',
    60,
    TRUE
),
(
    'Desarrollo de Servicios Backend y APIs REST con Spring Boot',
    'Especialízate en construir APIs REST seguras, escalables y mantenibles en Java utilizando el ecosistema Spring Boot 3. Cubre inyección de dependencias, persistencia con Spring Data JPA y Hibernate, validación con Jakarta Validation, seguridad con Spring Security, documentación con Swagger y pruebas de integración.',
    'Programación',
    'Intermedio',
    65,
    TRUE
),
(
    'Modelado y Gestión Avanzada de Bases de Datos Relacionales con PostgreSQL',
    'Domina el diseño y administración de bases de datos relacionales SQL con PostgreSQL. Aprende diseño entidad-relación, normalización, escritura de consultas complejas con JOINs y CTEs, indexación para optimización de rendimiento, transacciones ACID, procedimientos almacenados y triggers.',
    'Bases de Datos',
    'Intermedio',
    45,
    TRUE
),
(
    'Bases de Datos NoSQL y Bases de Datos Vectoriales para Inteligencia Artificial',
    'Explora bases de datos modernas orientadas a documentos (MongoDB) y bases de datos vectoriales como Qdrant y Pinecone. Aprende cómo almacenar, indexar y buscar representaciones vectoriales (embeddings) para alimentar aplicaciones de búsqueda semántica y arquitecturas RAG.',
    'Bases de Datos',
    'Avanzado',
    40,
    TRUE
),
(
    'Análisis de Datos Exploratorio y Visualización con Python y Pandas',
    'Aprende a analizar conjuntos de datos del mundo real utilizando Python. Domina las librerías fundamentales NumPy y Pandas para limpieza y transformación de datos, y Matplotlib y Seaborn para crear gráficos e identificar patrones, correlaciones y tendencias estadísticas.',
    'Análisis de Datos',
    'Básico',
    45,
    TRUE
),
(
    'Construcción de Dashboards Empresariales y Business Intelligence con Power BI',
    'Transforma datos empresariales en dashboards interactivos y reportes visuales de alto impacto con Microsoft Power BI. Domina Power Query para extracción y transformación (ETL), modelado en estrella, lenguaje DAX para cálculos analíticos avanzados y publicación de paneles ejecutivos.',
    'Análisis de Datos',
    'Intermedio',
    35,
    TRUE
),
(
    'Automatización de Flujos de Trabajo y Procesos de Negocio con n8n',
    'Aprende a diseñar y desplegar automatizaciones complejas sin código y con bajo código utilizando n8n. Integra servicios web mediante webhooks, APIs REST, bases de datos y agentes de inteligencia artificial para orquestar tareas repetitivas y optimizar procesos organizacionales.',
    'Automatización',
    'Básico',
    30,
    TRUE
),
(
    'Automatización Robótica de Procesos (RPA) y Scripting Empresarial con Python',
    'Automatiza tareas operativas empresariales en el sistema operativo, navegador web y archivos Excel/PDF utilizando Python. Aprende a utilizar bibliotecas como Selenium, Playwright, OpenPyXL y schedule para liberar tiempo y erradicar errores humanos en tareas administrativas.',
    'Automatización',
    'Intermedio',
    45,
    TRUE
),
(
    'Introducción al Aprendizaje Automático y Machine Learning con Scikit-Learn',
    'Inicia tu camino en el mundo de la inteligencia artificial construyendo modelos predictivos. Aprende algoritmos supervisados de regresión y clasificación (árboles de decisión, regresión logística, random forest), evaluación de métricas y preprocesamiento de datos con Scikit-Learn en Python.',
    'Inteligencia Artificial',
    'Intermedio',
    55,
    TRUE
),
(
    'Inteligencia Artificial Generativa, Modelos LLM y Arquitecturas RAG',
    'Aprende a desarrollar soluciones de inteligencia artificial de vanguardia integrando Modelos de Lenguaje Grande (LLMs). Explora ingeniería de prompts, generación de embeddings vectoriales, búsqueda semántica y construcción de sistemas RAG (Retrieval-Augmented Generation) para responder preguntas sobre documentación privada.',
    'Inteligencia Artificial',
    'Avanzado',
    60,
    TRUE
),
(
    'Visión por Computadora y Deep Learning con PyTorch',
    'Diseña y entrena redes neuronales convolucionales (CNN) y transformers para tareas de visión artificial. Domina la clasificación de imágenes, detección de objetos y segmentación con PyTorch, OpenCV y modelos preentrenados de última generación.',
    'Inteligencia Artificial',
    'Avanzado',
    60,
    TRUE
),
(
    'Ciberseguridad y Protección de Aplicaciones Web: OWASP Top 10',
    'Aprende a identificar, mitigar y proteger sistemas web contra las vulnerabilidades más comunes según OWASP. Cubre inyección SQL, Cross-Site Scripting (XSS), autenticación rota, exposición de datos sensibles y aplicación de buenas prácticas de programación defensiva.',
    'Ciberseguridad',
    'Intermedio',
    40,
    TRUE
),
(
    'Seguridad Ofensiva, Hacking Ético y Pruebas de Penetración',
    'Desarrolla habilidades para auditar infraestructuras y aplicaciones desde la perspectiva de un atacante ético. Aprende fases de reconocimiento, escaneo con Nmap, explotación de vulnerabilidades con Metasploit y elaboración de reportes ejecutivos de remediación.',
    'Ciberseguridad',
    'Avanzado',
    50,
    TRUE
),
(
    'Despliegue y Orquestación de Aplicaciones con Docker y Contenedores',
    'Aprende a empaquetar, distribuir y ejecutar aplicaciones de software en entornos aislados y reproducibles con Docker. Domina la creación de Dockerfiles eficientes, orquestación de múltiples servicios con Docker Compose, gestión de volúmenes, redes y mejores prácticas de seguridad en contenedores.',
    'DevOps y Cloud',
    'Básico',
    40,
    TRUE
),
(
    'Orquestación de Contenedores a Escala Empresarial con Kubernetes',
    'Lleva tus contenedores a producción masiva utilizando Kubernetes. Aprende a administrar pods, deployments, services, ingress controllers, autoescalado horizontal (HPA) y monitoreo en clústeres de alta disponibilidad.',
    'DevOps y Cloud',
    'Avanzado',
    55,
    TRUE
),
(
    'Integración y Despliegue Continuo (CI/CD) con GitHub Actions',
    'Automatiza el ciclo de vida del software construyendo pipelines de Integración Continua y Despliegue Continuo (CI/CD). Aprende a ejecutar pruebas automáticas, compilar artefactos, analizar código estático y desplegar automáticamente en la nube ante cada commit.',
    'DevOps y Cloud',
    'Intermedio',
    35,
    TRUE
),
(
    'Desarrollo de Aplicaciones Móviles Multiplataforma con Flutter y Dart',
    'Crea aplicaciones móviles nativas y elegantes para Android e iOS desde una única base de código utilizando el SDK de Flutter y el lenguaje Dart. Domina widgets reactivos, navegación, consumo de APIs REST y almacenamiento local.',
    'Desarrollo Móvil',
    'Intermedio',
    50,
    TRUE
),
(
    'Ingeniería de Pruebas de Software y QA: Automatización con Selenium y JUnit',
    'Garantiza la calidad del software en proyectos profesionales. Aprende a diseñar planes de prueba, implementar pruebas unitarias y de integración con JUnit 5 y Mockito, y automatizar pruebas funcionales de interfaz de usuario con Selenium WebDriver.',
    'Calidad de Software',
    'Intermedio',
    40,
    TRUE
),
(
    'Desarrollo de Microservicios Distribuidos y Mensajería con RabbitMQ y Kafka',
    'Diseña arquitecturas backend desacopladas y de alta concurrencia mediante el patrón de microservicios. Aprende patrones de comunicación síncrona y asíncrona basada en eventos utilizando brokers de mensajería como RabbitMQ y Apache Kafka.',
    'Programación',
    'Avanzado',
    55,
    TRUE
),
(
    'Computación en la Nube y Arquitectura Serverless en AWS',
    'Diseña e implementa soluciones elásticas en la nube de Amazon Web Services (AWS). Domina servicios principales como EC2, S3, RDS, funciones Serverless con AWS Lambda, API Gateway y arquitectura orientada a eventos en la nube.',
    'DevOps y Cloud',
    'Intermedio',
    45,
    TRUE
);

-- ----------------------------------------------------------
-- ESTUDIANTES SEMILLA (Mínimo 10 estudiantes para pruebas)
-- ----------------------------------------------------------
INSERT INTO estudiantes (id, nombre_completo, correo_electronico, nivel_experiencia, area_interes) VALUES
(1, 'Santiago Gómez Morales', 'santiago.gomez@universidad.edu.co', 'Principiante', 'Desarrollo Web'),
(2, 'Tomás Restrepo Valderrama', 'tomas.restrepo@universidad.edu.co', 'Intermedio', 'Inteligencia Artificial'),
(3, 'Mariana López Cadavid', 'mariana.lopez@universidad.edu.co', 'Avanzado', 'DevOps y Cloud'),
(4, 'Alejandro Martínez Ruiz', 'alejandro.martinez@universidad.edu.co', 'Principiante', 'Programación'),
(5, 'Camila Valencia Herrera', 'camila.valencia@universidad.edu.co', 'Intermedio', 'Análisis de Datos'),
(6, 'Daniel Fernando Osorio', 'daniel.osorio@universidad.edu.co', 'Avanzado', 'Ciberseguridad'),
(7, 'Valentina Castro Morales', 'valentina.castro@universidad.edu.co', 'Intermedio', 'Automatización'),
(8, 'Mateo Ramírez Salazar', 'mateo.ramirez@universidad.edu.co', 'Principiante', 'Desarrollo Web'),
(9, 'Isabella Jaramillo Cruz', 'isabella.jaramillo@universidad.edu.co', 'Intermedio', 'Desarrollo Móvil'),
(10, 'Sebastián Pineda Correa', 'sebastian.pineda@universidad.edu.co', 'Avanzado', 'Bases de Datos');

SELECT setval('estudiantes_id_seq', (SELECT MAX(id) FROM estudiantes));

-- ----------------------------------------------------------
-- 10 CONSULTAS DE PRUEBA OBLIGATORIAS (RF 07, RF 08)
-- ----------------------------------------------------------
INSERT INTO consultas (id, estudiante_id, pregunta, estado, fecha) VALUES
(1, 1, 'Quiero aprender a crear páginas web.', 'Respondida', NOW() - INTERVAL '5 days'),
(2, 4, 'Necesito aprender Java para trabajar con Spring Boot.', 'Respondida', NOW() - INTERVAL '4 days 18 hours'),
(3, 5, 'Me interesa analizar datos y construir dashboards.', 'Respondida', NOW() - INTERVAL '4 days 2 hours'),
(4, 7, 'Quiero automatizar procesos empresariales.', 'Respondida', NOW() - INTERVAL '3 days 12 hours'),
(5, 2, '¿Qué puedo estudiar para trabajar con inteligencia artificial?', 'Respondida', NOW() - INTERVAL '3 days 1 hour'),
(6, 6, 'Quiero aprender a proteger aplicaciones web.', 'Respondida', NOW() - INTERVAL '2 days 15 hours'),
(7, 3, 'Necesito desplegar aplicaciones usando contenedores.', 'Respondida', NOW() - INTERVAL '2 days 4 hours'),
(8, 8, 'Quiero aprender cocina italiana.', 'Sin resultados', NOW() - INTERVAL '1 day 20 hours'),
(9, 9, '¿Cómo puedo iniciarme en el desarrollo de aplicaciones para teléfonos móviles?', 'Respondida', NOW() - INTERVAL '1 day 8 hours'),
(10, 10, '¿Qué cursos me recomiendan para profundizar en diseño y optimización de bases de datos?', 'Respondida', NOW() - INTERVAL '5 hours');

SELECT setval('consultas_id_seq', (SELECT MAX(id) FROM consultas));

-- ----------------------------------------------------------
-- RECOMENDACIONES GENERADAS POR EL SISTEMA RAG (RF 13, RF 14)
-- ----------------------------------------------------------
INSERT INTO recomendaciones (id, consulta_id, respuesta_texto, estado, fecha) VALUES
(1, 1, 'Para aprender a crear páginas web desde las bases hasta un nivel profesional, te recomendamos una ruta progresiva iniciando con "Fundamentos de Creación de Páginas Web con HTML5, CSS3 y JavaScript", donde dominarás estructura, estilos responsivos e interactividad en el navegador. Posteriormente, puedes continuar con "Desarrollo Frontend Moderno con React, TypeScript y Tailwind CSS" para aprender a construir aplicaciones interactivas de una sola página con las herramientas más demandadas de la industria.', 'Respondida', NOW() - INTERVAL '5 days'),

(2, 2, 'Para alcanzar tu objetivo de desarrollar con Spring Boot, la ruta académica ideal comienza con "Programación Orientada a Objetos y Algoritmia con Java 21", donde afianzarás conceptos esenciales como clases, herencia, colecciones y características modernas del lenguaje. Una vez consolidada la base, podrás abordar con éxito el curso "Desarrollo de Servicios Backend y APIs REST con Spring Boot", enfocado en persistencia con JPA, seguridad y creación de microservicios robustos.', 'Respondida', NOW() - INTERVAL '4 days 18 hours'),

(3, 3, 'Si tu meta es el análisis de información y la visualización empresarial, te sugerimos iniciar con "Análisis de Datos Exploratorio y Visualización con Python y Pandas" para adquirir habilidades en limpieza, manipulación estadística y gráficos exploratorios. Complementa esta formación con "Construcción de Dashboards Empresariales y Business Intelligence con Power BI", que te permitirá diseñar reportes ejecutivos e interactivos de alto impacto para la toma de decisiones.', 'Respondida', NOW() - INTERVAL '4 days 2 hours'),

(4, 4, 'Para la optimización y automatización de flujos organizacionales, te recomendamos cursar "Automatización de Flujos de Trabajo y Procesos de Negocio con n8n", ideal para orquestar integraciones entre APIs y servicios sin fricción. Además, el curso "Automatización Robótica de Procesos (RPA) y Scripting Empresarial con Python" te permitirá programar bots que interactúan con navegadores y documentos administrativos.', 'Respondida', NOW() - INTERVAL '3 days 12 hours'),

(5, 5, 'Para formarte de manera integral en Inteligencia Artificial, te sugerimos una secuencia especializada: inicia con "Introducción al Aprendizaje Automático y Machine Learning con Scikit-Learn" para dominar algoritmos predictivos tradicionales. Luego avanza a "Inteligencia Artificial Generativa, Modelos LLM y Arquitecturas RAG" para crear soluciones con modelos de lenguaje y bases vectoriales, y finaliza con "Visión por Computadora y Deep Learning con PyTorch" para dominar redes neuronales profundas.', 'Respondida', NOW() - INTERVAL '3 days 1 hour'),

(6, 6, 'Para especializarte en seguridad de software, te recomendamos el curso "Ciberseguridad y Protección de Aplicaciones Web: OWASP Top 10", donde aprenderás a prevenir las vulnerabilidades más críticas en la web. Para complementar con un enfoque práctico defensivo y ofensivo, te recomendamos "Seguridad Ofensiva, Hacking Ético y Pruebas de Penetración".', 'Respondida', NOW() - INTERVAL '2 days 15 hours'),

(7, 7, 'Para el despliegue con contenedores y DevOps, tu punto de partida esencial es "Despliegue y Orquestación de Aplicaciones con Docker y Contenedores", que te enseñará aislamiento y reproducibilidad. Posteriormente, avanza a "Orquestación de Contenedores a Escala Empresarial con Kubernetes" para gestionar clústeres en alta disponibilidad y escalado automático.', 'Respondida', NOW() - INTERVAL '2 days 4 hours'),

(8, 8, 'No encontramos cursos en nuestro catálogo institucional que coincidan suficientemente con tu búsqueda ("Quiero aprender cocina italiana."). Te invitamos a consultar el catálogo completo de tecnología o buscar términos relacionados con programación, desarrollo web, ciencia de datos, ciberseguridad o inteligencia artificial.', 'Sin resultados', NOW() - INTERVAL '1 day 20 hours'),

(9, 9, 'Para ingresar al ecosistema móvil, te recomendamos "Desarrollo de Aplicaciones Móviles Multiplataforma con Flutter y Dart". Con este curso dominarás la creación de aplicaciones nativas de alto rendimiento para Android e iOS a partir de un único código base, gestionando estados, interfaces atractivas y consumo de servicios web.', 'Respondida', NOW() - INTERVAL '1 day 8 hours'),

(10, 10, 'Para dominar bases de datos a profundidad, te recomendamos "Modelado y Gestión Avanzada de Bases de Datos Relacionales con PostgreSQL", cubriendo indexación, optimización de consultas y transacciones ACID. Asimismo, para arquitecturas modernas de inteligencia artificial, el curso "Bases de Datos NoSQL y Bases de Datos Vectoriales para Inteligencia Artificial" te preparará para gestionar almacenes documentales y vectores semánticos.', 'Respondida', NOW() - INTERVAL '5 hours');

SELECT setval('recomendaciones_id_seq', (SELECT MAX(id) FROM recomendaciones));

-- ----------------------------------------------------------
-- FUENTES VINCULADAS CON SCORE DE SIMILITUD (RF 14, RF 15)
-- ----------------------------------------------------------
INSERT INTO fuentes (recomendacion_id, curso_id, similitud_score) VALUES
-- Consulta 1 (Web)
(1, 1, 0.8842),
(1, 2, 0.7931),
-- Consulta 2 (Java / Spring)
(2, 3, 0.8915),
(2, 4, 0.8760),
-- Consulta 3 (Datos / BI)
(3, 7, 0.8654),
(3, 8, 0.8420),
-- Consulta 4 (Automatización / n8n / RPA)
(4, 9, 0.8710),
(4, 10, 0.8355),
-- Consulta 5 (IA / ML / RAG)
(5, 11, 0.8920),
(5, 12, 0.8814),
(5, 13, 0.8250),
-- Consulta 6 (Ciberseguridad)
(6, 14, 0.8890),
(6, 15, 0.8145),
-- Consulta 7 (Docker / Kubernetes)
(7, 16, 0.9012),
(7, 17, 0.8630),
-- Consulta 9 (Móvil Flutter)
(9, 19, 0.8875),
-- Consulta 10 (PostgreSQL / Vector DB)
(10, 5, 0.8790),
(10, 6, 0.8410);

-- ----------------------------------------------------------
-- 5 CALIFICACIONES DE ESTUDIANTES (RF 17)
-- ----------------------------------------------------------
INSERT INTO calificaciones (recomendacion_id, puntuacion, comentario, fecha) VALUES
(1, 5, 'Excelente recomendación, la ruta entre HTML/JS y React tiene una secuencia muy lógica y clara.', NOW() - INTERVAL '4 days 22 hours'),
(2, 5, 'Me aclaró exactamente que debía aprender primero Java 21 antes de meterme de lleno a Spring Boot.', NOW() - INTERVAL '4 days 10 hours'),
(3, 4, 'Muy buena sugerencia de Power BI y Python, justo lo que necesitaba para mi perfil de analista.', NOW() - INTERVAL '3 days 18 hours'),
(5, 5, 'La articulación entre Machine Learning tradicional y modelos RAG generativos fue sumamente acertada.', NOW() - INTERVAL '2 days 20 hours'),
(7, 5, 'Muy precisa la relación entre Docker y Kubernetes para comenzar a desplegar microservicios.', NOW() - INTERVAL '1 day 15 hours');

SELECT setval('calificaciones_id_seq', (SELECT MAX(id) FROM calificaciones));

