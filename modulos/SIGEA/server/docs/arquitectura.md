# Backend SIGEA: base JavaScript de autenticación

El backend está escrito en JavaScript y se ejecuta directamente con Node.js; no necesita transpilarse.
`npm run dev` usa el modo watch de Node.js y `npm start` inicia la aplicación.

## Alcance actual

La API solo expone el flujo de autenticación:

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/register` | Público; asigna siempre el rol `ASISTENTE_ADMINISTRATIVO` |
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/me` | Requiere un encabezado Authorization con el esquema Bearer y el token |

El registro recibe `name`, `ci` y `password`. El inicio de sesión devuelve `{ token, user }`.
La entrada del registro se valida con Zod en `src/schemas/auth.schema.js`; el esquema
normaliza el nombre y la cédula, valida el tamaño UTF-8 de la contraseña y rechaza campos extra.
Los esquemas del login y de otros endpoints se incorporarán por separado.
Los controladores HTTP están en `src/controllers/auth.controller.js`; la lógica de cuenta,
contraseñas y JWT está en `src/services/auth.service.js`. El middleware de sesión está en
`src/middleware/auth.middleware.js`.

Las pruebas del esquema del registro se ejecutan con `npm test`.

## Persistencia y datos existentes

Prisma y la base de datos existentes se conservan. El esquema y las migraciones incluyen
modelos de catálogos y solicitudes de una iteración anterior, pero la API ya no los expone.
No se borraron tablas ni registros. El seeder solo permite crear la cuenta inicial DIRECTOR:
configura `DIRECTOR_NAME`, `DIRECTOR_CI` y `DIRECTOR_PASSWORD` en `.env` y ejecuta
`npm run db:seed`.

## Seguridad

- Las contraseñas se almacenan con bcrypt; nunca se devuelven en respuestas.
- Los tokens JWT duran 8 horas y `JWT_SECRET` debe tener al menos 32 caracteres aleatorios.
- Las cuentas creadas mediante registro reciben un rol básico; el cliente no puede enviar un rol.
