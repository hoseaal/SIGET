# SIGET - Sistema Integral de Gestión para la Contraloría del Estado Táchira

[![PHP 8.2.12](https://img.shields.io/badge/PHP-8.2.12-777BB4?logo=php)](https://www.php.net/releases/8.2/en.php)
[![XAMPP](https://img.shields.io/badge/XAMPP-3.3.0-FB7A24?logo=apache)](https://www.apachefriends.org/es/index.html)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs)](https://nodejs.org/)  
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)  
[![MySQL 8](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)](https://www.mysql.com/)  

Sistema web para automatizar procesos en los departamentos de la **Contraloría del Estado Táchira**.

---

## 🛠️ Configuración del entorno

### Requisitos previos
- **PHP 8.2.12** ([Descargar](https://windows.php.net/download#php-8.2))
- **XAMPP** (versión con Apache y MySQL activados)
- **Composer** ([Instalación](https://getcomposer.org/download/))
- **Node.js v18+** 
- **MySQL 8+**
- **Git** + **GitHub Desktop** (opcional)

### Pasos iniciales
1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/[ORGANIZACIÓN]/SIGET.git
   cd SIGET
   ```

2. **Instalar dependencias**:
Bienes Muebles:
cd modulos/BienesMuebles/server && npm install
cd ../../../
cd modulos/BienesMuebles/client && npm install

Recursos Humanos:
    ```bash
    composer require firebase/php-jwt phpoffice/phpspreadsheet vlucas/phpdotenv
    ```

3. **Configurar entorno**:

        Para el modulo de Recursos Humanos:
    Solicitar el archivo .env al Jefe de Área Técnica (contiene el token JWT y configuraciones sensibles).

        Para el modulo de Bienes Muebles:
    Solicitar el archivo .env al Jefe de Área Técnica (contiene el token JWT y configuraciones sensibles). y ponerlo en la ruta /modulos/BienesMuebles/server 

    ejemplo de .env:

DB_HOST=localhost
DB_USER=[usuario]
DB_PASSWORD=[contraseña]
DB_DATABASE=[nombre_bd]
JWT_SECRET=[clave_secreta_minimo_32_caracteres]
PORT=[puerto de node]

    ¡Nunca subir .env a GitHub!

4. **Base de datos**:

    Importar el archivo llamado "dbsiget.sql" desde BDA/ usando PHPMyAdmin (XAMPP).

5. **Ejecutar el proyecto**:

    Iniciar Apache y MySQL en XAMPP.

    Acceder a http://localhost/SIGET/home/.

---

## 📂 Estructura del proyecto
        SIGET/
        ├── BDA/                     # Scripts y esquemas de base de datos
        ├── home/                    # Página de inicio
        │   ├── assets/              # CSS, JS, imágenes
        ├── modulos/                 # Módulos del sistema
        │   ├── BienesMuebles/       # Módulo de Bienes
        │   │    ├── client/               # Frontend (React/Vite)
        │   │    │   ├── public/           # Assets estáticos
        │   │    │   ├── src/              # Componentes React
        │   │    │   └── dist/             # Build de producción (generado)
        │   │    ├── server/               # Backend (Node.js/Express)
        │   │    │   ├── public/      # logo para generacion de documentos
        │   │    │   ├── src/      # Lógica de endpoints 
        │   │    │   │   ├── auth/      # Lógica de autenticacion
        │   │    │   │   ├── controllers/      # controladores
        │   │    │   │   ├── models/      # modelos
        │   │    │   │   ├── routes/      # Rutas
        │   │    │   │   ├── services/      # servicios
        │   │    │   │   ├── utils/      # utilidades
        │   │    │   ├── temp/      # archivos temporales
        │   │    └── .env              
        │   ├── DireccionRRHH/       # Módulo de RRHH
        │   │   ├── PHP/api/         # Endpoints (usuarios, exportaciones, etc.)
        │   │   ├── html/            # Vistas del módulo
        ├── vendor/                  # Dependencias de Composer
----

## 🔧 Tecnologías clave

1. Frontend: Plantilla Sneat (HTML5, SCSS, Bootstrap, JS).

2. Backend: PHP 8.2, AJAX.

3. Librerías:

       - SweetAlert2 (alertas).

       - Select2 (inputs dinámicos).

       - PHP-JWT (autenticación).

       - PHPSpreadsheet (exportación XLS).
  
       - Tcpdf (exportación PDF). 
---

## ⚠️ Consideraciones críticas

1. **Base de datos**:

        No modificar triggers o esquemas sin aprobación del jefe de área técnica.

2. **Variables sensibles**:

        El archivo .env debe permanecer local.

3. **Módulos nuevos**:

        Crear una carpeta independiente en modulos/ siguiendo la estructura existente.
---

## 🚀 Despliegue

1. **Entorno local**:

        Usar XAMPP para desarrollo y pruebas.

2. **Producción**:

        Coordinar con el Jefe de Área Técnica para actualizaciones.

---

## 📌 Contacto

1. **Responsables técnicos**:

        Desarrollador del Módulo de Recursos Humanos: Eduards Zambrano (Github: @EdZambrano21)

        Desarrollador del Módulo de Bienes: Jose Omaña (Github: @hoseaal)

2. **Acceso y permisos**: 

        Solicitar al Jefe de Área Técnica de la Contraloría.