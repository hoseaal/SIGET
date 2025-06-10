# Documentación de Base de Datos: `dbsiget`

## Tabla: `tesant` (Antigüedades)

*Descripción:* Registra los rangos de antigüedad de los empleados.

| Columna    | Tipo       | Clave | Nulo | Valor por defecto | Comentario                           |
|------------|------------|-------|------|-------------------|---------------------------------------|
| `ant_ide`  | INT(11)    | PK    | No   | AUTO_INCREMENT    | Identificador único de antigüedad    |
| `ant_ani`  | DATE       |       | No   |                   | Años de antigüedad inicial           |
| `ant_anf`  | DATE       |       | No   |                   | Años de antigüedad final             |
| `nom_ced`  | VARCHAR(10)| FK    | No   |                   | Cédula del empleado (FK a `tmanom`)  |

*Relaciones:*
- `nom_ced` → FK a `tmanom.nom_ced`

---

## Tabla: `tescae` (Categorías Específicas)

*Descripción:* Almacena categorías específicas de bienes muebles.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                              |
|------------|--------------|-------|------|-------------------|------------------------------------------|
| `cae_ide`  | INT(11)      | PK    | No   |                   | Identificador de categoría específica    |
| `cae_cae`  | VARCHAR(100) |       | No   |                   | Descripción de categoría específica      |
| `sca_ide`  | INT(11)      | FK    | No   |                   | Referencia a subcategoría en `tessca`   |

*Relaciones:*
- `sca_ide` → FK a `tessca.sca_ide`

---

## Tabla: `tescet` (Cargos CET)

*Descripción:* Catálogo de cargos del personal CET.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `cet_ide`  | INT(11)      | PK    | No   | AUTO_INCREMENT    | Identificador único de cargo CET|
| `cet_car`  | VARCHAR(50)  |       | No   |                   | Nombre del cargo CET           |

---

## Tabla: `tesded` (Deducciones)

*Descripción:* Registra las deducciones aplicables a nómina.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `ded_ide`  | INT(11)      | PK    | No   | AUTO_INCREMENT    | Identificador único de deducción|
| `ded_raz`  | VARCHAR(100) |       | No   |                   | Razón de la deducción          |
| `ded_por`  | DECIMAL(10,2)|       | No   |                   | Porcentaje de la deducción     |

---

## Tabla: `tesdep` (Departamentos)

*Descripción:* Estructura organizacional de departamentos.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `dep_ide`  | INT(11)      | PK    | No   | AUTO_INCREMENT    | Identificador único de departamento|
| `dep_nom`  | VARCHAR(255) |       | No   |                   | Nombre del departamento        |
| `dep_des`  | TEXT         |       | Sí   | NULL              | Descripción del departamento   |

---

## Tabla: `tesmod` (Modelos)

*Descripción:* Catálogo de modelos de bienes muebles.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `mod_ide`  | VARCHAR(10)  | PK    | No   |                   | Identificador de modelo        |
| `mod_mod`  | VARCHAR(50)  |       | No   |                   | Descripción de modelo          |
| `mar_ide`  | INT(11)      | FK    | No   |                   | Referencia a marca en `tmamar` |

*Relaciones:*
- `mar_ide` → FK a `tmamar.mar_ide`

---

## Tabla: `tesona` (Cargos ONAPRE)

*Descripción:* Catálogo de cargos del personal ONAPRE.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                      |
|------------|--------------|-------|------|-------------------|----------------------------------|
| `ona_ide`  | INT(11)      | PK    | No   | AUTO_INCREMENT    | Identificador único de cargo ONAPRE|
| `ona_car`  | VARCHAR(50)  |       | No   |                   | Nombre del cargo ONAPRE         |

---

## Tabla: `tesnvl` (Niveles Salariales)

*Descripción:* Define los rangos salariales.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                      |
|------------|--------------|-------|------|-------------------|----------------------------------|
| `nvl_ide`  | INT(11)      | PK    | No   | AUTO_INCREMENT    | Identificador único del rango   |
| `nvl_ran`  | VARCHAR(5)   |       | No   |                   | Tipo de nivel salarial          |
| `nvl_sal`  | DECIMAL(10,2)|       | No   |                   | Salario correspondiente         |
| `ona_ide`  | INT(11)      | FK    | Sí   | NULL              | Referencia a cargo ONAPRE       |

*Relaciones:*
- `ona_ide` → FK a `tesona.ona_ide`

---

## Tabla: `tesnvl_historico` (Histórico de Niveles Salariales)

*Descripción:* Registro histórico de cambios salariales.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                      |
|------------|--------------|-------|------|-------------------|----------------------------------|
| `nvl_ide`  | INT(11)      | PK    | No   | AUTO_INCREMENT    | Identificador único             |
| `nvl_ran`  | VARCHAR(5)   |       | No   |                   | Tipo de nivel salarial          |
| `nvl_sal`  | DECIMAL(10,2)|       | No   |                   | Salario histórico               |
| `ona_ide`  | INT(11)      | FK    | Sí   | NULL              | Referencia a cargo ONAPRE       |
| `nvl_fec`  | DATE         |       | No   |                   | Fecha del salario histórico     |

*Relaciones:*
- `ona_ide` → FK a `tesona.ona_ide`

---

## Tabla: `tespri` (Primas)

*Descripción:* Registra las primas aplicables a nómina.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `pri_ide`  | INT(11)      | PK    | No   | AUTO_INCREMENT    | Identificador único de prima   |
| `pri_raz`  | VARCHAR(100) |       | No   |                   | Razón de la prima              |
| `pri_por`  | DECIMAL(5,2) |       | No   |                   | Porcentaje de la prima         |

---

## Tabla: `tessca` (Subcategorías)

*Descripción:* Subcategorías de bienes muebles.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `sca_ide`  | INT(11)      | PK    | No   |                   | Identificador de subcategoría   |
| `sca_sca`  | VARCHAR(100) |       | No   |                   | Descripción de subcategoría    |
| `cat_ide`  | INT(11)      | FK    | No   |                   | Referencia a categoría en `tmacat` |

*Relaciones:*
- `cat_ide` → FK a `tmacat.cat_ide`

---

## Tabla: `tesusu` (Usuarios)

*Descripción:* Registro de usuarios del sistema.

| Columna      | Tipo         | Clave | Nulo | Valor por defecto | Comentario                           |
|--------------|--------------|-------|------|-------------------|---------------------------------------|
| `usu_ide`    | VARCHAR(10)  | PK    | No   |                   | Identificador único del usuario       |
| `usu_usu`    | VARCHAR(10)  |       | No   |                   | Nickname del usuario                  |
| `usu_con`    | VARCHAR(255) |       | No   |                   | Contraseña (hashed)                   |
| `usu_nom`    | VARCHAR(50)  |       | No   |                   | Nombres del usuario                   |
| `usu_ape`    | VARCHAR(50)  |       | No   |                   | Apellidos del usuario                 |
| `usu_tip`    | INT(1)       |       | No   |                   | Perfil/tipo de usuario                |
| `usu_mod`    | INT(2)       |       | No   |                   | Módulos de acceso                     |
| `nom_ced`    | VARCHAR(10)  | FK    | Sí   | NULL              | Cédula del empleado (FK a `tmanom`)  |

*Relaciones:*
- `nom_ced` → FK a `tmanom.nom_ced`

---

## Tabla: `tmab_m` (Bienes Muebles)

*Descripción:* Inventario de bienes muebles.

| Columna       | Tipo          | Clave | Nulo | Valor por defecto | Comentario                           |
|---------------|---------------|-------|------|-------------------|---------------------------------------|
| `bim_ide`     | VARCHAR(10)   | PK    | No   |                   | Código interno del bien              |
| `bim_des`     | TEXT          |       | No   |                   | Descripción del bien                 |
| `bim_fec`     | DATE          |       | No   |                   | Fecha de adquisición                 |
| `bim_ndo`     | VARCHAR(10)   |       | No   |                   | Número de documento (factura)        |
| `bim_val`     | DECIMAL(10,0) |       | No   |                   | Valor monetario                      |
| `bim_moneda`  | VARCHAR(10)   |       | No   |                   | Moneda (Bolívares)                   |
| `bim_color`   | VARCHAR(30)   |       | No   |                   | Color del bien                       |
| `bim_cod`     | VARCHAR(20)   |       | No   |                   | Código SUDEBIN                       |
| `bim_obs`     | TEXT          |       | Sí   | NULL              | Observaciones                        |
| `bim_sede`    | VARCHAR(20)   |       | No   |                   | Sede (PRINCIPAL)                     |
| `est_ide`     | INT(11)       | FK    | No   |                   | Estado (FK a `tmaest`)               |
| `tip_ide`     | INT(11)       | FK    | No   |                   | Tipo (FK a `tmatip`)                 |
| `foa_ide`     | INT(11)       | FK    | No   |                   | Forma adquisición (FK a `tmafoa`)    |
| `con_ide`     | INT(11)       | FK    | No   |                   | Condición (FK a `tmacon`)            |
| `esu_ide`     | INT(11)       | FK    | No   |                   | Estado uso (FK a `tmaesu`)           |
| `mod_ide`     | VARCHAR(10)   | FK    | Sí   | NULL              | Modelo (FK a `tesmod`)               |
| `cae_ide`     | INT(11)       | FK    | Sí   | NULL              | Categoría específica (FK a `tescae`) |
| `bim_inc`     | TINYINT(1)    |       | Sí   | 1                 | Incorporado (1) o desincorporado (0) |
| `bim_fed`     | DATE          |       | Sí   | NULL              | Fecha de desincorporación            |
| `com_ide`     | INT(11)       | FK    | Sí   | NULL              | Concepto movimiento (FK a `tmacom`)  |
| `dep_ide`     | INT(11)       | FK    | Sí   | NULL              | Departamento (FK a `tesdep`)         |

*Relaciones:*
- `est_ide` → FK a `tmaest.est_ide`
- `tip_ide` → FK a `tmatip.tip_ide`
- `foa_ide` → FK a `tmafoa.foa_ide`
- `con_ide` → FK a `tmacon.con_ide`
- `esu_ide` → FK a `tmaesu.esu_ide`
- `mod_ide` → FK a `tesmod.mod_ide`
- `cae_ide` → FK a `tescae.cae_ide`
- `com_ide` → FK a `tmacom.com_ide`
- `dep_ide` → FK a `tesdep.dep_ide`

---

## Tabla: `tmacat` (Categorías)

*Descripción:* Categorías principales de bienes.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `cat_ide`  | INT          | PK    | No   |                   | Identificador de categoría      |
| `cat_cat`  | VARCHAR(100) |       | No   |                   | Descripción de categoría        |

---

## Tabla: `tmacon` (Condiciones Físicas)

*Descripción:* Estados físicos de los bienes.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `con_ide`  | INT(11)      | PK    | No   |                   | Identificador de condición      |
| `con_con`  | VARCHAR(50)  |       | No   |                   | Descripción de condición        |

---

## Tabla: `tmaest` (Estatus de Bienes)

*Descripción:* Estatus administrativos de los bienes.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `est_ide`  | INT(11)      | PK    | No   |                   | Identificador de status         |
| `est_est`  | VARCHAR(50)  |       | No   |                   | Descripción de status           |

---

## Tabla: `tmaesu` (Estados de Uso)

*Descripción:* Estados operativos de los bienes.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `esu_ide`  | INT(11)      | PK    | No   |                   | Identificador de estado de uso  |
| `esu_esu`  | VARCHAR(50)  |       | No   |                   | Descripción de estado de uso    |

---

## Tabla: `tmafoa` (Formas de Adquisición)

*Descripción:* Métodos de obtención de bienes.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `foa_ide`  | INT(11)      | PK    | No   |                   | Identificador de forma adquisición|
| `foa_nom`  | VARCHAR(50)  |       | No   |                   | Descripción de forma adquisición|

---

## Tabla: `tmamar` (Marcas)

*Descripción:* Catálogo de marcas de bienes.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `mar_ide`  | INT(11)      | PK    | No   | AUTO_INCREMENT    | Identificador único de marca   |
| `mar_mar`  | VARCHAR(100) |       | No   |                   | Descripción de marca           |

---

## Tabla: `tmanom` (Nómina)

*Descripción:* Registro completo de empleados.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                           |
|------------|--------------|-------|------|-------------------|---------------------------------------|
| `nom_ced`  | VARCHAR(10)  | PK    | No   |                   | Cédula del empleado                   |
| `nom_nom`  | VARCHAR(50)  |       | No   |                   | Nombre del empleado                   |
| `nom_ape`  | VARCHAR(50)  |       | No   |                   | Apellido del empleado                 |
| `nom_fec`  | DATE         |       | No   |                   | Fecha de ingreso                      |
| `nom_gen`  | ENUM('M','F')|       | No   |                   | Género (M/F)                          |
| `nom_nhi`  | INT(11)      |       | No   |                   | Número de hijos                       |
| `nom_pro`  | INT(1)       |       | No   |                   | Profesionalización (1=Profesional)    |
| `cet_ide`  | INT(11)      | FK    | No   |                   | Cargo CET (FK a `tescet`)             |
| `ona_ide`  | INT(11)      | FK    | No   |                   | Cargo ONAPRE (FK a `tesona`)          |
| `nvl_ran`  | VARCHAR(3)   |       | No   |                   | Nivel salarial                        |
| `dep_ide`  | INT(11)      | FK    | No   |                   | Departamento (FK a `tesdep`)          |

*Relaciones:*
- `cet_ide` → FK a `tescet.cet_ide`
- `ona_ide` → FK a `tesona.ona_ide`
- `dep_ide` → FK a `tesdep.dep_ide`

---

## Tabla: `tmatip` (Tipos de Bienes)

*Descripción:* Clasificación de tipos de bienes.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `tip_ide`  | INT(11)      | PK    | No   |                   | Identificador de tipo de bien  |
| `tip_tip`  | VARCHAR(50)  |       | No   |                   | Descripción del tipo de bien   |

---

## Tabla: `tmacom` (Conceptos de Movimiento)

*Descripción:* Tipos de movimientos de bienes.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                     |
|------------|--------------|-------|------|-------------------|---------------------------------|
| `com_ide`  | INT(11)      | PK    | No   |                   | Identificador de concepto       |
| `com_com`  | VARCHAR(50)  |       | No   |                   | Descripción de concepto         |

---

## Tabla: `tessup` (Suplencias)

*Descripción:* Registro de suplencias de personal.

| Columna       | Tipo         | Clave | Nulo | Valor por defecto | Comentario                           |
|---------------|--------------|-------|------|-------------------|---------------------------------------|
| `sup_ide`     | INT(11)      | PK    | No   | AUTO_INCREMENT    | ID único de suplencia                |
| `nom_ced`     | VARCHAR(10)  | FK    | No   |                   | Cédula del empleado suplente         |
| `sup_fec_ini` | DATE         |       | No   |                   | Fecha de inicio                      |
| `sup_fec_fin` | DATE         |       | Sí   | NULL              | Fecha de fin (NULL si activa)        |
| `cet_ide`     | INT(11)      | FK    | Sí   | NULL              | Cargo CET que suple                  |
| `ona_ide`     | INT(11)      | FK    | Sí   | NULL              | Cargo ONAPRE que suple               |
| `nvl_ran`     | VARCHAR(3)   |       | Sí   | NULL              | Nivel salarial durante suplencia     |
| `dep_ide`     | INT(11)      | FK    | Sí   | NULL              | Departamento durante suplencia       |
| `sup_activa`  | TINYINT(1)   |       | Sí   | 1                 | 1=Activa, 0=Inactiva                 |

*Relaciones:*
- `nom_ced` → FK a `tmanom.nom_ced`
- `cet_ide` → FK a `tescet.cet_ide`
- `ona_ide` → FK a `tesona.ona_ide`
- `dep_ide` → FK a `tesdep.dep_ide`

---

## Tabla: `tescep` (Caja de Ahorro Patronal)

*Descripción:* Registro de cajas de ahorro de empleados.

| Columna      | Tipo         | Clave | Nulo | Valor por defecto | Comentario                           |
|--------------|--------------|-------|------|-------------------|---------------------------------------|
| `cep_ide`    | INT(11)      | PK    | No   | AUTO_INCREMENT    | ID único de registro                 |
| `cep_activa` | TINYINT(1)   |       | Sí   | 1                 | 1=Activa, 0=Inactiva                 |
| `nom_ced`    | VARCHAR(10)  | FK    | No   |                   | Cédula del empleado (FK a `tmanom`)  |

*Relaciones:*
- `nom_ced` → FK a `tmanom.nom_ced`

---

## Tabla: `ttrpre` (Préstamos de Bienes)

*Descripción:* Control de préstamos de bienes a departamentos.

| Columna    | Tipo         | Clave | Nulo | Valor por defecto | Comentario                           |
|------------|--------------|-------|------|-------------------|---------------------------------------|
| `pre_ide`  | INT          | PK    | No   | AUTO_INCREMENT    | ID único de préstamo                 |
| `bim_ide`  | VARCHAR(10)  | FK    | No   |                   | Bien prestado (FK a `tmab_m`)        |
| `dep_ide`  | INT          | FK    | No   |                   | Departamento (FK a `tesdep`)         |
| `pre_des`  | TEXT         |       | Sí   | NULL              | Observaciones del préstamo           |
| `pre_est`  | TINYINT(1)   |       | Sí   |                   | 1=Prestado, 0=Devuelto               |

*Relaciones:*
- `bim_ide` → FK a `tmab_m.bim_ide`
- `dep_ide` → FK a `tesdep.dep_ide`

---

## Bitácoras

### Estructura común de bitácoras:
Todas las tablas de bitácora comparten esta estructura:

| Columna                     | Tipo                         | Comentario                                      |
|-----------------------------|------------------------------|------------------------------------------------|
| `bit_id`                    | INT AUTO_INCREMENT           | ID único del registro                          |
| `bit_tabla`                 | VARCHAR(50)                  | Nombre de la tabla afectada                    |
| `bit_operacion`             | ENUM('INSERT','UPDATE','DELETE') | Tipo de operación registrada               |
| `bit_[tabla]_[clave]`       | Depende de la tabla          | ID del registro afectado (ej: `bit_nom_ced`)  |
| `bit_usuario_responsable`   | VARCHAR(10)                  | Cédula del usuario que realizó el cambio      |
| `bit_detalles`              | JSON                         | Datos antiguos/nuevos en formato JSON         |
| `bit_fecha`                 | TIMESTAMP                    | Fecha del cambio (CURRENT_TIMESTAMP)          |

### Tablas de bitácora:
1. `bit_usu` - Cambios en usuarios (`tesusu`)
2. `bit_nom` - Cambios en nómina (`tmanom`)
3. `bit_cet` - Cambios en cargos CET (`tescet`)
4. `bit_ona` - Cambios en cargos ONAPRE (`tesona`)
5. `bit_nvl` - Cambios en niveles salariales (`tesnvl`)
6. `bit_sup` - Cambios en suplencias (`tessup`)
7. `bit_cep` - Cambios en caja de ahorro (`tescep`)
8. `bit_ded` - Cambios en deducciones (`tesded`)
9. `bit_pri` - Cambios en primas (`tespri`)

---

## Diagrama de Relaciones
```mermaid
erDiagram
    tmanom ||--o{ tesant : "nom_ced"
    tmanom ||--|{ tesusu : "nom_ced"
    tmanom }|--|| tescet : "cet_ide"
    tmanom }|--|| tesona : "ona_ide"
    tmanom }|--|| tesdep : "dep_ide"
    tessca }|--|| tmacat : "cat_ide"
    tescae }|--|| tessca : "sca_ide"
    tmab_m }|--|| tescae : "cae_ide"
    tmab_m }|--|| tesmod : "mod_ide"
    tesmod }|--|| tmamar : "mar_ide"
    tmab_m }|--|| tmaest : "est_ide"
    tmab_m }|--|| tmatip : "tip_ide"
    tmab_m }|--|| tmafoa : "foa_ide"
    tmab_m }|--|| tmacon : "con_ide"
    tmab_m }|--|| tmaesu : "esu_ide"
    tmab_m }|--|| tmacom : "com_ide"
    tmab_m }|--|| tesdep : "dep_ide"
    ttrpre }|--|| tmab_m : "bim_ide"
    ttrpre }|--|| tesdep : "dep_ide"
    tesnvl }|--|| tesona : "ona_ide"
    tesnvl_historico }|--|| tesona : "ona_ide"
    tessup }|--|| tmanom : "nom_ced"
    tessup }|--|| tescet : "cet_ide"
    tessup }|--|| tesona : "ona_ide"
    tessup }|--|| tesdep : "dep_ide"
    tescep }|--|| tmanom : "nom_ced"