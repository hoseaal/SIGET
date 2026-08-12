# SIGET - Sistema Integral de Gestión para la Contraloría del Estado Táchira

[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs)](https://nodejs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![MySQL 8](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)](https://www.mysql.com/)
[![PM2](https://img.shields.io/badge/PM2-5.3.0-2B6C8C?logo=pm2)](https://pm2.keymetrics.io/)

Sistema web modular diseñado para automatizar los procesos clave de la **Contraloría del Estado Táchira**. La plataforma está compuesta por módulos independientes que comparten una misma infraestructura pero utilizan **bases de datos separadas** para cada módulo.

---

## 🧩 Módulos del Sistema

| Módulo               | Frontend (React) | Backend (Node.js) | Puerto API | Nombre PM2      | Base de Datos        |
|----------------------|------------------|-------------------|------------|-----------------|----------------------|
| Bienes Muebles       | `modulos/BienesMuebles/client`  | `modulos/BienesMuebles/server`  | 5001 | `api-bienes-muebles` | `dbsiget`            |
| Recursos Humanos     | `modulos/RRHH/client`           | `modulos/RRHH/server`           | 5002 | `api-rrrhh`     | `dbsigetrrhh-1`      |
| Soporte Técnico      | `modulos/Servicio_soporte/client`| `modulos/Servicio_soporte/server`| 5003 | `api-soporte`   | `control_informatica`|

Además, el sistema cuenta con una **landing page** (`/home/`) que actúa como portal de entrada a los módulos.

---

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu máquina:

- **Node.js** (versión 18 LTS o superior) – [Descargar](https://nodejs.org/)
- **MySQL** (versión 8.0 o superior) – [Descargar](https://dev.mysql.com/downloads/)
- **Git** – [Descargar](https://git-scm.com/)
- (Opcional) **MySQL Workbench** o **phpMyAdmin** para administrar la base de datos.

> **Nota:** Ya no se utiliza XAMPP ni PHP. Todo el sistema está construido con Node.js y React.

---

## 🚀 Configuración para Desarrollo Local (Windows / Linux / macOS)

Sigue estos pasos para ejecutar el sistema en tu entorno local. Puedes clonar el repositorio en cualquier directorio de tu elección.

### 1. Clonar el repositorio

```bash
git clone https://github.com/hoseaal/SIGET.git
cd SIGET
```

### 2. Crear las bases de datos e importar los datos

Los scripts SQL se encuentran en la carpeta `BDA/`. Cada módulo tiene su propia base de datos y su propio archivo de importación.

Conéctate a MySQL y crea las tres bases de datos:

```sql
CREATE DATABASE dbsiget;
CREATE DATABASE dbsigetrrhh-1;
CREATE DATABASE control_informatica;
```

Luego importa cada script SQL en su base de datos correspondiente:

```bash
mysql -u root -p dbsiget < BDA/dbsiget.sql
mysql -u root -p dbsigetrrhh-1 < BDA/dbsigetrrhh-1.sql
mysql -u root -p control_informatica < BDA/control_informatica.sql
```

(Introduce la contraseña de tu usuario root cuando se solicite.)

### 3. Configurar variables de entorno (`.env`) para cada módulo

Cada backend necesita su propio archivo `.env` con las credenciales de conexión a su base de datos correspondiente.  
Crea los siguientes archivos:

- `modulos/BienesMuebles/server/.env`
- `modulos/RRHH/server/.env`
- `modulos/Servicio_soporte/server/.env`

Con este contenido (ajusta `DB_PASSWORD`, `DB_NAME` y `PORT` según el módulo):

#### Para Bienes Muebles (`modulos/BienesMuebles/server/.env`):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=dbsiget
PORT=5001
JWT_SECRET=una_clave_secreta_muy_segura_de_al_menos_32_caracteres
```

#### Para RRHH (`modulos/RRHH/server/.env`):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=dbsigetrrhh-1
PORT=5002
JWT_SECRET=una_clave_secreta_muy_segura_de_al_menos_32_caracteres
```

#### Para Soporte (`modulos/Servicio_soporte/server/.env`):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=control_informatica
PORT=5003
JWT_SECRET=una_clave_secreta_muy_segura_de_al_menos_32_caracteres
```

> **Importante:** Estos archivos contienen información sensible y **nunca deben subirse al repositorio** (ya están en `.gitignore`).

### 4. Instalar dependencias de cada módulo

Ejecuta los siguientes comandos desde la raíz del proyecto para instalar las dependencias del backend y del frontend de **cada módulo**.

#### Módulo Bienes Muebles

```bash
# Backend
cd modulos/BienesMuebles/server
npm install

# Frontend
cd ../client
npm install

# Volver a la raíz
cd ../../..
```

#### Módulo Recursos Humanos (RRHH)

```bash
# Backend
cd modulos/RRHH/server
npm install

# Frontend
cd ../client
npm install

# Volver a la raíz
cd ../../..
```

#### Módulo Soporte Técnico

```bash
# Backend
cd modulos/Servicio_soporte/server
npm install

# Frontend
cd ../client
npm install

# Volver a la raíz
cd ../../..
```

### 5. Ejecutar el sistema en modo desarrollo

Necesitarás mantener abiertas varias terminales (una por cada backend y una por cada frontend).  
Puedes usar un administrador de terminales como el integrado en VS Code.

**Iniciar los backends** (una terminal por módulo):

```bash
# Bienes Muebles (puerto 5001)
cd modulos/BienesMuebles/server
npm run dev   # o node api-rest.js

# RRHH (puerto 5002)
cd modulos/RRHH/server
npm run dev

# Soporte (puerto 5003)
cd modulos/Servicio_soporte/server
npm run dev
```

**Iniciar los frontends** (una terminal por módulo):

```bash
# Bienes Muebles (Vite servirá en http://localhost:5173)
cd modulos/BienesMuebles/client
npm run dev

# RRHH (puerto 5174 u otro)
cd modulos/RRHH/client
npm run dev

# Soporte
cd modulos/Servicio_soporte/client
npm run dev
```

### 6. Acceder al sistema

- La **landing page** se encuentra en `SIGET/home/index.html`. Puedes abrirla directamente en tu navegador o servirla con un servidor estático (por ejemplo, `npx serve home`).
- Desde la landing, los enlaces a cada módulo apuntan a las URLs de desarrollo de Vite (ej. `http://localhost:5173` para Bienes Muebles).  
  Asegúrate de que los enlaces en `home/index.html` estén actualizados con las rutas correctas (puedes editarlos manualmente).

---

## 🌐 Configuración para Producción (Linux – Ubuntu/Debian)

**El sistema debe ser clonado en el directorio `/var/www/SIGET/`** para que Nginx y PM2 funcionen correctamente con las rutas definidas.

Esta sección describe el despliegue completo en un servidor de producción con **Nginx** como proxy inverso y **PM2** para gestionar los procesos Node.js.

### Requisitos del servidor

- Sistema operativo: Ubuntu 20.04 / Debian 10 (o superior)
- Acceso con `sudo`
- Conexión a Internet para descargar paquetes
- Una IP fija dentro de la red interna (ej. `192.168.4.4`)

### 1. Actualizar el sistema e instalar herramientas básicas

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl git build-essential -y
```

### 2. Instalar Node.js (LTS) con NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

Verifica la instalación:

```bash
node -v   # v18.x o superior
npm -v    # 9.x o superior
```

### 3. Instalar MySQL Server

```bash
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql
```

Realiza la configuración de seguridad:

```bash
sudo mysql_secure_installation
```

(Establece una contraseña para root, elimina usuarios anónimos, etc.)

Crea las tres bases de datos:

```bash
sudo mysql -u root -p
CREATE DATABASE dbsiget;
CREATE DATABASE dbsigetrrhh-1;
CREATE DATABASE control_informatica;
EXIT;
```

### 4. Instalar Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Instalar PM2 globalmente

```bash
sudo npm install pm2 -g
```

### 6. Clonar el repositorio en el directorio de trabajo

**Asegúrate de clonar en `/var/www/SIGET`**:

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/hoseaal/SIGET.git
cd SIGET
```

Ajusta los permisos:

```bash
sudo chown -R $USER:$USER /var/www/SIGET
sudo chmod -R 755 /var/www/SIGET
```

### 7. Configurar variables de entorno (`.env`) para cada módulo

Crea los archivos `.env` en las carpetas `server/` de cada módulo con las credenciales y el nombre de la base de datos correspondiente (como se indicó en la sección de desarrollo, pero adaptando `DB_NAME` y `PORT`).

### 8. Importar las bases de datos

Los scripts SQL están en `BDA/`. Importa cada uno a su base de datos:

```bash
sudo mysql -u root -p dbsiget < /var/www/SIGET/BDA/dbsiget.sql
sudo mysql -u root -p dbsigetrrhh-1 < /var/www/SIGET/BDA/dbsigetrrhh-1.sql
sudo mysql -u root -p control_informatica < /var/www/SIGET/BDA/control_informatica.sql
```

### 9. Instalar dependencias y compilar los frontends para cada módulo

Ejecuta estos comandos para **cada módulo** (BienesMuebles, RRHH, Servicio_soporte):

```bash
cd /var/www/SIGET/modulos/NOMBRE_MODULO

# Backend (dependencias de producción)
cd server
npm install --production
cd ..

# Frontend (instalar dependencias y compilar)
cd client
npm install
npm run build   # genera la carpeta dist/ con los archivos estáticos
cd ../..
```

Repite para los tres módulos.

### 10. Iniciar los backends con PM2 (usando los nombres exactos)

```bash
cd /var/www/SIGET/modulos/BienesMuebles/server
pm2 start api-rest.js --name "api-bienes-muebles"

cd /var/www/SIGET/modulos/RRHH/server
pm2 start api-rest.js --name "api-rrrhh"

cd /var/www/SIGET/modulos/Servicio_soporte/server
pm2 start api-rest.js --name "api-soporte"
```

Configura PM2 para que se inicie automáticamente al reiniciar el servidor:

```bash
pm2 startup
# Copia y ejecuta el comando que aparece
pm2 save
```

Verifica el estado:

```bash
pm2 status
pm2 logs
```

### 11. Configurar Nginx como proxy inverso

Crea un archivo de configuración para SIGET:

```bash
sudo nano /etc/nginx/sites-available/siget
```

Pega la siguiente configuración (ajusta las rutas si es necesario):

```nginx
server {
    listen 80;
    server_name siget.cet www.siget.cet;  # Cambia por la IP o dominio real

    # ==========================================
    # 1. LANDING PAGE
    # ==========================================
    location / {
        root /var/www/SIGET/home;
        index index.html index.htm;
        try_files $uri $uri/ =404;
    }

    # ==========================================
    # 2. MÓDULO: BIENES MUEBLES
    # ==========================================
    location /BienesMuebles {
        alias /var/www/SIGET/modulos/BienesMuebles/client/dist/;
        index index.html;
        try_files $uri $uri/ /BienesMuebles/index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5001/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ==========================================
    # 3. MÓDULO: RECURSOS HUMANOS
    # ==========================================
    location /RRHH/ {
        alias /var/www/SIGET/modulos/RRHH/client/dist/;
        index index.html;
        try_files $uri $uri/ /RRHH/index.html;
    }

    location /api/rrhh {
        proxy_pass http://127.0.0.1:5002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ==========================================
    # 4. MÓDULO: SOPORTE TÉCNICO
    # ==========================================
    location /soporte/ {
        alias /var/www/SIGET/modulos/Servicio_soporte/client/dist/;
        index index.html;
        try_files $uri $uri/ /soporte/index.html;
    }

    location /api/sp {
        proxy_pass http://127.0.0.1:5003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Habilita el sitio y reinicia Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/siget /etc/nginx/sites-enabled/
sudo nginx -t   # Verifica la sintaxis
sudo systemctl restart nginx
```

### 12. Verificación final

- Comprueba que los backends estén corriendo con `pm2 status` (deben aparecer como `online`).
- Abre un navegador en la misma red y accede a `http://<IP_DEL_SERVIDOR>/`. Deberías ver la landing page.
- Prueba cada módulo: `http://<IP>/BienesMuebles`, `http://<IP>/RRHH`, `http://<IP>/soporte`.
- Verifica que las llamadas a la API funcionen (por ejemplo, desde el frontend o con `curl` a `http://<IP>/api/...`).

---

## 🔧 Mantenimiento y Preguntas Frecuentes (FAQ)

### ¿Cómo actualizo el sistema a la última versión?

1. Conéctate al servidor y navega a la raíz del proyecto:
   ```bash
   cd /var/www/SIGET
   sudo git pull origin main
   ```

2. Si hubo cambios en el backend de algún módulo, reinstala dependencias y reinicia el proceso PM2:
   ```bash
   cd modulos/BienesMuebles/server
   npm install --production
   pm2 restart api-bienes-muebles
   # Repite para RRHH (api-rrrhh) y Soporte (api-soporte)
   ```

3. Si hubo cambios en el frontend, recompila:
   ```bash
   cd modulos/BienesMuebles/client
   npm install
   npm run build
   # Repite para los demás módulos
   ```

4. Si hubo cambios en la base de datos de algún módulo, importa el script SQL correspondiente (haz un respaldo previo).

### El servidor se reinició, ¿cómo vuelvo a encender los servicios?

- **MySQL** y **Nginx** se inician automáticamente (si habilitaste `systemctl enable`).
- **PM2** también se inicia automáticamente si ejecutaste `pm2 startup` y `pm2 save`.  
  Puedes verificar con `pm2 status`. Si no, ejecuta `pm2 resurrect`.

### ¿Dónde puedo ver los registros de errores?

- **Logs de Nginx:** `/var/log/nginx/access.log` y `error.log`.
- **Logs de PM2:** `pm2 logs nombre-del-proceso` (ej. `pm2 logs api-bienes-muebles`).
- **Logs de MySQL:** `/var/log/mysql/error.log`.

### ¿Cómo accedo al sistema desde mi computadora?

- El sistema se encuentra en la red interna de la Contraloría. Usa la IP del servidor: `http://<IP_DEL_SERVIDOR>/`.
- Si tienes un dominio configurado (ej. `siget.cet`), asegúrate de que apunte a la IP del servidor en el archivo `hosts` de cada máquina cliente o en el DNS interno.

---

## 📂 Estructura del Proyecto

```
SIGET/
├── BDA/                          # Scripts SQL (dbsiget.sql, dbsigetrrhh-1.sql, control_informatica.sql)
├── home/                         # Landing page (index.html)
├── modulos/
│   ├── BienesMuebles/
│   │   ├── client/               # Frontend React
│   │   │   ├── src/
│   │   │   ├── dist/             # Compilado para producción
│   │   │   └── package.json
│   │   └── server/               # Backend Node.js
│   │       ├── src/
│   │       ├── api-rest.js
│   │       ├── .env              # Variables de entorno
│   │       └── package.json
│   ├── RRHH/                     # Estructura idéntica
│   └── Servicio_soporte/         # Estructura idéntica
└── README.md
```

---

## ⚠️ Consideraciones de Seguridad

- **Nunca subas** los archivos `.env` al repositorio (están en `.gitignore`).
- Cambia las contraseñas por defecto de MySQL y de los usuarios de la aplicación.
- Restringe el acceso a la base de datos solo desde localhost (ya configurado).
- Mantén actualizados Node.js, MySQL y Nginx con parches de seguridad.

---

## 👥 Responsables Técnicos

- **Módulo Bienes Muebles:** Jose Omaña ([@hoseaal](https://github.com/hoseaal))
- **Módulo Recursos Humanos:** Eduards Zambrano ([@EdZambrano21](https://github.com/EdZambrano21))
- **Módulo Soporte Técnico:** [nombre del responsable]

---

## 📌 Contacto

Para consultas, soporte o solicitudes de acceso, contacta al **Jefe de Área Técnica** de la Contraloría del Estado Táchira.

---

## Diagrama de Conexión del Sistema

```
+------------------+
|      USUARIO     |
+--------+---------+
         |
         | (1. Accede a la landing page)
         | `http://<IP>/`
         v
+--------+----------------------+
|     Página de Inicio          |
|   (/home/)                    |
| (Enlaces a cada módulo)       |
+-------------------------------+
    |         |         |
    |         |         |
(2a)   (2b)     (2c)
Bienes  RRHH   Soporte
    |         |         |
    v         v         v
+---+---------------------+   +------------------------------+   +------------------------------+
|  Módulo Bienes Muebles  |   |   Módulo Recursos Humanos    |   |   Módulo Soporte Técnico     |
| (Frontend: React)       |   |  (Frontend: React)           |   |  (Frontend: React)           |
| (Servido por Nginx)     |   |  (Servido por Nginx)         |   |  (Servido por Nginx)         |
+-----------+-------------+   +-----------+------------------+   +-----------+------------------+
            |                           |                                  |
            | (3. Peticiones /api)      | (3. Peticiones /api/rrhh)        | (3. Peticiones /api/sp)
            v                           v                                  v
+-----------+---------------+   +-----------+------------------+   +-----------+------------------+
|  Backend Node.js (5001)   |   |  Backend Node.js (5002)     |   |  Backend Node.js (5003)     |
|  (api-bienes-muebles)     |   |  (api-rrrhh)                |   |  (api-soporte)              |
|  BD: dbsiget              |   |  BD: dbsigetrrhh-1          |   |  BD: control_informatica    |
+-----------+---------------+   +-----------+------------------+   +-----------+------------------+
            |                           |                                  |
            +---------------------------+----------------------------------+
                                        |
                                        | (4. Conexión a MySQL)
                                        v
                                +--------------------+
                                |   Servidor MySQL   |
                                |  (tres bases de    |
                                |   datos separadas) |
                                +--------------------+
```

---

**¡Listo!** Con estos pasos tendrás el sistema SIGET completamente funcional en desarrollo o producción, con cada módulo utilizando su propia base de datos. Si encuentras algún problema, revisa los logs y contacta al equipo técnico.
```