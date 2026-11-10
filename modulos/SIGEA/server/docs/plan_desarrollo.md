# Plan de Desarrollo SIGEA

## Fase 1: Configuración inicial (✅ Completada)
- [x] Preparar el backend en `modulos/SIGEA/server`.
- [x] Configurar Node.js, npm, Express y TypeScript estricto.
- [x] Configurar Prisma 7 con el adaptador MariaDB/MySQL.
- [x] Configurar `.env` local y excluirlo de Git.
- [x] Crear el servidor base.
- [x] Verificar la conexión real a la base de datos.

## Fase 2: Modelo, migraciones y seeders (✅ Completada)
- [x] Definir y validar el esquema SIGEA (Usuarios, Entes, Auditorías, Solicitudes y relaciones).
- [x] Crear y revisar una migración inicial válida.
- [x] Ejecutar la migración contra la base de datos SIGEA.
- [x] Crear y ejecutar seeders idempotentes para datos de prueba.

El seeder agrega registros ficticios identificables para probar Ente, tipo de auditoría, Auditoría, Solicitud y DetalleSolicitud. Ejecutarlo con `npm run db:seed`.

## Fase 3: Autenticación y catálogos
- [ ] Registro e inicio de sesión con JWT.
- [ ] Middleware de autenticación.
- [ ] CRUD de Entes y tipos de auditoría.

## Fase 4: Solicitudes y ratificaciones
- [ ] Cálculo de días hábiles.
- [ ] Flujo de Solicitud, DetalleSolicitud y Respuesta.
- [ ] Flujo de Ratificación y reglas de multa.

## Fase 5: Pruebas y cierre
- [ ] Probar los endpoints.
- [ ] Documentar la API.
