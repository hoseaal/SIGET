# Plan de Desarrollo SIGEA

El alcance de la API cubre autenticación y los módulos del MVP (entes, auditorías y solicitudes).
El esquema/migraciones históricos y los datos existentes se conservaron. Los endpoints siguen el
patrón documentado en `docs/arquitectura.md`.

## Fase 1: Configuración inicial (✅ Completada)
- [x] Configurar Node.js, npm, Express y JavaScript ES modules.
- [x] Eliminar TypeScript y ejecutar los archivos `.js` directamente con Node.js.
- [x] Configurar Prisma 7 y la conexión MySQL.
- [x] Crear la estructura base del servidor.

## Fase 2: Base de datos (✅ Completada para el esquema existente)
- [x] Conservar el esquema y las migraciones aplicadas.
- [x] Mantener el seeder únicamente para la cuenta inicial DIRECTOR.

## Fase 3: Autenticación (🔄 Base implementada)
- [x] Registro básico con contraseña cifrada y rol asignado por el servidor.
- [x] Inicio de sesión con JWT.
- [x] Endpoint autenticado para consultar la cuenta actual.
- [x] Añadir pruebas automatizadas de los esquemas de autenticación (`npm test`).
- [ ] Ajustar el modelo de usuario y reglas de autenticación a los requisitos finales.

## Fase 4: Nuevos endpoints (✅ Completada para el MVP)

Aplicar a cada endpoint los mismos pasos usados en autenticación:

- [x] 1. Modelo en `prisma/schema.prisma` (+ migración y `npm run db:generate` si aplica).
- [x] 2. Esquema Zod en `src/schemas/<recurso>.schema.js` (`.strict()`, subesquemas reutilizables).
- [x] 3. Pruebas del esquema en `src/schemas/<recurso>.schema.test.js` y registro en el script `test`.
- [x] 4. Servicio en `src/services/<recurso>.service.js` (`parseOrThrow`, `HttpError`).
- [x] 5. Controlador delgado en `src/controllers/<recurso>.controller.js` (`isRecord`, `sendControllerError`).
- [x] 6. Ruta en `src/routes/<recurso>.routes.js` (`authenticate` donde aplique).
- [x] 7. Montar el router en `src/index.js` y actualizar los documentos de `docs/`.

### Módulos entregados

- [x] Entes: `POST/GET/PUT/DELETE /api/entes` (409 con mensaje claro al eliminar un ente con auditorías).
- [x] Auditorías: `POST/GET/PUT/DELETE /api/auditorias` (`GET` incluye `ente` y `tipo`).
- [x] Solicitudes: `POST/GET /api/solicitudes` y acciones responder/ratificar por detalle.
- [x] Servicios por módulo: `ente.service.js`, `auditoria.service.js`, `solicitud.service.js` (controladores delgados).
- [x] `src/services/businessDays.service.js`: `addBusinessDays` (salta sábados y domingos).
- [x] Nombres de funciones, variables y archivos de código en inglés.
- [x] Corrección del JWT en `src/services/auth.service.js` (`createToken` recibía el id en vez del usuario).

## Fases futuras
- [ ] Definir con el usuario los siguientes endpoints y sus requisitos.
