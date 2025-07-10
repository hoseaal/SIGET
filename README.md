# SIGET - Sistema Integral de Gestión para la Contraloría del Estado Táchira

[![PHP 8.2.12](https://img.shields.io/badge/PHP-8.2.12-777BB4?logo=php)](https://www.php.net/releases/8.2/en.php)
[![XAMPP](https://img.shields.io/badge/XAMPP-3.3.0-FB7A24?logo=apache)](https://www.apachefriends.org/es/index.html)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs)](https://nodejs.org/)  
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)  
[![MySQL 8](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)](https://www.mysql.com/)  

Sistema web diseñado para automatizar procesos clave en los departamentos de la **Contraloría del Estado Táchira**.

---

## 🛠️ Configuración del Entorno

Esta sección detalla los pasos necesarios para configurar y ejecutar el sistema, tanto para desarrollo local como para despliegue en un servidor de producción.

### Requisitos Previos

Asegúrate de tener instalados los siguientes componentes antes de iniciar:

* **PHP 8.2.12** ([Descargar](https://windows.php.net/download#php-8.2))
* **XAMPP** (versión con Apache y MySQL activados)
* **Composer** ([Guía de Instalación](https://getcomposer.org/download/))
* **Node.js v18+**
* **MySQL 8+**
* **Git** + **GitHub Desktop** (opcional, para gestión de versiones)

---

### Configuración para Desarrollo Local

Sigue estos pasos para poner en marcha el sistema en tu entorno local.

1.  **Clonar el Repositorio**:

    ```bash
    cd /opt/lampp/htdocs # O la ruta donde desees clonar el proyecto
    git clone [https://github.com/hoseaal/SIGET.git](https://github.com/hoseaal/SIGET.git)
    cd SIGET
    ```

2.  **Instalar Dependencias**:

    * **Módulo de Bienes Muebles (Node.js + React)**:

        ```bash
        cd modulos/BienesMuebles/server && npm install
        cd ../../../ # Regresar a la raíz del proyecto
        cd modulos/BienesMuebles/client && npm install
        cd ../../../ # Regresar a la raíz del proyecto
        ```

    * **Módulo de Recursos Humanos (PHP)**:

        ```bash
        composer require firebase/php-jwt phpoffice/phpspreadsheet vlucas/phpdotenv
        ```

3.  **Configurar Variables de Entorno (`.env`)**:

    * **Importante**: ¡Nunca subas tus archivos `.env` a GitHub!

    * Para el **Módulo de Recursos Humanos**: Solicita el archivo `.env` al Jefe de Área Técnica. Contiene el token JWT y configuraciones sensibles.

    * Para el **Módulo de Bienes Muebles**: Solicita el archivo `.env` al Jefe de Área Técnica y colócalo en la ruta `/modulos/BienesMuebles/server`.

    * **Ejemplo de archivo `.env`** (los archivos `.env` son separados para cada módulo, aunque comparten algunas claves):

        ```ini
        DB_HOST=localhost
        DB_USER=[usuario_mysql]
        DB_PASSWORD=[contraseña_mysql]
        DB_DATABASE=[nombre_de_la_bd]
        JWT_SECRET=[clave_secreta_minimo_32_caracteres_para_JWT]
        PORT=[puerto_para_el_servidor_de_node]
        ```

4.  **Base de Datos**:

    * Importa el archivo `dbsiget.sql` desde la carpeta `BDA/` utilizando **PHPMyAdmin** (disponible en XAMPP).

5.  **Ejecutar el Proyecto**:

    * Inicia los servicios de **Apache** y **MySQL** en XAMPP.
    * Accede al sistema a través de tu navegador: `http://localhost/SIGET/home/`
    * *Nota*: La carpeta `home/` funciona como la página de inicio principal del sistema, sirviendo de portal para acceder a los diferentes módulos.

---

### Configuración para Despliegue en un Servidor (Producción)

Esta sección detalla la configuración recomendada para un entorno de producción, asumiendo un sistema operativo Linux (Ubuntu/Debian) y un servidor web Nginx.

**Entorno del Servidor Recomendado**:

* **Sistema Operativo**: Linux (Ubuntu/Debian).
* **Base de Datos**: MySQL/MariaDB (se recomienda una instalación standalone en producción, no XAMPP).
* **Servidor Web**: Nginx
* **Runtime JavaScript**: Node.js
* **Proceso de Aplicación**: PM2

#### 1. Preparación del Servidor

* **Actualizar paquetes del sistema**:

    ```bash
    sudo apt update
    sudo apt upgrade -y
    ```

* **Instalar Node.js y NPM (versión recomendada LTS)**:

    ```bash
    sudo apt install curl -y
    curl -o- [https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh](https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh) | bash
    # Cierra y vuelve a abrir tu terminal o ejecuta: source ~/.bashrc (o ~/.zshrc)
    nvm install --lts
    nvm use --lts
    ```

    * **Verificar instalación**:

        ```bash
        node -v  # Debe mostrar v18.x o superior
        npm -v   # Debe mostrar 9.x o superior
        ```

* **Instalar herramientas de compilación** (necesarias para librerías nativas como `bcrypt`):

    ```bash
    sudo apt install build-essential -y
    ```

#### 2. Configuración de los Módulos

* **Para el Backend (Servidor Node.js)**:

    ```bash
    cd /opt/lampp/htdocs/SIGET/modulos/BienesMuebles/server # (Nota: Ajusta esta ruta si tu proyecto está en otra ubicación en el servidor)
    rm -rf node_modules package-lock.json # Limpiar dependencias existentes
    npm cache clean --force
    npm install --unsafe-perm --build-from-source # Reinstalar con compilación nativa
    ```

* **Para el Frontend (Aplicación React)**:

    ```bash
    cd /opt/lampp/htdocs/SIGET/modulos/BienesMuebles/client # (Nota: Ajusta esta ruta si tu proyecto está en otra ubicación en el servidor)
    npm install
    npm run build
    ```
    *Esto creará una carpeta `dist` (o `build`, dependiendo de tu configuración de Vite) dentro del directorio del frontend con todos los archivos estáticos listos para ser servidos.*

#### 3. Configuración e Instalación de Nginx

* **Instalar Nginx**:

    ```bash
    sudo apt install nginx -y
    ```

* **Crear el archivo de configuración de Nginx para tu aplicación**:

    ```bash
    sudo rm /etc/nginx/sites-enabled/default # (Opcional) Borrar el archivo de configuración por defecto si existe
    sudo nano /etc/nginx/sites-available/siget_bienes # Crear un nuevo archivo de configuración
    ```

    * Añade la siguiente configuración al archivo (`siget_bienes`):

        ```nginx
        server {
            listen 8080; # Puerto para acceder al frontend desde la red (ej. http://IP_DEL_SERVIDOR:8080)
            server_name _; # Acepta cualquier nombre de host

            # Ruta a los archivos estáticos de tu React App (la carpeta 'dist' generada)
            root /opt/lampp/htdocs/SIGET/modulos/BienesMuebles/client/dist; # Ajusta la ruta si es necesario
            index index.html;

            # Sirve la aplicación de React para cualquier ruta que no sea la API
            location / {
                try_files $uri $uri/ /index.html;
            }

            # Redirige las peticiones /api a tu servidor Node.js (backend)
            location /api {
                proxy_pass http://localhost:5001; # Puerto donde corre tu API de Node.js
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
        ```

* **Habilitar la configuración de Nginx**:

    ```bash
    sudo ln -s /etc/nginx/sites-available/siget_bienes /etc/nginx/sites-enabled/
    ```

* **Probar la sintaxis de Nginx y reiniciar**:

    ```bash
    sudo nginx -t # Debe retornar "syntax is ok" y "test is successful"
    sudo systemctl restart nginx
    ```

#### 4. Ejecutar el Backend de Forma Permanente con PM2

* **Instalar PM2 de forma global**:

    ```bash
    sudo npm install pm2 -g
    ```

* **Navega al directorio de tu backend**:

    ```bash
    cd /opt/lampp/htdocs/SIGET/modulos/BienesMuebles/server # Ajusta la ruta si es necesario
    ```

* **Iniciar la aplicación con PM2**:

    ```bash
    pm2 start npm --name "api-bienes-muebles" -- run start
    ```

* **Configurar PM2 para que se inicie con el sistema**:

    ```bash
    pm2 startup # Copia y pega el comando que te proporcione PM2 (ej. sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your_username --hp /home/your_username)
    pm2 save
    ```

* **Verificar el estado de tu aplicación con PM2**:

    ```bash
    pm2 status # Tu aplicación (api-bienes-muebles) debería aparecer como 'online'
    ```
    * **IMPORTANTE**: Después de cualquier cambio en el backend, reinicia el proceso de PM2: `pm2 restart api-bienes-muebles`.

* **Verificar logs del servidor**:

    ```bash
    pm2 logs api-bienes-muebles # Debería aparecer un mensaje similar a: "🚀 Servidor en http://localhost:5001 ✅ Conexión exitosa a MySQL 🟢 DB Conectada"
    ```

#### 5. Prueba Final

* Accede a tu aplicación desde un navegador: `http://<IP_DEL_SERVIDOR>:8080`
* Deberías ver la interfaz de usuario de tu aplicación React. Interactúa con las funcionalidades que requieren la API (ej. iniciar sesión) para confirmar que la comunicación entre el frontend, Nginx y el backend de Node.js es correcta.

---

## 📂 Estructura del Proyecto

        SIGET/
        ├── BDA/                        # Scripts y esquemas de base de datos
        ├── home/                       # Página de inicio principal
        │   └── assets/                 # CSS, JS, imágenes para la página de inicio
        ├── modulos/                    # Módulos del sistema
        │   ├── BienesMuebles/          # Módulo de Gestión de Bienes Muebles
        │   │   ├── client/             # Frontend (React/Vite)
        │   │   │   ├── public/         # Assets estáticos del frontend
        │   │   │   ├── src/            # Código fuente de componentes React
        │   │   │   └── dist/           # Build de producción del frontend (generado al compilar)
        │   │   ├── server/             # Backend (Node.js/Express)
        │   │   │   ├── public/         # Recursos públicos del backend (ej. logos para documentos)
        │   │   │   ├── src/            # Lógica de la API y endpoints
        │   │   │   │   ├── auth/       # Lógica de autenticación
        │   │   │   │   ├── controllers/# Controladores de la API
        │   │   │   │   ├── models/     # Definición de modelos de datos
        │   │   │   │   ├── routes/     # Definición de rutas de la API
        │   │   │   │   ├── services/   # Lógica de negocio y servicios
        │   │   │   │   └── utils/      # Utilidades y funciones auxiliares
        │   │   │   ├── temp/           # Archivos temporales generados por el backend
        │   │   │   └── .env            # Variables de entorno del módulo de Bienes Muebles
        │   └── DireccionRRHH/          # Módulo de Dirección de Recursos Humanos
        │       ├── PHP/api/            # Endpoints y lógica del backend PHP (usuarios, exportaciones, etc.)
        │       └── html/               # Vistas y archivos estáticos del frontend PHP
        └── vendor/                     # Dependencias de Composer (generado automáticamente)


---

## 🔧 Tecnologías Clave

### Módulo de Recursos Humanos (PHP)

1.  **Frontend**: Plantilla Sneat (HTML5, SCSS, Bootstrap, JS).
2.  **Backend**: PHP 8.2, AJAX.
3.  **Librerías Principales**:
    * SweetAlert2 (alertas interactivas).
    * Select2 (inputs dinámicos para selecciones).
    * PHP-JWT (JSON Web Tokens para autenticación).
    * PHPSpreadsheet (generación y manipulación de archivos XLS).
    * TCPDF (generación de documentos PDF).

### Módulo de Bienes Muebles (Node.js + React)

1.  **Frontend**: React 19 (con Vite para el proceso de build).
2.  **Backend**: Node.js 18+ (utilizando el framework Express).
3.  **Librerías Principales**:
    * `bcrypt` (para el hashing seguro de contraseñas).
    * `jsonwebtoken` (para la gestión de JWTs).
    * `mysql` (cliente para la conexión con la base de datos MySQL).
    * `express` (framework web para construir la API REST).
    * `exceljs` (para la exportación de datos a archivos XLS/XLSX).
    * `pdfkit` (para la generación programática de documentos PDF).
    * `react-bootstrap` (para componentes de UI basados en Bootstrap en React).

---

## ⚠️ Consideraciones Críticas

Es fundamental tener en cuenta los siguientes puntos para el correcto funcionamiento y mantenimiento del sistema:

1.  **Base de Datos**: No modifiques triggers o esquemas de la base de datos sin la aprobación explícita del Jefe de Área Técnica.
2.  **Variables Sensibles**: Los archivos `.env` (que contienen credenciales y configuraciones sensibles) deben permanecer locales y **nunca ser subidos al repositorio de GitHub**.
3.  **Módulos Nuevos**: Al desarrollar nuevos módulos, asegúrate de crear una carpeta independiente dentro de `modulos/` y seguir la estructura de proyecto existente para mantener la coherencia.

---

## 🚀 Estrategia de Despliegue

1.  **Entorno Local (Desarrollo)**: Utiliza **XAMPP** para el desarrollo y las pruebas locales. Este entorno es ideal para una configuración rápida y controlada.
2.  **Entorno de Producción**: Para actualizaciones o despliegues en el servidor de producción, siempre coordina con el Jefe de Área Técnica. **Se desaconseja el uso de XAMPP en producción**; se recomienda una instalación de MySQL/MariaDB standalone y un stack LEMP/LAMP para mayor estabilidad y seguridad.

---

## 📌 Contacto

Para cualquier consulta, soporte técnico o solicitud de acceso/permisos, contacta a los responsables o al Jefe de Área Técnica.

1.  **Responsables Técnicos (Desarrolladores)**:
    * Módulo de Recursos Humanos: **Eduards Zambrano** (Github: [@EdZambrano21](https://github.com/EdZambrano21))
    * Módulo de Bienes Muebles: **Jose Omaña** (Github: [@hoseaal](https://github.com/hoseaal))

2.  **Acceso y Permisos**: Solicita al Jefe de Área Técnica de la Contraloría.

## Diagrama de Conexión del Sistema 

```
+------------------+
|      USUARIO     |
+--------+---------+
         |
         | (1. Accede a la página de inicio)
         | (`http://<IP-SERVIDOR>/SIGET/home/`)
         v
+--------+----------------------+
|     Página de Inicio          |
|   (/SIGET/home/)              |
| (Botones de Login: BM y RRHH) |
+-------------------------------+
    |                                    |
(2a. Click Login Bienes Muebles)   (2b. Click Login Recursos Humanos)
    |                                    |
    v                                    v
+---+---------------------+   +------------------------------+
|  Módulo Bienes Muebles  |   |   Módulo Recursos Humanos    |
| (Frontend: React/Vite)  |   |  (Frontend: HTML/JS/Sneat)   |
| (Acceso vía Nginx:8080) |   |  (Acceso vía Apache:80)      |
+-----------+-------------+   +-----------+------------------+
            |                           |
            | (3a. Peticiones API)      | (3b. Peticiones AJAX)
            v                           v
+-----------+---------------+   +-----------+------------------+
|  Módulo Bienes Muebles    |   |   Módulo Recursos Humanos    |
| (Backend: Node.js/Express)|   |    (Backend: PHP 8.2)        |
| (Escucha en Puerto 5001)  |   |                              |
+-----------+---------------+   +-----------+------------------+
            |                                     |
            | (4. Conexión a Base de Datos MySQL) |
            +-------------------+-----------------+
                                |
                                v
                        +--------------------+
                        |    Base de Datos   |
                        |   (MySQL 8+)       |
                        +--------------------+
```