# Decisiones técnicas

Este documento deja trazables las decisiones de diseño del backend (NestJS + TypeORM + PostgreSQL) y el frontend (React 18+ + Vite + react-query), según lo pedido en la sección 12 del enunciado. Cada punto incluye la decisión, por qué se tomó frente a al menos una alternativa considerada, y el riesgo aceptado cuando aplica.

## 1. Identidad de una operación y duplicados ante reintentos (RF5)

**Requisito deliberadamente abierto (sección 5):** el enunciado no define qué combinación de campos identifica "la misma operación". La suposición adoptada:

> Una operación queda identificada por `(supplierId, externalReference)`. `externalReference` es el único campo del modelo mínimo que luce como un token provisto por el cliente (no estado calculado por el servidor), y acotarlo por proveedor refleja cómo funcionan los números de referencia/factura en la realidad — cada proveedor numera su propio sistema, no hay una numeración global compartida entre proveedores.

**Mecanismo:** restricción `UNIQUE` a nivel de base de datos sobre `(supplier_id, external_reference)` en `disbursement_requests`, **no** un patrón "verificar-y-luego-insertar" en la aplicación. Un check-then-insert tiene una condición de carrera (TOCTOU): dos reintentos casi simultáneos pueden pasar el "no existe" antes de que cualquiera de los dos inserte, y terminan duplicando igual. El handler intenta insertar directo; si Postgres rechaza por violar esa restricción, se captura ese error específico (`QueryFailedError` con `code = '23505'`) y:

- Si el payload reintentado (`amount`, `currency`, `concept`) **coincide** con el registro existente → se devuelve ese registro, sin crear uno nuevo (idempotencia real, no solo detección de choque).
- Si **no coincide** → se interpreta como un conflicto real (reutilización accidental de la referencia, no un reintento) → `409 Conflict`.

**Riesgo aceptado:** si en la práctica del negocio `externalReference` no fuera único por proveedor (por ejemplo, se reutiliza legítimamente), esta clave dejaría de ser válida. La alternativa más robusta —un `Idempotency-Key` explícito generado por el cliente, desacoplado de los campos de negocio— se descartó por alcance: agrega una tabla y un contrato nuevos para un problema que el propio modelo mínimo ya insinúa cómo resolver con el campo que pide.

## 2. Consistencia ante dos decisiones concurrentes (RF6)

**Mecanismo:** una transacción de base de datos que hace dos cosas atómicamente:

1. `UPDATE disbursement_requests SET status = ? WHERE id = ? AND status = 'PENDING'`. Postgres bloquea la fila mientras dura la transacción — si dos supervisores deciden la misma solicitud casi al mismo tiempo, la segunda transacción espera a que la primera confirme y, al re-evaluar el `WHERE` contra la fila ya actualizada, afecta 0 filas. Esa es la señal determinística de "perdiste la carrera".
2. Solo si el `UPDATE` afectó una fila, se inserta la decisión en `decisions`. El índice único en `decisions.request_id` queda como segunda capa de protección (defensa en profundidad) para que, aunque en el futuro otro camino de código llegara a tocar el estado sin pasar por este mismo método, no pudiera persistirse una segunda decisión contradictoria para la misma solicitud.

**Alternativa considerada:** locking optimista con columna de versión (`version` incremental + `WHERE version = ?`). Se descartó por ser funcionalmente equivalente al `UPDATE` condicional pero con más piezas (columna extra, lectura previa de la versión en la capa de aplicación) sin ganar nada a cambio para este caso de uso.

## 3. Modelo relacional

| Tabla | Columnas relevantes | Restricciones / índices |
|---|---|---|
| `users` | `id` (uuid, PK), `email`, `password_hash` (excluida por default de los `SELECT`), `role` (enum `ANALYST`\|`SUPERVISOR`), `created_at` | `UNIQUE(email)` |
| `suppliers` | `id` (uuid, PK), `tax_id`, `name`, `created_at` | `UNIQUE(tax_id)` |
| `disbursement_requests` | `id` (uuid, PK), `external_reference`, `supplier_id` (FK → `suppliers.id`, `RESTRICT`), `amount` (numeric 14,2), `currency` (char 3), `concept` (text), `status` (enum), `created_at`, `updated_at` | `UNIQUE(supplier_id, external_reference)` — idempotencia (§1); índice simple en `external_reference` — búsqueda; índice compuesto `(status, created_at)` — filtro + paginación por cursor (§6) |
| `decisions` | `id` (uuid, PK), `request_id` (FK 1:1 → `disbursement_requests.id`, `RESTRICT`), `decision` (enum `APPROVED`\|`REJECTED`), `reason` (text, nullable), `decided_by` (FK → `users.id`, `RESTRICT`), `decided_at` | `UNIQUE(request_id)` — concurrencia (§2); `CHECK(decision <> 'REJECTED' OR reason IS NOT NULL)` — la razón obligatoria al rechazar (RF4) se garantiza también a nivel de base, no solo en el DTO |

`onDelete: RESTRICT` en ambas FK en vez de `CASCADE`: no queremos que borrar un proveedor o un usuario borre en cascada solicitudes/decisiones ya persistidas — son registros financieros/de auditoría, se prefiere que el borrado falle explícitamente antes que perder trazabilidad en silencio.

## 4. Contrato de comunicación y manejo de errores

**REST sobre JSON**, versionado por URI (`/v1/...`, vía `VersioningType.URI` de Nest) — se prefirió sobre GraphQL porque el dominio no necesita queries flexibles del lado del cliente (los filtros de listado son fijos: estado + búsqueda), y REST mantiene el contrato más simple de documentar y de validar en el borde con DTOs de `class-validator`.

**Validación de entrada**: `ValidationPipe` global con `whitelist: true, forbidNonWhitelisted: true` — cualquier campo no declarado en el DTO se rechaza con `400`, no se ignora silenciosamente. Esto es también un control de seguridad: por ejemplo, si alguien intenta mandar un campo `role` en el body del login para atribuirse permisos, el pipe lo rechaza antes de que el código de aplicación lo vea.

**Manejo de errores**: un `AllExceptionsFilter` global (`@Catch()`, registrado vía `APP_FILTER`) es la única fuente de las respuestas de error:
- Si la excepción es una `HttpException` (todo lo que el código lanza a propósito: `NotFoundException`, `ConflictException`, los 400 de validación) → se expone el mensaje tal cual, porque son mensajes elegidos deliberadamente para ser vistos por el cliente.
- Cualquier otro error (uno de base de datos no capturado, un bug) → siempre `500` con mensaje genérico `"Internal server error"`, nunca el `.message` ni el `.stack` real. El detalle completo se loguea solo del lado del servidor.
- Cada respuesta de error incluye `correlationId` — útil para que el cliente reporte un incidente sin exponer nada sensible (es un UUID opaco).

## 5. Actualización de estado en el frontend (RF7) y protocolo elegido

**Mecanismo elegido: polling con `react-query` (`refetchInterval: 5000`)**, no WebSockets ni Server-Sent Events.

**Por qué**: el enunciado pide reflejar cambios de otra sesión "sin recargar completamente la aplicación y dentro de un máximo aproximado de 10 segundos" — no pide tiempo real estricto. Con `react-query` ya elegido como librería de data fetching, el polling es una línea de configuración (`refetchInterval`), sin infraestructura nueva. Además, `react-query` pausa el polling cuando la pestaña pierde el foco y refresca al recuperarlo, así que no genera tráfico contra pestañas que nadie está mirando.

**Alternativas consideradas y descartadas para este alcance**:
- **WebSockets**: push real e instantáneo, pero exige un gateway nuevo en el backend, manejo de autenticación sobre el socket (la cookie no viaja igual que en un request HTTP normal) y, en Docker/Kubernetes, soportar el upgrade de protocolo — mucho más trabajo para un requisito que solo pide "≤10 segundos", no tiempo real.
- **Server-Sent Events**: más liviano que WebSockets (un stream HTTP unidireccional, Nest lo soporta nativo con `@Sse()`), pero sigue siendo infraestructura de backend que hoy no existe, y los navegadores limitan a 6 conexiones SSE concurrentes por origen en HTTP/1.1.

Si el requisito fuera realmente tiempo real (por ejemplo, notificar en milisegundos), la elección cambiaría a WebSockets — quedó documentado como el paso siguiente si el alcance creciera.

Esta decisión también fue la más compatible con el tiempo disponible para el ejercicio: un WebSocket exige levantar y probar infraestructura nueva (gateway, reconexión, autenticación sobre el socket) que no aporta valor adicional frente al margen de 10 segundos que realmente pide RF7 — invertir ese tiempo ahí hubiera restado tiempo a partes del enunciado con más peso en la evaluación (idempotencia, concurrencia, seguridad). Es decir: el tiempo disponible confirmó la elección técnica, no la reemplazó.

## 6. Estrategia de routing, obtención de datos, caché/actualización y estados de UI

- **Routing**: `react-router-dom`, rutas explícitas (`/login`, `/`, `/disbursement-requests`, `/disbursement-requests/:id`, `/disbursement-requests/new`) — cumple el requisito de "rutas explícitas" (RF8). `ProtectedRoute` centraliza la protección (redirige a `/login` si no hay sesión) y además acepta una prop `roles` para gatear rutas por rol (por ejemplo, crear solicitud es exclusivo de `ANALYST` en la UI, reflejando el `@Roles()` del backend — aunque la aplicación real de la regla siempre ocurre en el servidor, ver §7).
- **Obtención de datos**: `@tanstack/react-query`. `useQuery` para el detalle de una solicitud (con polling), `useInfiniteQuery` para el listado — coincide con la paginación por cursor del backend (`nextCursor` como `pageParam`), así que "cargar más" nunca vuelve a traer el histórico completo (cumple RF2).
- **Caché/actualización tras mutaciones**: después de crear o decidir una solicitud, se invalida/refresca la query correspondiente — la información visible queda sincronizada con el backend sin recarga completa (RF8), reutilizando el mismo mecanismo de `react-query` en vez de manejar el estado a mano.
- **Estados de UI**: cada pantalla maneja explícitamente `isLoading`, `isError` (con botón de reintentar) y el caso de datos vacíos — no hay pantallas que fallen en silencio.

## 7. Estrategia de autenticación/autorización y controles sobre entradas no confiables, visualización y persistencia

**Autenticación**: JWT firmado por el backend, entregado como **cookie `httpOnly`** (no en el body de la respuesta, no en `localStorage`). Se evaluaron ambas opciones explícitamente:
- `localStorage`/Bearer header: más simple, pero cualquier script que corra en la página (una XSS, una dependencia de terceros comprometida) puede leerlo con una línea de JS.
- Cookie `httpOnly`: JavaScript no puede leerla en absoluto, ni con XSS. El costo es mayor (extractor custom en la estrategia JWT, `CORS` con `credentials: true`, un endpoint `/logout` explícito porque JS tampoco puede *borrar* una cookie `httpOnly`) — se decidió pagarlo porque el enunciado pone foco explícito en seguridad. Se mantuvo el header `Authorization: Bearer` como *fallback* en el extractor, útil para probar con curl/Postman sin manejar cookies.

**Autorización**: guards globales (`JwtAuthGuard` + `RolesGuard`, registrados una sola vez vía `APP_GUARD`) protegen **todas** las rutas por defecto — el modelo es "fail-closed": una ruta nueva queda protegida automáticamente a menos que se marque `@Public()` explícitamente (login, health, metrics). `@Roles(...)` por endpoint diferencia las dos capacidades que pide la sección 7: `ANALYST`/`SUPERVISOR` pueden consultar/registrar, solo `SUPERVISOR` puede decidir.

**No confiar en el frontend**: el `userId`/rol nunca se toma de lo que manda el cliente — sale siempre de `@CurrentUser()`, que lee el payload del JWT ya verificado por el guard. Por ejemplo, `decidedBy` en una decisión es el id del usuario autenticado, no un campo que el cliente pueda mandar en el body.

**Entradas no confiables**:
- Todo DTO de entrada pasa por `class-validator` con `whitelist`/`forbidNonWhitelisted` — campos inesperados se rechazan antes de tocar el dominio.
- `concept`, `reason` y demás texto libre se persisten como texto plano y se renderizan en React sin `dangerouslySetInnerHTML` en ningún lado — React escapa por default, así que un `<script>` guardado en `concept` nunca se ejecuta al visualizarlo.
- Filtros y búsqueda (`search`, `status`) van siempre por parámetros tipados de TypeORM (`ILIKE` con escape de comodines), nunca por concatenación de strings — no hay forma de que una búsqueda altere la semántica de la consulta.
- Errores nunca filtran stack traces ni detalles internos (§4).

## 8. Qué se observa: logs, salud y señal adicional

- **Logs**: middleware global que asigna/propaga un `X-Correlation-Id` por request y, al terminar (`res.on('finish')`, dispara tanto en éxito como en error), loguea un JSON estructurado: `correlationId`, `operation` (método + ruta), `statusCode`, `durationMs`. Deliberadamente **no** loguea headers, body ni la cookie de sesión — no hay nada sensible que redactar porque nunca se captura.
- **Salud**: `GET /health/live` (¿responde el proceso? sin dependencias externas — si falla, Kubernetes debería reiniciar el pod) separado de `GET /health/ready` (¿puede atender tráfico real? hace ping a la base de datos — si falla, Kubernetes debería sacar el pod de la rotación de tráfico, **no** reiniciarlo, porque reiniciar no arregla una base de datos caída). Se justifica la distinción porque casi todo endpoint de esta app depende de la base de datos.
- **Señal adicional**: métricas Prometheus en `GET /metrics` (`http_requests_total`, `http_request_duration_seconds` con buckets de latencia, etiquetadas por método/ruta/status — usando el *patrón* de ruta, no la URL resuelta, para no explotar la cardinalidad de series con cada `:id` distinto) más métricas de proceso gratis (lag del event loop, memoria) vía `prom-client`.

## 9. Qué quedó fuera por el límite de tiempo, riesgos y próximos pasos

| Fuera de alcance | Riesgo si no se resuelve | Próximo paso |
|---|---|---|
| Manifiestos de Kubernetes | Ninguno inmediato — el enunciado no exige clúster real | Escribirlos conectando los probes de `/health/live` y `/health/ready` ya construidos |
| CRUD de proveedores (solo existe `findById`) | No se puede dar de alta un proveedor nuevo sin insertarlo a mano en la base | Agregar `POST /suppliers` con el mismo patrón CQRS ya usado en el resto |
| Sin migraciones (esquema vía `synchronize`) | Aceptable para una demo; en un entorno real, `synchronize: true` puede alterar el esquema sin control | Introducir migraciones versionadas de TypeORM antes de cualquier despliegue real |
| Sin refresh token (sesión de 8h fija) | El usuario pierde la sesión sin aviso al expirar, sin flujo de re-autenticación silenciosa | Evaluar si el negocio realmente necesita sesiones más largas antes de sumar esa complejidad |
| Sin rate limiting en `/auth/login` | Expuesto a fuerza bruta de credenciales | Agregar throttling (`@nestjs/throttler`) al endpoint de login |
| Sin pruebas end-to-end de navegador (solo unitarias) | Regresiones de integración real (login → cookie → rutas protegidas) no se detectan automáticamente | Sumar Playwright/Cypress cubriendo el flujo crítico completo |
| `typeorm` fijado en una versión de paquete (`^1.1.1`) que a primera vista luce inusual | Confusión para quien audite `package.json` sin verificar que funciona | Ya verificado empíricamente esta sesión (compila, testea, corre en Docker) — vale la pena revisar el pin igual antes de un despliegue real |
| El detalle de una decisión muestra `decidedAt` y `reason`, pero no quién decidió en formato legible — `decidedBy` es el UUID del usuario, no su email/nombre, porque el `GET` de detalle no hace join contra `users` | La UI no puede mostrar "Rechazada por juan@empresa.com", solo la fecha y la razón | Sumar ese join (`decision.decidedByUser`) al mismo `leftJoinAndSelect` que ya trae la decisión, y exponer `decidedByEmail` en el read-model |
