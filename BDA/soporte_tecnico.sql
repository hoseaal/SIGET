-- ============================================================================
-- SIGET - Modulo de Soporte Tecnico
-- Dump de instalacion (esquema + datos minimos)
-- ============================================================================
--
-- Contenido:
--   1. Base de datos `soporte_tecnico` (utf8mb4).
--   2. Tablas:
--        departamentos               - areas de la Contraloria
--        departamento_bienes_map     - equivalencia con dbsiget.tesdep
--        clasificacion               - agrupaciones de actividades
--        tipo_actividad              - tipos de trabajo por clasificacion
--        usuarios                    - accesos al modulo
--        actividades                 - registro de soporte
--        bien_detalle_computo        - ficha tecnica de computadores
--        bien_componente             - componentes (RAM, disco, procesador...)
--   3. Datos minimos para el primer arranque:
--        - 14 departamentos y su mapeo a dbsiget.
--        - 6 clasificaciones (PREV_HW, PREV_SW, CORR_HW, CORR_SW,
--          SERV_REDES, INFORMES).
--        - 22 tipos de actividad iniciales.
--        - Usuario administrador inicial.
--
-- USUARIO INICIAL
--   username: admin
--   password: admin123
--   (se recomienda cambiar la clave desde el modulo apenas se ingrese)
--
-- INSTALACION
--   Consola:
--     mysql -u root -p < BDA/soporte_tecnico.sql
--   O desde phpMyAdmin: Importar > seleccionar este archivo > Continuar.
--
-- NOTAS
--   * El script elimina y recrea las tablas. Ejecutarlo sobre una base
--     existente borra los datos actuales del modulo.
--   * Los bienes muebles NO se cargan aqui: se consultan en vivo desde
--     dbsiget (API de Bienes Muebles). Las tablas de ficha tecnica arrancan
--     vacias y se llenan desde la pantalla de Bienes muebles.
--   * `equipos` es una tabla heredada de una version anterior; se elimina
--     si existiera.
--
-- ============================================================================

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `soporte_tecnico`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `soporte_tecnico`;

-- ----------------------------------------------------------------------------
-- Limpieza (reinstalacion)
-- ----------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `actividades`;
DROP TABLE IF EXISTS `bien_componente`;
DROP TABLE IF EXISTS `bien_detalle_computo`;
DROP TABLE IF EXISTS `departamento_bienes_map`;
DROP TABLE IF EXISTS `tipo_actividad`;
DROP TABLE IF EXISTS `clasificacion`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `departamentos`;
DROP TABLE IF EXISTS `equipos`; -- tabla heredada, se elimina al reinstalar

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- departamentos
-- ----------------------------------------------------------------------------
CREATE TABLE `departamentos` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `nombre`     VARCHAR(150) NOT NULL,
  `activo`     TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_departamento_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------
-- departamento_bienes_map
-- Equivalencia entre departamentos de Soporte y dbsiget.tesdep.
-- dep_ide NULL significa que el departamento no filtra bienes.
-- ----------------------------------------------------------------------------
CREATE TABLE `departamento_bienes_map` (
  `departamento_id` INT NOT NULL,
  `dep_ide`         INT DEFAULT NULL,
  `observacion`     VARCHAR(255) DEFAULT NULL,
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`departamento_id`),
  CONSTRAINT `fk_map_departamento` FOREIGN KEY (`departamento_id`)
    REFERENCES `departamentos` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------
-- bien_detalle_computo
-- Datos tecnicos ampliados de un computador de dbsiget.
-- La identificacion y ubicacion del bien se consultan en dbsiget.tmab_m.
-- ----------------------------------------------------------------------------
CREATE TABLE `bien_detalle_computo` (
  `bim_ide`            VARCHAR(10) NOT NULL,
  `nombre_equipo`      VARCHAR(100) DEFAULT NULL,
  `sistema_operativo`  VARCHAR(100) DEFAULT NULL,
  `version_office`     VARCHAR(100) DEFAULT NULL,
  `marca`              VARCHAR(100) DEFAULT NULL,
  `modelo`             VARCHAR(150) DEFAULT NULL,
  `serial`             VARCHAR(100) DEFAULT NULL,
  `ip`                 VARCHAR(45) DEFAULT NULL,
  `mac_address`        VARCHAR(17) DEFAULT NULL,
  `anydesk`            VARCHAR(50) DEFAULT NULL,
  `elaborado_por`      VARCHAR(100) DEFAULT NULL,
  `observaciones`      TEXT DEFAULT NULL,
  `created_at`         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`bim_ide`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------
-- bien_componente
-- Componentes internos del computador (RAM, disco, procesador, etc.).
-- Se permite mas de una fila del mismo tipo.
-- ----------------------------------------------------------------------------
CREATE TABLE `bien_componente` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `bim_ide`       VARCHAR(10) NOT NULL,
  `tipo`          VARCHAR(50) NOT NULL,
  `marca`         VARCHAR(100) DEFAULT NULL,
  `modelo`        VARCHAR(150) DEFAULT NULL,
  `serial`        VARCHAR(100) DEFAULT NULL,
  `capacidad`     VARCHAR(100) DEFAULT NULL,
  `nro_bien`      VARCHAR(50) DEFAULT NULL,
  `observaciones` VARCHAR(255) DEFAULT NULL,
  `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_componente_bim_ide` (`bim_ide`),
  CONSTRAINT `fk_componente_detalle` FOREIGN KEY (`bim_ide`)
    REFERENCES `bien_detalle_computo` (`bim_ide`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------
-- usuarios
-- ----------------------------------------------------------------------------
CREATE TABLE `usuarios` (
  `id`              INT NOT NULL AUTO_INCREMENT,
  `username`        VARCHAR(50) NOT NULL,
  `password_hash`   VARCHAR(255) NOT NULL,
  `nombres`         VARCHAR(100) NOT NULL,
  `apellidos`       VARCHAR(100) NOT NULL,
  `cedula`          VARCHAR(15) DEFAULT NULL,
  `email`           VARCHAR(120) DEFAULT NULL,
  `rol`             ENUM('Administrador','Tecnico','Consulta') NOT NULL DEFAULT 'Consulta',
  `departamento_id` INT DEFAULT NULL,
  `activo`          TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuario_username` (`username`),
  UNIQUE KEY `uk_usuario_cedula` (`cedula`),
  KEY `fk_usuarios_depto` (`departamento_id`),
  CONSTRAINT `fk_usuarios_depto` FOREIGN KEY (`departamento_id`)
    REFERENCES `departamentos` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------
-- clasificacion
-- Clasificaciones para agrupar los tipos de actividad
-- ----------------------------------------------------------------------------
CREATE TABLE `clasificacion` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(150) NOT NULL,
  `codigo`      VARCHAR(30) DEFAULT NULL,
  `orden`       INT NOT NULL DEFAULT 0,
  `activo`      TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_clasificacion_nombre` (`nombre`),
  UNIQUE KEY `uk_clasificacion_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------
-- tipo_actividad
-- Tipos de actividad asociados a una clasificacion
-- ----------------------------------------------------------------------------
CREATE TABLE `tipo_actividad` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `nombre`           VARCHAR(150) NOT NULL,
  `clasificacion_id` INT NOT NULL,
  `departamento_id`  INT DEFAULT NULL,
  `activo`           TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_tipoact_clasificacion` (`clasificacion_id`),
  KEY `fk_tipoact_depto` (`departamento_id`),
  CONSTRAINT `fk_tipoact_clasificacion` FOREIGN KEY (`clasificacion_id`)
    REFERENCES `clasificacion` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_tipoact_depto` FOREIGN KEY (`departamento_id`)
    REFERENCES `departamentos` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------
-- actividades
-- ----------------------------------------------------------------------------
CREATE TABLE `actividades` (
  `id`                INT NOT NULL AUTO_INCREMENT,
  `nro_act`           VARCHAR(20) DEFAULT NULL,
  `fecha`             DATE NOT NULL,
  `departamento_id`   INT NOT NULL,
  `clasificacion_id`  INT DEFAULT NULL,
  `tipo_actividad_id` INT NOT NULL,
  `bim_ide`           VARCHAR(10) DEFAULT NULL,
  `usuario_id`        INT NOT NULL,
  `observaciones`     TEXT DEFAULT NULL,
  `created_at`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_actividad_nro` (`nro_act`),
  KEY `idx_act_fecha` (`fecha`),
  KEY `idx_act_depto` (`departamento_id`),
  KEY `fk_act_clasificacion` (`clasificacion_id`),
  KEY `fk_act_tipo` (`tipo_actividad_id`),
  KEY `idx_act_bim_ide` (`bim_ide`),
  KEY `fk_act_usuario` (`usuario_id`),
  CONSTRAINT `fk_act_depto` FOREIGN KEY (`departamento_id`)
    REFERENCES `departamentos` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_act_clasificacion` FOREIGN KEY (`clasificacion_id`)
    REFERENCES `clasificacion` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_act_tipo` FOREIGN KEY (`tipo_actividad_id`)
    REFERENCES `tipo_actividad` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_act_usuario` FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

INSERT INTO `departamentos` (`id`, `nombre`) VALUES
  (1,  'Direccion General'),
  (2,  'Direccion de Investigaciones'),
  (3,  'Direccion de Servicios Generales, Seguridad y Transporte'),
  (4,  'Oficina de Atencion al Publico y Participacion Ciudadana'),
  (5,  'Consultoria Juridica'),
  (6,  'Direccion de Control de la Administracion Centralizada y Poder Legislativo'),
  (7,  'Direccion de Recursos Humanos'),
  (8,  'Direccion de Control de la Administracion Descentralizada'),
  (9,  'Direccion de Administracion'),
  (10, 'Direccion de Planificacion, Organizacion y Metodos'),
  (11, 'Direccion de Determinacion de Responsabilidades'),
  (12, 'Direccion de Secretaria del Despacho'),
  (13, 'Direccion de Auditoria Interna'),
  (14, 'Division de Servicio Tecnico');

-- Mapeo de departamentos de Soporte a dbsiget.tesdep
INSERT INTO `departamento_bienes_map` (`departamento_id`, `dep_ide`, `observacion`) VALUES
  (1, 4, 'Direccion General -> Direccion General'),
  (2, 14, 'Direccion de Investigaciones -> Direccion de Investigaciones'),
  (3, 11, 'Servicios Generales, Seguridad y Transporte -> Oficina de Transporte y Servicios Generales'),
  (4, 10, 'Atencion al Publico -> Oficina Atencion al Publico y Participacion Ciudadana'),
  (5, 5, 'Consultoria Juridica -> Direccion de Consultoria Juridica'),
  (6, 12, 'Control Adm. Centralizada y Poder Legislativo -> Direccion de la Administracion Central y Poder Legislativo'),
  (7, 8, 'Recursos Humanos -> Direccion de Recursos Humanos'),
  (8, 13, 'Control Adm. Descentralizada -> Direccion de la Administracion Descentralizada'),
  (9, 9, 'Administracion -> Direccion de Administracion'),
  (10, NULL, 'Sin equivalente en tesdep: Direccion de Planificacion, Organizacion y Metodos'),
  (11, 15, 'Determinacion de Responsabilidades -> Direccion de Determinacion de Responsabilidades'),
  (12, 2, 'Secretaria del Despacho -> Direccion de Secretaria del Despacho Contralor'),
  (13, 3, 'Auditoria Interna -> Unidad de Auditoria Interna'),
  (14, NULL, 'Sin equivalente en tesdep: Division de Servicio Tecnico');

-- Usuario inicial: admin / admin123 (bcrypt, costo 12)
INSERT INTO `usuarios`
  (`id`, `username`, `password_hash`, `nombres`, `apellidos`, `cedula`, `email`, `rol`, `departamento_id`)
VALUES
  (1, 'admin',
   '$2b$12$jBdebaCyAUdgw1yYV5YCueGHobqBGf4uz0YivNzwK8mJgyMCcKm.K',
   'Administrador', 'Sistema', '00000000', 'admin@contraloria.gob.ve',
   'Administrador', 14);

-- Clasificaciones
INSERT INTO `clasificacion` (`id`, `nombre`, `codigo`, `orden`) VALUES
  (1, 'Mantenimiento preventivo de hardware', 'PREV_HW', 1),
  (2, 'Mantenimiento preventivo de software',  'PREV_SW', 2),
  (3, 'Mantenimiento correctivo de hardware', 'CORR_HW', 3),
  (4, 'Mantenimiento correctivo de software', 'CORR_SW', 4),
  (5, 'Servicios / Redes',                   'SERV_REDES', 5),
  (6, 'Informes',                            'INFORMES', 6);

-- Tipos de actividad por clasificacion
INSERT INTO `tipo_actividad` (`id`, `nombre`, `clasificacion_id`, `departamento_id`) VALUES
  (1,  'Mantenimiento Preventivo',                        1, 14),
  (2,  'Revision de Equipo, partes o piezas',             1, 14),
  (3,  'Recuperacion de Equipo PC',                        3, 14),
  (4,  'Mantenimiento Correctivo',                         3, 14),
  (5,  'Formateo de PC, Respaldo Usuario',                 4, 14),
  (6,  'Instalacion de Aplicacion',                        2, 14),
  (7,  'Instalacion de Impresora en RED',                  5, 14),
  (8,  'Monitoreo de Conexion CANTV',                      5, 14),
  (9,  'Revision Linea Telefonica',                        5, 14),
  (10, 'Mudanza de Equipo o Impresora',                    5, 14),
  (11, 'Instalacion de Punto de Red, Router, Switch',      5, 14),
  (12, 'Instalacion de Toner',                             5, 14),
  (13, 'Captura de Huellas',                               5, 14),
  (14, 'Actividades de Bases de Datos',                    5, 14),
  (15, 'Actividades de Inventario',                        6, 14),
  (16, 'Informe Asignacion de Toner',                      6, 14),
  (17, 'Desarrollo de Manual',                             6, 14),
  (18, 'Adiestramiento Personal Contraloria',              6, 14),
  (19, 'Informe Tecnico',                                  6, 14),
  (20, 'Reunion con Director de Area',                     6, 14),
  (21, 'Reporte Biometrico',                               6, 14),
  (22, 'OTRO',                                             6, 14);

-- ============================================================================
-- VERIFICACION
-- ============================================================================
SELECT
  (SELECT COUNT(*) FROM `departamentos`)          AS departamentos,
  (SELECT COUNT(*) FROM `departamento_bienes_map`) AS mapa_bienes,
  (SELECT COUNT(*) FROM `usuarios`)               AS usuarios,
  (SELECT COUNT(*) FROM `clasificacion`)          AS clasificaciones,
  (SELECT COUNT(*) FROM `tipo_actividad`)         AS tipos_actividad;

SELECT 'Instalacion del modulo Soporte Tecnico completada. Ingresar con admin / admin123' AS mensaje;
