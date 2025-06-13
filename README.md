# SIGET - Sistema Integral de Gestión para la Contraloría del Estado Táchira

[![PHP 8.2.12](https://img.shields.io/badge/PHP-8.2.12-777BB4?logo=php)](https://www.php.net/releases/8.2/en.php)
[![XAMPP](https://img.shields.io/badge/XAMPP-3.3.0-FB7A24?logo=apache)](https://www.apachefriends.org/es/index.html)

Sistema web para automatizar procesos en los departamentos de la **Contraloría del Estado Táchira**.

---

## 🛠️ Configuración del entorno

### Requisitos previos
- **PHP 8.2.12** ([Descargar](https://windows.php.net/download#php-8.2))
- **XAMPP** (versión con Apache y MySQL activados)
- **Composer** ([Instalación](https://getcomposer.org/download/))
- **Git** + **GitHub Desktop** (opcional)

### Pasos iniciales
1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/[ORGANIZACIÓN]/SIGET.git
   cd SIGET
   ```

2. **Instalar dependencias**:
    ```bash
    composer require firebase/php-jwt phpoffice/phpspreadsheet vlucas/phpdotenv
    ```

3. **Configurar entorno**:

    Solicitar el archivo .env al Jefe de Área Técnica (contiene el token JWT y configuraciones sensibles).

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
        │   ├── DirecciónRRHH/       # Módulo de RRHH
        │   │   ├── PHP/api/         # Endpoints (usuarios, exportaciones, etc.)
        │   │   ├── html/            # Vistas del módulo
        ├── vendor/                  # Dependencias de Composer
----

## 🔧 Tecnologías clave

1. Frontend: Plantilla Sneat (HTML5, SCSS, Bootstrap, JS).

2. Backend: PHP 8.2, AJAX.

3. Librerías:

       . SweetAlert2 (alertas).

       . Select2 (inputs dinámicos).

       . PHP-JWT (autenticación).

       . PHPSpreadsheet (exportación XLS).
---

## ⚠️ Consideraciones críticas

1. **Base de datos**:

        No modificar triggers o esquemas sin aprobación del jefe de área técnica.

2. **Variables sensibles**:

        El archivo .env debe permanecer local.

3. **Módulos nuevos**:

        Crear una carpeta independiente en modulos/ siguiendo la estructura existente.
---

🚀 Despliegue
Entorno local:

Usar XAMPP para desarrollo y pruebas.

Producción:

Coordinar con el Jefe de Área Técnica para actualizaciones.

---

## 📌 Contacto

1. **Responsables técnicos**:

        Desarrollador del Módulo de Recursos Humanos: Eduards Zambrano (Github: @EdZambrano21)

        Desarrollador del Módulo de Bienes: Jose Omaña (Github: @hoseall)

2. **Acceso y permisos**: 

        Solicitar al Jefe de Área Técnica de la Contraloría.