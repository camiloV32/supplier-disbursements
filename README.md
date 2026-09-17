# Supplier Disbursements

Solución Full Stack para registrar, listar, consultar y decidir (aprobar/rechazar) solicitudes de desembolso a proveedores. Desarrollada como prueba técnica según el enunciado en `Prueba_Tecnica_FullStack_Node_React18_Candidato.pdf`.

- **Backend**: NestJS 11 (Node.js 22) + TypeORM + PostgreSQL 16.
- **Frontend**: React 19 + Vite + react-query + react-router-dom.
- **Documentación de decisiones**: [`docs/decisiones-tecnicas.md`](docs/decisiones-tecnicas.md).
- **Bitácora de uso de IA**: [`docs/bitacora-ia.md`](docs/bitacora-ia.md).

## Prerrequisitos

- [Docker](https://www.docker.com/) y Docker Compose (v2, integrado en `docker compose`) — es la forma recomendada de levantar toda la solución.
- Para desarrollo local sin Docker: Node.js **22.x** (ver `apps/api/.nvmrc`) y una instancia de PostgreSQL 16 accesible.

## Variables de entorno

El archivo [`.env.example`](.env.example) en la raíz documenta todas las variables esperadas, sin secretos reales. Antes de ejecutar la solución, copiarlo a `.env`:

```bash
cp .env.example .env
```

| Variable | Usada por | Descripción |
|---|---|---|
| `NODE_ENV` | API | `development` o `production`. |
| `PORT` | API | Puerto HTTP del backend (por defecto `3000`). |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | API, Postgres (docker-compose) | Conexión a la base de datos. En Docker, `DB_HOST` se sobreescribe a `db` (nombre del servicio); en local apunta a `localhost`. |
| `DB_LOGGING` | API | Loguea las queries de TypeORM (`true`/`false`). |
| `DB_SYNC` | API | Sincroniza el esquema automáticamente (`synchronize` de TypeORM) — pensado solo para este ejercicio, ver [decisiones-tecnicas.md §9](docs/decisiones-tecnicas.md). |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | API | Firma y expiración del JWT de sesión. |
| `CORS_ORIGIN` | API | Origen permitido para peticiones con credenciales (debe coincidir exactamente con la URL del frontend). |
| `SEED_USERS_PASSWORD` | API (seed) | Contraseña con la que se crean los usuarios de prueba (analista/supervisor). |
| `VITE_API_URL` | Web | URL del backend accesible **desde el navegador** (se hornea en el build del frontend). |

No hay secretos reales en el repositorio ni en su historial; los valores de ejemplo están marcados explícitamente como de desarrollo.

## Pasos de ejecución (Docker — recomendado)

```bash
cp .env.example .env
docker compose up --build
```

Esto levanta, en orden (con `depends_on`/healthchecks):

1. `db` — PostgreSQL 16, con volumen persistente.
2. `seed` — contenedor de un solo uso que crea el esquema (via `synchronize`), dos usuarios de prueba (`analyst@supplier-disbursements.local` y `supervisor@supplier-disbursements.local`, ambos con la contraseña `SEED_USERS_PASSWORD`) y tres proveedores de ejemplo, y luego termina.
3. `api` — backend NestJS, expuesto en `http://localhost:3000`.
4. `web` — frontend servido por nginx, expuesto en `http://localhost:5173`.

Para volver a ejecutar el seed manualmente (por ejemplo tras borrar el volumen): `docker compose run --rm seed`.

Para detener y limpiar: `docker compose down` (agregar `-v` para borrar también el volumen de datos).

## Pasos de ejecución (desarrollo local, sin Docker)

Backend:

```bash
cd apps/api
npm install
npm run start:dev
```

Requiere una base PostgreSQL accesible con las credenciales de `.env` (por ejemplo, levantando solo el servicio `db` con `docker compose up db`). Para poblar usuarios/proveedores de prueba:

```bash
npm run seed:all
```

Frontend:

```bash
cd apps/web
npm install
npm run dev
```

Por defecto sirve en `http://localhost:5173` y espera el backend en la URL definida por `VITE_API_URL`.

## Pruebas

Backend (unitarias, incluyen los comportamientos críticos de idempotencia ante reintentos, concurrencia en la decisión, el filtro global de errores y el guard de roles):

```bash
cd apps/api
npm run test
npm run test:cov   # con cobertura
npm run test:e2e   # e2e
```

Frontend:

```bash
cd apps/web
npm run test
```

## Rutas principales

### API (`http://localhost:3000`, versionada por URI: `/v1/...`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/v1/auth/login` | Público | Login; entrega el JWT como cookie `httpOnly`. |
| `POST` | `/v1/auth/logout` | Público | Limpia la cookie de sesión. |
| `GET` | `/v1/auth/me` | Autenticado | Usuario de la sesión actual. |
| `POST` | `/v1/disbursement-requests` | `ANALYST` | Registra una solicitud de desembolso (idempotente ante reintentos, ver RF5). |
| `GET` | `/v1/disbursement-requests` | Autenticado | Lista solicitudes con filtro por estado, búsqueda y paginación por cursor. |
| `GET` | `/v1/disbursement-requests/:id` | Autenticado | Detalle de una solicitud. |
| `POST` | `/v1/disbursement-requests/:id/decision` | `SUPERVISOR` | Aprueba o rechaza una solicitud pendiente (razón obligatoria al rechazar). |
| `GET` | `/v1/suppliers` | Autenticado | Búsqueda de proveedores (usada por el formulario de creación). |
| `GET` | `/health/live` | Público | Liveness — el proceso responde. |
| `GET` | `/health/ready` | Público | Readiness — hay conexión a la base de datos. |
| `GET` | `/metrics` | Público | Métricas Prometheus (señal de observabilidad adicional). |

### Frontend (`http://localhost:5173`)

| Ruta | Acceso | Descripción |
|---|---|---|
| `/login` | Público | Inicio de sesión. |
| `/` | Autenticado | Home. |
| `/disbursement-requests` | Autenticado | Listado de solicitudes. |
| `/disbursement-requests/:id` | Autenticado | Detalle de una solicitud (con polling para reflejar decisiones de otras sesiones, RF7). |
| `/disbursement-requests/new` | Rol `ANALYST` | Registro de una nueva solicitud. |

## Kubernetes

**No implementado por límite de tiempo.** El enunciado (sección 9) pide manifiestos mínimos pero aclara explícitamente que no se exige clúster real ni despliegue efectivo, y esta fue la parte que se dejó fuera para priorizar el resto de requisitos (idempotencia, concurrencia, seguridad, observabilidad y pruebas), que tienen más peso en la evaluación funcional.

Lo que sí existe y facilitaría escribirlos directamente:

- `GET /health/live` y `GET /health/ready` ya distinguen liveness de readiness (ver tabla de rutas arriba) — se conectarían tal cual a los probes `livenessProbe`/`readinessProbe` de un `Deployment`.
- La imagen de la API expone el puerto `3000` (`apps/api/Dockerfile`) y la del frontend el `80` vía nginx (`apps/web/Dockerfile`), ambas ya construibles de forma reproducible con `docker compose build`.
- Las variables de `.env.example` son la lista completa de `ConfigMap`/`Secret` que necesitaría el `Deployment` de la API (`JWT_SECRET` y `DB_PASSWORD` irían como `Secret`, el resto como `ConfigMap`).

Próximo paso, de continuar: `Deployment` + `Service` para `api` y `web`, un `Secret` para credenciales de base de datos y `JWT_SECRET`, un `ConfigMap` para el resto de variables, probes apuntando a `/health/live` y `/health/ready`, y límites/requests de CPU/memoria razonables. Este mismo riesgo ya estaba dejado trazable en [decisiones-tecnicas.md §9](docs/decisiones-tecnicas.md#9-qué-quedó-fuera-por-el-límite-de-tiempo-riesgos-y-próximos-pasos).

## Documentación adicional

- [`docs/decisiones-tecnicas.md`](docs/decisiones-tecnicas.md): modelo relacional, identidad de operación e idempotencia, concurrencia, contrato de comunicación, autenticación/autorización, observabilidad y qué quedó fuera de alcance.
- [`docs/bitacora-ia.md`](docs/bitacora-ia.md): bitácora de uso de IA durante el desarrollo (sección 11 del enunciado).
