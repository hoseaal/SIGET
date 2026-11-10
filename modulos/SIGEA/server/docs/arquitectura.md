# 🏗️ Arquitectura del Backend SIGEA

## Flujo de una Petición HTTP
1. **Frontend:** Hace una petición (ej. POST `/api/solicitudes`).
2. **Express (`index.ts`):** Recibe la petición y la enruta.
3. **Ruta (`solicitud.routes.ts`):** Verifica el método y llama al controlador.
4. **Controlador (`solicitud.controller.ts`):** Recibe los datos, valida y llama al servicio.
5. **Servicio (`diasHabiles.service.ts`):** Calcula fechas, aplica reglas de negocio.
6. **Prisma (`prisma.ts`):** Ejecuta la consulta SQL en MySQL (XAMPP).
7. **Respuesta:** El controlador devuelve un JSON al frontend.

## Base de Datos (Modelo Entidad-Relación)
El sistema se basa en 3 pilares:
- **Datos Base:** `Usuario`, `Ente`, `AuditoriaTipo`.
- **El Expediente:** `Auditoria` y `UsuarioAuditoria` (equipo asignado).
- **La Ejecución:** `Solicitud` -> `DetalleSolicitud` -> `Respuesta` / `Ratificacion`.

## Tecnologías Clave
- **Prisma 7:** Usa el adaptador `@prisma/adapter-mariadb` para conectarse a MySQL.
- **JWT:** Para la seguridad de las rutas.
- **Bcrypt:** Para encriptar contraseñas.