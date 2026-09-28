# Puesta en marcha local: Windows y Linux

Esta guía inicia RutaIA completa en una sola máquina: PostgreSQL, Redis, Qdrant, n8n, backend Spring Boot y frontend. Ejecuta los comandos desde la raíz del repositorio, salvo que se indique otra ruta.

> Puertos actuales: frontend `3000`, backend `8080`, PostgreSQL `5432`, Redis `6379`, Qdrant `6335` y n8n `5679`.

## 1. Requisitos

| Componente | Windows | Linux |
| --- | --- | --- |
| Git | [Git for Windows](https://git-scm.com/download/win) | `sudo apt install git` |
| Docker Compose | Docker Desktop, con motor Linux iniciado | Docker Engine y plugin Compose |
| Node.js | Node.js LTS 18 o superior | Node.js 18 o superior |

Comprueba las instalaciones:

```powershell
# Windows (PowerShell)
git --version
docker --version
docker compose version
node --version
```

```bash
# Linux
git --version
docker --version
docker compose version
node --version
```

Java 17 solo hace falta si ejecutarás el backend directamente con Gradle; el método recomendado lo ejecuta dentro de Docker. En Windows abre Docker Desktop y espera a que el motor esté activo. En Linux, inicia Docker:

```bash
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER" # cierra sesión y vuelve a entrar después
```

## 2. Obtener el proyecto

```bash
git clone <URL_DEL_REPOSITORIO>
cd proyecto-ia2-santiago-tomas
```

## 3. Configurar las credenciales de IA

Docker Compose lee las variables de **`docker/.env`**, no el archivo `.env` de la raíz. Este archivo está ignorado por Git y no debe compartirse.

```powershell
# Windows (PowerShell)
Copy-Item docker/.env.example docker/.env
notepad docker/.env
```

```bash
# Linux
cp docker/.env.example docker/.env
nano docker/.env
```

Completa como mínimo estas dos variables con tus claves:

```env
OPENROUTER_API_KEY=tu_clave_de_openrouter
GEMINI_API_KEY=tu_clave_de_gemini
```

Si modificas el archivo después de iniciar n8n, recarga sus variables recreándolo:

```bash
docker compose -f docker/docker-compose.yml up -d --force-recreate n8n
```

## 4. Iniciar todos los contenedores

Este modo recomendado inicia infraestructura y backend:

```powershell
# Windows
docker compose -f docker/docker-compose.yml --profile full up -d --build
docker compose -f docker/docker-compose.yml ps
```

```bash
# Linux
docker compose -f docker/docker-compose.yml --profile full up -d --build
docker compose -f docker/docker-compose.yml ps
```

La primera ejecución puede tardar varios minutos al descargar imágenes y construir el backend. Espera a que PostgreSQL esté `healthy` y los demás estén `Up`.

| Servicio | Contenedor | Dirección |
| --- | --- | --- |
| PostgreSQL | `rutaia_postgres` | `localhost:5432` |
| Qdrant | `rutaia_qdrant` | `http://localhost:6335/dashboard` |
| Redis | `rutaia_redis` | `localhost:6379` |
| n8n | `rutaia_n8n` | `http://localhost:5679` |
| Backend | `rutaia_backend` | `http://localhost:8080/swagger-ui.html` |

Comprueba servicios:

```powershell
# Windows
Invoke-WebRequest http://localhost:6335/healthz -UseBasicParsing
Invoke-WebRequest http://localhost:8080/swagger-ui.html -UseBasicParsing
docker compose -f docker/docker-compose.yml logs --tail=80 backend n8n
```

```bash
# Linux
curl -f http://localhost:6335/healthz
curl -f http://localhost:8080/swagger-ui.html
docker compose -f docker/docker-compose.yml logs --tail=80 backend n8n
```

`/actuator/health` puede devolver 403 porque Spring Security lo protege; usa Swagger o los logs para comprobar el backend.

## 5. Importar y activar los workflows de n8n

1. Abre `http://localhost:5679` y crea la cuenta local de n8n en el primer acceso.
2. Ve a **Workflows** → **Import from File**.
3. Importa ambos archivos:
   - `n8n/workflows/indexacion_cursos.json`
   - `n8n/workflows/RutaIA_RAG_Optimizado_n8n.json`
4. Abre cada flujo, verifica que no haya nodos con error y activa el interruptor **Active**.

Las claves se leen desde `docker/.env`. El workflow de indexación consulta el backend en `host.docker.internal:8080`; la configuración de n8n ya habilita esa dirección, pero el backend debe estar iniciado.

## 6. Indexar cursos en Qdrant

Con ambos workflows activos, ejecuta el webhook:

```powershell
# Windows
Invoke-RestMethod -Uri "http://localhost:5679/webhook/indexar-cursos" -Method POST
```

```bash
# Linux
curl -X POST http://localhost:5679/webhook/indexar-cursos
```

Luego abre `http://localhost:6335/dashboard`, entra a `cursos_academicos` y verifica que existan vectores. Si falla, abre la ejecución en n8n y consulta los logs del backend.

## 7. Iniciar el frontend

En otra terminal, desde la raíz:

```powershell
# Windows
node scripts/serve_frontend.js
```

```bash
# Linux
node scripts/serve_frontend.js
```

Abre `http://localhost:3000/login.html`. El frontend local usa automáticamente `http://localhost:8080/api`. Prueba inicio de sesión, catálogo y una consulta al asesor; esto verifica toda la cadena frontend → backend → n8n → Qdrant/IA.

## 8. Alternativa: backend fuera de Docker

Para desarrollar Java localmente, levanta solo infraestructura:

```bash
docker compose -f docker/docker-compose.yml up -d
```

En PowerShell:

```powershell
$env:SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/rutaia_db?sslmode=disable'
$env:POSTGRES_USER='postgres'
$env:POSTGRES_PASSWORD='postgres_secure_password'
$env:REDIS_HOST='localhost'
$env:REDIS_PORT='6379'
$env:QDRANT_URL='http://localhost:6335'
$env:N8N_WEBHOOK_URL='http://localhost:5679/webhook/recomendar-cursos'
cd backend
.\gradlew.bat bootRun
```

En Linux:

```bash
export SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/rutaia_db?sslmode=disable'
export POSTGRES_USER='postgres'
export POSTGRES_PASSWORD='postgres_secure_password'
export REDIS_HOST='localhost'
export REDIS_PORT='6379'
export QDRANT_URL='http://localhost:6335'
export N8N_WEBHOOK_URL='http://localhost:5679/webhook/recomendar-cursos'
cd backend
chmod +x gradlew
./gradlew bootRun
```

No ejecutes a la vez el backend Docker y el backend local: ambos usan el puerto `8080`.

## 9. Detener, reiniciar o reinicializar

```bash
# Detener sin borrar datos
docker compose -f docker/docker-compose.yml --profile full stop

# Iniciar de nuevo
docker compose -f docker/docker-compose.yml --profile full start

# Logs en tiempo real
docker compose -f docker/docker-compose.yml logs -f backend n8n
```

Para borrar todos los datos y comenzar desde cero:

```bash
docker compose -f docker/docker-compose.yml --profile full down -v
```

Después repite los pasos 4 a 6, incluida la importación, activación e indexación de n8n.

## 10. Problemas frecuentes

| Problema | Solución |
| --- | --- |
| Docker devuelve `permission denied` | En Windows inicia Docker Desktop. En Linux revisa el grupo `docker`, reinicia sesión o usa `sudo`. |
| Un puerto está ocupado | Detén el proceso que usa 3000, 5432, 5679, 6335, 6379 u 8080, o cambia la variable correspondiente en `docker/.env`. |
| n8n no ve las claves | Confirma que están en `docker/.env` y recrea n8n con el comando del paso 3. |
| La indexación no lee cursos | Inicia el backend con `--profile full`, verifica que el workflow esté activo y reintenta. |
| No hay respuestas RAG | Activa ambos workflows y vuelve a indexar Qdrant. |
| El frontend no inicia | Instala Node.js 18+ y comprueba que el puerto 3000 esté disponible. |

Nunca publiques archivos `.env`, tokens ni capturas que los incluyan. Si una clave se expone, revócala desde su proveedor y sustitúyela en `docker/.env`.
