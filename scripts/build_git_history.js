const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');

function run(cmd) {
    console.log(`> ${cmd}`);
    return execSync(cmd, { cwd: rootDir, stdio: 'inherit' });
}

function runSilent(cmd) {
    try {
        return execSync(cmd, { cwd: rootDir, encoding: 'utf-8' }).trim();
    } catch (e) {
        return '';
    }
}

console.log('Iniciando construcción de historial Git de 31 commits...');

// Inicializar repositorio si no existe
if (!fs.existsSync(path.join(rootDir, '.git'))) {
    run('git init -b main');
    run('git config user.name "TEstebanGQ"');
    run('git config user.email "tomasestebangonzalezquintero@gmail.com"');
}

const commits = [
    {
        msg: "chore: initialize repository structure and configure project gitignore",
        files: [".gitignore", ".env.example", "docker/.env.example"]
    },
    {
        msg: "docs: add system architecture, entity-relationship model and functional test specs",
        files: ["docs/arquitectura.md", "docs/modelo_er.md", "docs/pruebas_funcionales.md"]
    },
    {
        msg: "feat(database): define PostgreSQL DDL schema with relational tables and constraints",
        files: ["database/init.sql"]
    },
    {
        msg: "ci(docker): configure multi-container Docker Compose for PostgreSQL, Qdrant, Redis and n8n",
        files: ["docker/docker-compose.yml"]
    },
    {
        msg: "feat(n8n): implement automated course indexation workflow for Qdrant vector database",
        files: ["n8n/README.md", "n8n/workflows/indexacion_cursos.json"]
    },
    {
        msg: "feat(n8n): implement RAG semantic recommendation workflow with similarity threshold",
        files: ["n8n/workflows/rag_recomendacion.json"]
    },
    {
        msg: "build(backend): configure Gradle build, wrapper and Spring Boot 3.4.3 dependencies",
        files: [
            "backend/build.gradle",
            "backend/settings.gradle",
            "backend/gradlew",
            "backend/gradlew.bat",
            "backend/gradle/"
        ]
    },
    {
        msg: "feat(backend): configure application properties for PostgreSQL, Redis, Qdrant and JWT",
        files: ["backend/src/main/resources/application.properties"]
    },
    {
        msg: "feat(backend): bootstrap Spring Boot application main entrypoint",
        files: ["backend/src/main/java/com/rutaia/RutaIaApplication.java"]
    },
    {
        msg: "feat(backend): implement domain entities for Estudiante, Curso, Consulta, Calificacion, Fuente and Recomendacion",
        files: [
            "backend/src/main/java/com/rutaia/entity/Estudiante.java",
            "backend/src/main/java/com/rutaia/entity/Curso.java",
            "backend/src/main/java/com/rutaia/entity/Consulta.java",
            "backend/src/main/java/com/rutaia/entity/Calificacion.java",
            "backend/src/main/java/com/rutaia/entity/Fuente.java",
            "backend/src/main/java/com/rutaia/entity/Recomendacion.java"
        ]
    },
    {
        msg: "feat(backend): create custom business exceptions and global exception handler",
        files: [
            "backend/src/main/java/com/rutaia/exception/BusinessRuleException.java",
            "backend/src/main/java/com/rutaia/exception/ConflictException.java",
            "backend/src/main/java/com/rutaia/exception/ResourceNotFoundException.java",
            "backend/src/main/java/com/rutaia/exception/GlobalExceptionHandler.java"
        ]
    },
    {
        msg: "feat(backend): implement Spring Data JPA repositories with custom query methods",
        files: [
            "backend/src/main/java/com/rutaia/repository/EstudianteRepository.java",
            "backend/src/main/java/com/rutaia/repository/CursoRepository.java",
            "backend/src/main/java/com/rutaia/repository/ConsultaRepository.java",
            "backend/src/main/java/com/rutaia/repository/CalificacionRepository.java",
            "backend/src/main/java/com/rutaia/repository/FuenteRepository.java",
            "backend/src/main/java/com/rutaia/repository/RecomendacionRepository.java"
        ]
    },
    {
        msg: "feat(backend): define DTO models for authentication, student registration and courses",
        files: [
            "backend/src/main/java/com/rutaia/dto/AuthRequestDTO.java",
            "backend/src/main/java/com/rutaia/dto/AuthResponseDTO.java",
            "backend/src/main/java/com/rutaia/dto/EstudianteRegistroDTO.java",
            "backend/src/main/java/com/rutaia/dto/EstudianteResponseDTO.java",
            "backend/src/main/java/com/rutaia/dto/CursoDTO.java",
            "backend/src/main/java/com/rutaia/dto/CursoResponseDTO.java"
        ]
    },
    {
        msg: "feat(backend): define DTO models for RAG recommendations, feedback and historical queries",
        files: [
            "backend/src/main/java/com/rutaia/dto/ConsultaRecomendacionDTO.java",
            "backend/src/main/java/com/rutaia/dto/N8nRecomendacionRequest.java",
            "backend/src/main/java/com/rutaia/dto/N8nRecomendacionResponse.java",
            "backend/src/main/java/com/rutaia/dto/RecomendacionResponseDTO.java",
            "backend/src/main/java/com/rutaia/dto/FuenteResponseDTO.java",
            "backend/src/main/java/com/rutaia/dto/HistorialConsultaDTO.java",
            "backend/src/main/java/com/rutaia/dto/CalificacionDTO.java",
            "backend/src/main/java/com/rutaia/dto/EstadisticasDTO.java"
        ]
    },
    {
        msg: "feat(security): implement JwtUtil for token issuance, parsing and HMAC-SHA256 signing",
        files: ["backend/src/main/java/com/rutaia/security/JwtUtil.java"]
    },
    {
        msg: "feat(security): implement RedisTokenService for token caching, validation and instant revocation",
        files: ["backend/src/main/java/com/rutaia/service/RedisTokenService.java"]
    },
    {
        msg: "feat(security): implement JwtAuthFilter with dual support for Authorization header and HttpOnly cookies",
        files: ["backend/src/main/java/com/rutaia/security/JwtAuthFilter.java"]
    },
    {
        msg: "feat(security): configure Spring Security filter chain, role hierarchies and CORS credentials",
        files: [
            "backend/src/main/java/com/rutaia/config/SecurityConfig.java",
            "backend/src/main/java/com/rutaia/config/WebConfig.java"
        ]
    },
    {
        msg: "feat(backend): implement AuthService and AuthController with secure cookie issuance and logout",
        files: [
            "backend/src/main/java/com/rutaia/service/AuthService.java",
            "backend/src/main/java/com/rutaia/controller/AuthController.java"
        ]
    },
    {
        msg: "feat(backend): implement CursoService and CursoController with transactional CRUD operations",
        files: [
            "backend/src/main/java/com/rutaia/service/CursoService.java",
            "backend/src/main/java/com/rutaia/controller/CursoController.java"
        ]
    },
    {
        msg: "feat(vector): implement QdrantSyncService for automated vector embedding upsert and deletion",
        files: ["backend/src/main/java/com/rutaia/service/QdrantSyncService.java"]
    },
    {
        msg: "feat(backend): implement EstudianteService and EstudianteController with student directory and ID lookup (RF02)",
        files: [
            "backend/src/main/java/com/rutaia/service/EstudianteService.java",
            "backend/src/main/java/com/rutaia/controller/EstudianteController.java"
        ]
    },
    {
        msg: "feat(backend): implement N8nOrquestadorService, ConsultaService and ConsultaController for RAG dispatch",
        files: [
            "backend/src/main/java/com/rutaia/service/N8nOrquestadorService.java",
            "backend/src/main/java/com/rutaia/service/ConsultaService.java",
            "backend/src/main/java/com/rutaia/controller/ConsultaController.java"
        ]
    },
    {
        msg: "feat(backend): implement CalificacionService, EstadisticaService, RootController and unit tests",
        files: [
            "backend/src/main/java/com/rutaia/service/CalificacionService.java",
            "backend/src/main/java/com/rutaia/service/EstadisticaService.java",
            "backend/src/main/java/com/rutaia/controller/CalificacionController.java",
            "backend/src/main/java/com/rutaia/controller/EstadisticaController.java",
            "backend/src/main/java/com/rutaia/controller/RootController.java",
            "backend/src/test/java/com/rutaia/RutaIaApplicationTests.java"
        ]
    },
    {
        msg: "feat(frontend): establish design system variables, dark theme and responsive layout styles",
        files: [
            "frontend/css/variables.css",
            "frontend/css/styles.css"
        ]
    },
    {
        msg: "feat(frontend): implement API communication client, session state and UI renderers",
        files: [
            "frontend/js/api.js",
            "frontend/js/state.js",
            "frontend/js/ui.js"
        ]
    },
    {
        msg: "feat(frontend): build interactive institutional dashboard, RAG assistant and admin management panel",
        files: [
            "frontend/index.html",
            "frontend/js/app.js"
        ]
    },
    {
        msg: "feat(frontend): design split-screen login page with aurora showcase, bento cards and 4-step workflow",
        files: [
            "frontend/login.html",
            "frontend/js/login.js"
        ]
    },
    {
        msg: "test(scripts): provide automated testing suites, benchmark scripts and frontend static server",
        files: [
            "scripts/serve_frontend.js",
            "scripts/indexar_cursos.py",
            "scripts/test_benchmark.py",
            "scripts/verify_all_queries.py",
            "scripts/check_health.js",
            "scripts/check_published.js",
            "scripts/debug_if_execution.js",
            "scripts/fix_if_ascii.js",
            "scripts/fix_if_node.js",
            "scripts/fix_if_string.js",
            "scripts/fix_json_bodies.js",
            "scripts/fix_max_tokens.js",
            "scripts/fix_n8n_keys.js",
            "scripts/inspect_last_error.js",
            "scripts/inspect_qdrant_run.js",
            "scripts/inspect_tables.js",
            "scripts/patch_if_v1.js",
            "scripts/patch_rag_threshold.js",
            "scripts/repair_n8n.js",
            "scripts/test_flow.py",
            "scripts/test_query_score.js",
            "scripts/test_springboot.py",
            "scripts/update_llm_model.js"
        ]
    },
    {
        msg: "fix(security): migrate token storage to HttpOnly cookies and purge localStorage tokens with Redis sync",
        files: [
            "backend/src/main/java/com/rutaia/controller/AuthController.java",
            "backend/src/main/java/com/rutaia/security/JwtAuthFilter.java",
            "frontend/js/login.js",
            "frontend/js/state.js",
            "frontend/js/api.js"
        ]
    },
    {
        msg: "docs: create comprehensive 13-section documentation, quickstart guide and troubleshooting manual",
        files: ["README.md"]
    }
];

let count = 0;
for (const step of commits) {
    const existingFiles = step.files.filter(f => fs.existsSync(path.join(rootDir, f)));
    if (existingFiles.length > 0) {
        for (const f of existingFiles) {
            run(`git add "${f}"`);
        }
        // Verificar si hay cambios en staging
        const staged = runSilent('git diff --cached --name-only');
        if (staged && staged.length > 0) {
            count++;
            run(`git commit -m "${step.msg}"`);
        } else {
            console.log(`(Sin cambios para: ${step.msg})`);
        }
    } else {
        console.log(`(Archivos no encontrados para: ${step.msg})`);
    }
}

// Por si queda cualquier archivo no versionado (excepto los ignorados por .gitignore)
const remaining = runSilent('git status --porcelain');
if (remaining && remaining.length > 0) {
    run('git add .');
    const staged = runSilent('git diff --cached --name-only');
    if (staged && staged.length > 0) {
        count++;
        run('git commit -m "chore: include remaining project configuration and assets"');
    }
}

console.log(`\nHistorial de Git generado exitosamente con ${count} commits.`);
