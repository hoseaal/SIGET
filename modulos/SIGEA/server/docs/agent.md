# 🤖 Contexto del Proyecto SIGEA para la IA

Eres un asistente experto en desarrollo backend. Estás trabajando en un proyecto **NUEVO** para el sistema **SIGEA** (Sistema de Gestión de Expedientes de Auditoría). 

## 🛠️ Stack Tecnológico (Configuración Actual)
- **Runtime:** Node.js (última versión LTS).
- **Lenguaje:** TypeScript (Estricto, sin usar `any`).
- **Framework Backend:** Express.
- **ORM:** Prisma 7 (con `prisma.config.ts` y `@prisma/adapter-mariadb`).
- **Base de Datos:** MySQL (gestionado localmente con XAMPP).
- **Autenticación:** JWT (JSON Web Tokens) y Bcrypt.

## 📂 Estructura del Proyecto (Nueva Carpeta)
- `src/index.ts`: Punto de entrada (servidor Express).
- `src/config/prisma.ts`: Instancia única de Prisma Client con el adaptador de MySQL.
- `src/controllers/`: Lógica de las peticiones HTTP.
- `src/routes/`: Definición de los endpoints.
- `src/services/`: Lógica de negocio compleja (ej. cálculo de días hábiles).
- `prisma/schema.prisma`: Esquema de la base de datos.
- `prisma.config.ts`: Configuración de la URL de la base de datos para Prisma 7.
- `docs/`: Documentación del proyecto (este archivo, plan y arquitectura).

## 🧠 Contexto Adicional
- **MCP MySQL:** Ya tienes instalado y configurado el MCP `mysql-explorer` en tu sistema. Si necesitas ver la estructura de la base de datos, puedes pedirle al usuario que te la muestre o usar el MCP si está habilitado en la sesión.
- **Prisma 7:** Recuerda que en esta versión, la URL de conexión **NO** va en el `schema.prisma`, sino que se lee desde el `prisma.config.ts` usando `dotenv`.

## 📌 Reglas de Negocio (MVP)
1. **Días Hábiles:** El sistema calcula vencimientos sumando días hábiles (excluyendo sábados y domingos).
2. **Estados:** `EN_ESPERA`, `RESPONDIDA`, `VENCIDA`, `RATIFICADA`, `EN_MULTA`.
3. **Ratificaciones:** Si no hay respuesta, se emite una Ratificación. A la 3ra, se multa.

## ⚠️ Reglas de Código (OBLIGATORIAS)
- **NO** uses `any` en TypeScript. Define interfaces o tipos.
- Usa `try/catch` en todos los controladores y devuelve respuestas JSON claras (ej. `{ message: "..." }` o `{ error: "..." }`).
- Antes de escribir una consulta de Prisma, revisa el archivo `prisma/schema.prisma` para usar los nombres exactos de los modelos y campos.
- Si necesitas instalar una nueva librería, pídemelo y dime el comando exacto.
- Trabaja **un paso a la vez** (primero el controlador, luego la ruta, etc.).