# Bitácora de uso de IA

Requisito de la sección 11 del enunciado. Esta prueba se desarrolló con **Claude Code** (Anthropic, modelo Sonnet 5) como asistente interactivo durante todo el ejercicio: diseño de arquitectura, implementación de backend y frontend, escritura de pruebas, configuración de Docker y esta misma documentación.

## Objetivo con el que se usó

Acelerar la implementación de un stack ya decidido por mí (NestJS + TypeORM + PostgreSQL, React + Vite + react-query), manteniendo control humano sobre las decisiones de arquitectura y seguridad — la IA implementó, propuso alternativas y ejecutó verificaciones, pero cada decisión de diseño (modelo de identidad para idempotencia, mecanismo de concurrencia, cookie httpOnly vs. Bearer, polling vs. WebSockets, etc.) se discutió explícitamente antes de escribir código, con justificación y alternativa documentada.

## Ejemplos concretos de resultados aceptados, corregidos o rechazados

**Aceptado, con verificación en vivo**: el diseño de autenticación con cookie `httpOnly` + guards globales se implementó y luego se probó de punta a punta contra un Postgres real en Docker (login, `/me` con y sin token, token alterado, validación de payload) antes de darlo por bueno — no se aceptó como "funciona" solo porque compilaba.

**Corregido — instalación innecesaria detectada y revertida**: al configurar alias de import (`@shared/...`) en el backend, la IA instaló `tsc-alias` asumiendo que Nest CLI no resolvía alias en el build compilado. Antes de dejarlo, se hizo la prueba empírica (compilar y revisar el JS emitido) y se comprobó que Nest CLI ya lo resuelve nativamente — la dependencia se desinstaló en el momento en vez de quedar sin uso en `package.json`.

**Verificado en vez de "corregido a ciegas"**: `typeorm` apareció fijado en `package.json` como `^1.1.1`, una versión que a primera vista luce incompatible con el resto del código (que usa APIs de TypeORM modernas). En lugar de "arreglarlo" por instinto, se verificó repetidamente contra evidencia real (build, tests, ejecución en Docker contra base de datos real) en distintos puntos de la sesión — todas las veces funcionó, así que se dejó documentado como verificado en vez de modificado a ciegas.

**Rechazado por mí y corregido en el momento**: en un punto de la sesión pedí los *pasos* para probar la aplicación con Docker Compose, y la IA en cambio ejecutó `docker compose up`, reconstruyó imágenes y corrió pruebas en vivo sin que se lo pidiera. Se lo señalé explícitamente; la IA reconoció el error, no repitió ese comportamiento el resto de la sesión, y desde entonces distingue con claridad entre "explicame cómo" y "hacelo".

**Corregido — comportamiento no realmente idempotente**: la primera versión de la creación de solicitudes (RF5) respondía `409 Conflict` ante *cualquier* reintento con la misma referencia, lo cual no es idempotencia real (un reintento legítimo debería recibir la misma respuesta que la primera vez, no un error). Se corrigió para comparar el payload reintentado contra el registro existente: si coincide, se devuelve el registro ya creado; solo si los datos difieren se responde `409`.

## Cómo se verificó seguridad y corrección

- Cada cambio se validó con `tsc --noEmit`, `eslint`, la suite de tests (`jest`/`vitest`) y el build de producción antes de darlo por terminado — no se aceptó código "a ojo".
- El flujo de autenticación se probó en vivo contra contenedores reales (no solo mocks): login, sesión persistente entre refrescos, expiración de token, y los casos negativos (401 sin token, 400 si el cliente intenta mandar un campo `role` no permitido en el login).
- Se escribieron pruebas dirigidas específicamente a comportamientos de seguridad, no solo de funcionalidad — por ejemplo, un test que arma un error con una contraseña y una IP falsas en el mensaje y verifica que ninguna de las dos aparezca en la respuesta HTTP (prueba directa del filtro global de excepciones), y pruebas del caso de "perder la carrera" de concurrencia en la decisión de una solicitud.
- Las decisiones de seguridad (cookie `httpOnly`, guards globales por defecto, `decidedBy` siempre desde el JWT verificado) se revisaron explícitamente contra los requisitos de la sección 7 del enunciado, no solo contra "buenas prácticas" genéricas.

## Qué no se hizo con IA

La estructuración inicial del proyecto (organización de carpetas por módulo/capa, separación domain/application/infrastructure, elección del stack concreto — NestJS + TypeORM + PostgreSQL en backend, React + Vite + react-query en frontend) y las decisiones de arquitectura de más alto nivel se definieron por mí antes de involucrar a la IA. Claude Code se usó como acelerador de implementación dentro de ese marco ya decidido, no como quien decidió el marco: cada decisión de diseño se discutía y se me presentaba con alternativas antes de escribir código (ver sección de ejemplos arriba), pero el punto de partida — qué arquitectura seguir y cómo estructurar el repositorio — fue una decisión humana previa.

## Cómo se evitó compartir información sensible

- Ningún secreto real se usó en ningún momento de la sesión — las credenciales en `.env` son valores de desarrollo local explícitamente marcados como tales (por ejemplo, `JWT_SECRET=local-dev-only-secret-...`).
- Se detectó y corrigió a mitad de sesión que el `.env` raíz había quedado *trackeado* en git (con contenido vacío en ese momento, pero igualmente incorrecto) — se corrigió el `.gitignore` para ignorar `.env` en cualquier carpeta del proyecto y se sacó del historial antes de que contuviera nada real.
- No se usó ningún dato personal, de clientes ni de proveedores reales como entrada de prueba — todos los usuarios/proveedores de ejemplo son ficticios.
