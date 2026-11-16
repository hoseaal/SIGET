# Backend SIGEA: autenticación, entes, auditorías y solicitudes

El backend está escrito en JavaScript y se ejecuta directamente con Node.js; no necesita transpilarse.
`npm run dev` usa el modo watch de Node.js y `npm start` inicia la aplicación.

## Alcance actual

La API expone autenticación y los módulos del MVP de auditorías:

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/register` | Público; asigna siempre el rol `ASISTENTE_ADMINISTRATIVO` |
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/me` | Requiere un encabezado Authorization con el esquema Bearer y el token |
| POST | `/api/entes` | Requiere token |
| GET | `/api/entes` | Requiere token |
| PUT | `/api/entes/:id` | Requiere token |
| DELETE | `/api/entes/:id` | Requiere token |
| POST | `/api/auditorias` | Requiere token |
| GET | `/api/auditorias` | Requiere token |
| PUT | `/api/auditorias/:id` | Requiere token |
| DELETE | `/api/auditorias/:id` | Requiere token |
| POST | `/api/solicitudes` | Requiere token |
| GET | `/api/solicitudes` | Requiere token |
| PUT | `/api/solicitudes/detalles/:id/responder` | Requiere token |
| POST | `/api/solicitudes/detalles/:id/ratificar` | Requiere token |

El registro recibe `name`, `ci` y `password`. El inicio de sesión devuelve `{ token, user }`.
La entrada se valida con Zod en `src/schemas/auth.schema.js`; los esquemas normalizan el nombre
y la cédula, validan el tamaño UTF-8 de la contraseña y rechazan campos extra con `.strict()`.
Los controladores HTTP están en `src/controllers/auth.controller.js`; la lógica de cuenta,
contraseñas y JWT está en `src/services/auth.service.js`. El middleware de sesión está en
`src/middleware/auth.middleware.js`.

### Entes

`src/schemas/ente.schema.js` valida `name` y `rif` obligatorios, y `siglas`, `autoridad`,
`telefono` y `direccion` opcionales. El controlador `src/controllers/ente.controller.js` delega en
`src/services/ente.service.js`: `GET` lista por nombre; `PUT` acepta actualizaciones parciales;
`DELETE` responde 409 con "No se puede eliminar porque tiene auditorías asociadas" cuando Prisma
devuelve la violación de clave foránea (`P2003`).

### Auditorías

`src/schemas/auditoria.schema.js` valida `auditNumber`, `entityId` y `typeId`, fechas opcionales
y el enum `StatusAuditoria`. La lógica vive en `src/services/auditoria.service.js`: `GET` incluye
`ente` y `tipo`; `PUT` permite cambiar `status`, `endDate` y el resto de campos, validando que
`endDate` no sea anterior a `startDate`.

### Solicitudes

`src/services/businessDays.service.js` expone `addBusinessDays(startDate, businessDays)`, que avanza
día por día saltando sábados y domingos; el día de emisión no se cuenta. La lógica de
`src/services/solicitud.service.js` se apoya en ese servicio: `POST /api/solicitudes` calcula
`dueDate` y crea la `Solicitud` con sus `DetalleSolicitud` en un `create` anidado, asignando la misma
fecha de vencimiento a cada detalle. `GET` incluye la auditoría (con ente y tipo), los detalles, sus
respuestas y ratificaciones. Responder crea la `Respuesta` y marca el detalle como `RESPONDIDA` en una
transacción. Ratificar crea las ratificaciones 1 y 2 (detalle `RATIFICADA`); al intentar una tercera,
el detalle pasa a `DERIVADA` sin crear un registro nuevo.

Los controladores son delgados: validan el ID de ruta con `parsePositiveInteger`, verifican el cuerpo
con `isRecord` y delegan la validación Zod (`parseOrThrow`) y la lógica en los servicios.

Las pruebas de los esquemas se ejecutan con `npm test` (`node:test`).

## Patrón de un endpoint nuevo

Todo endpoint nuevo sigue los mismos pasos usados en autenticación:

1. **Modelo**: definir o reutilizar el modelo en `prisma/schema.prisma`; si hay cambios de esquema,
   crear la migración (`npm run db:migrate`) y ejecutar `npm run db:generate`.
2. **Esquema**: crear `src/schemas/<recurso>.schema.js` con Zod, objetos `.strict()` y subesquemas
   reutilizables (p. ej. `ciSchema`, `userRolSchema`).
3. **Pruebas del esquema**: crear `src/schemas/<recurso>.schema.test.js` con `node:test` y añadirlo
   al script `test` de `package.json`.
4. **Servicio**: crear `src/services/<recurso>.service.js`; validar con `parseOrThrow`, contener la
   lógica de negocio y lanzar errores con `HttpError`.
5. **Controlador**: crear `src/controllers/<recurso>.controller.js` delgado: verificar el cuerpo con
   `isRecord`, llamar al servicio y manejar errores con `sendControllerError`.
6. **Ruta**: crear `src/routes/<recurso>.routes.js` con `Router`; aplicar `authenticate` (y autorización
   por rol) donde la operación lo requiera.
7. **Montaje**: importar y montar el router en `src/index.js`; actualizar `docs/` (`agent.md`,
   `arquitectura.md`, `plan_desarrollo.md`).

Flujo de una petición: ruta → controlador → servicio → esquema Zod / Prisma → respuesta JSON.

## Persistencia y datos existentes

Prisma y la base de datos existentes se conservan. El esquema y las migraciones incluyen los
modelos de catálogos, auditorías y solicitudes usados por los módulos actuales. No se borraron
tablas ni registros. El seeder solo permite crear la cuenta inicial DIRECTOR:
configura `DIRECTOR_NAME`, `DIRECTOR_CI` y `DIRECTOR_PASSWORD` en `.env` y ejecuta
`npm run db:seed`.

## Seguridad

- Las contraseñas se almacenan con bcrypt; nunca se devuelven en respuestas.
- Los tokens JWT duran 8 horas y `JWT_SECRET` debe tener al menos 32 caracteres aleatorios.
- Las cuentas creadas mediante registro reciben un rol básico; el cliente no puede enviar un rol.
- Todos los endpoints de entes, auditorías y solicitudes aplican el middleware `authenticate`.
