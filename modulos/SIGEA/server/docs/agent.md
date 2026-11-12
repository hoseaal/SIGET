# Contexto del backend SIGEA

## Alcance actual

El backend expone únicamente `/api/auth`: registro, inicio de sesión y consulta del usuario autenticado.
No agregar endpoints de catálogos, auditorías o solicitudes hasta que el usuario defina sus requisitos.

## Stack

- Node.js y JavaScript (ES modules).
- Express.
- Prisma 7 con `@prisma/adapter-mariadb`.
- MySQL local.
- JWT y bcrypt para autenticación.
- Zod valida el endpoint de registro; añadir esquemas de login u otros endpoints según se implementen.
- No agregar TypeScript, tsconfig ni paso de transpilación; Node.js ejecuta los archivos `.js`.

## Organización

- `src/index.js`: servidor Express y montaje de rutas.
- `src/routes/auth.routes.js`: endpoints de autenticación.
- `src/controllers/auth.controller.js`: manejo HTTP y respuestas.
- `src/services/auth.service.js`: registro, inicio de sesión y consulta de cuenta.
- `src/middleware/auth.middleware.js`: validación de JWT.
- `src/config/`: configuración de Prisma y JWT.
- `prisma/seed.js`: creación opcional de la cuenta inicial.

## Reglas

- Validar los datos externos en tiempo de ejecución y usar JavaScript estándar.
- No devolver contraseñas ni secretos.
- El rol de registro se define en el servidor, nunca desde la petición.
- Mantener los controladores delgados y la lógica de autenticación en el servicio.
- El esquema y las migraciones existentes se conservan; no borrar ni modificar datos de MySQL sin autorización explícita.
