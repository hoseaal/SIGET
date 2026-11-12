# Plan de Desarrollo SIGEA

Se reinició el alcance de la API. El único flujo implementado por ahora es autenticación.
Los endpoints de catálogos y solicitudes se retiraron del código; el esquema/migraciones
históricos y los datos existentes se conservaron y no se eliminaron de MySQL.

## Fase 1: Configuración inicial (✅ Completada)
- [x] Configurar Node.js, npm, Express y TypeScript.
- [x] Configurar Prisma 7 y la conexión MySQL.
- [x] Crear la estructura base del servidor.

## Fase 2: Base de datos (✅ Completada para el esquema existente)
- [x] Conservar el esquema y las migraciones aplicadas.
- [x] Mantener el seeder únicamente para la cuenta inicial DIRECTOR.

## Fase 3: Autenticación (🔄 Base implementada)
- [x] Registro básico con contraseña cifrada y rol asignado por el servidor.
- [x] Inicio de sesión con JWT.
- [x] Endpoint autenticado para consultar la cuenta actual.
- [ ] Ajustar el modelo de usuario y reglas de autenticación a los requisitos finales.
- [ ] Añadir pruebas automatizadas de autenticación.

## Fases futuras
- [ ] Definir con el usuario los requisitos antes de diseñar otros módulos o endpoints.
