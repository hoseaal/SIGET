# Contexto del backend SIGEA

## Alcance actual

El backend expone autenticación (`/api/auth`) y los módulos del MVP: entes (`/api/entes`),
auditorías (`/api/auditorias`) y solicitudes (`/api/solicitudes`). Los siguientes endpoints
deben replicar el mismo patrón descrito en `docs/arquitectura.md` (sección "Patrón de un endpoint nuevo").

## Stack

- Node.js y JavaScript (ES modules).
- Express.
- Prisma 7 con `@prisma/adapter-mariadb`.
- MySQL local.
- JWT y bcrypt para autenticación.
- Zod valida la entrada de cada endpoint en `src/schemas/` (registro y login ya implementados).
- Pruebas con `node:test` (`npm test`).
- No agregar TypeScript, tsconfig ni paso de transpilación; Node.js ejecuta los archivos `.js`.

## Organización

- `src/index.js`: servidor Express y montaje de rutas.
- `src/routes/auth.routes.js`: endpoints de autenticación.
- `src/routes/ente.routes.js`, `src/routes/auditoria.routes.js`, `src/routes/solicitud.routes.js`: rutas de los módulos.
- `src/controllers/auth.controller.js`: manejo HTTP y respuestas.
- `src/controllers/ente.controller.js`, `src/controllers/auditoria.controller.js`, `src/controllers/solicitud.controller.js`: lógica HTTP de cada módulo.
- `src/services/auth.service.js`: registro, inicio de sesión y consulta de cuenta.
- `src/services/ente.service.js`, `src/services/auditoria.service.js`, `src/services/solicitud.service.js`: lógica de negocio y acceso a Prisma de cada módulo.
- `src/services/businessDays.service.js`: `addBusinessDays(startDate, businessDays)` (salta sábados y domingos).
- `src/schemas/auth.schema.js`: esquemas Zod de registro y login.
- `src/schemas/ente.schema.js`, `src/schemas/auditoria.schema.js`, `src/schemas/solicitud.schema.js`: esquemas Zod de los módulos.
- `src/schemas/*.schema.test.js`: pruebas de los esquemas con `node:test`.
- `src/middleware/auth.middleware.js`: validación de JWT.
- `src/config/`: configuración de Prisma y JWT.
- `src/utils/http-error.js`: `HttpError`, manejo de errores de Prisma y utilidades de validación.
- `prisma/seed.js`: creación opcional de la cuenta inicial.

## Reglas

- Validar los datos externos en tiempo de ejecución con Zod en `src/schemas/` (objetos `.strict()`);
  cada esquema nuevo lleva su archivo de prueba en `node:test` y se añade al script `test`.
- La validación de entrada se hace en el servicio con `parseOrThrow`; los controladores quedan delgados:
  validan el ID de ruta con `parsePositiveInteger`, verifican el cuerpo con `isRecord` y delegan en el servicio.
- Los identificadores de funciones, variables y archivos usan inglés; los mensajes al usuario y los
  nombres de dominio/modelos de Prisma se mantienen en español.
- No devolver contraseñas ni secretos.
- El rol de registro se define en el servidor, nunca desde la petición.
- Los errores se lanzan como `HttpError` y se responden con `sendControllerError`; los IDs de ruta
  se validan con `parsePositiveInteger`.
- El esquema y las migraciones existentes se conservan; no borrar ni modificar datos de MySQL sin autorización explícita.
