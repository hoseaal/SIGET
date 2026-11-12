# Contexto del backend SIGEA

## Alcance actual

El backend expone únicamente `/api/auth`: registro, inicio de sesión y consulta del usuario autenticado.
No agregar endpoints de catálogos, auditorías o solicitudes hasta que el usuario defina sus requisitos.

## Stack

- Node.js y TypeScript estricto.
- Express.
- Prisma 7 con `@prisma/adapter-mariadb`.
- MySQL local.
- JWT y bcrypt para autenticación.

## Organización

- `src/index.ts`: servidor Express y montaje de rutas.
- `src/routes/auth.routes.ts`: endpoints de autenticación.
- `src/controllers/auth.controller.ts`: manejo HTTP y respuestas.
- `src/services/auth.service.ts`: registro, inicio de sesión y consulta de cuenta.
- `src/middleware/auth.middleware.ts`: validación de JWT.
- `src/config/`: configuración de Prisma y JWT.

## Reglas

- No usar `any`; validar datos externos y mantener TypeScript estricto.
- No devolver contraseñas ni secretos.
- El rol de registro se define en el servidor, nunca desde la petición.
- Mantener los controladores delgados y la lógica de autenticación en el servicio.
- El esquema y las migraciones existentes se conservan; no borrar ni modificar datos de MySQL sin autorización explícita.
