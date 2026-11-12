# Backend SIGEA: base de autenticación

## Alcance actual

La API solo expone el flujo de autenticación:

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/register` | Público; asigna siempre el rol `ASISTENTE_ADMINISTRATIVO` |
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/me` | Requiere un encabezado Authorization con el esquema Bearer y el token |

El registro recibe `name`, `ci` y `password`. El inicio de sesión devuelve `{ token, user }`.
Los controladores HTTP están en `src/controllers/auth.controller.ts`; la lógica de cuenta,
contraseñas y JWT está en `src/services/auth.service.ts`. El middleware de sesión está en
`src/middleware/auth.middleware.ts`.

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
