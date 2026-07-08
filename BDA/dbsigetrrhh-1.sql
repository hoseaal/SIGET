-- Generado para: Leandro Enmanuel Omaña Sánchez
-- Fecha: 2026-03-26
-- Objetivo: Base de Datos dbsigetrrhh (Versión Desestandarizada / Programación Intuitiva)

CREATE DATABASE IF NOT EXISTS `dbsigetrrhh`;
USE `dbsigetrrhh`;

-- --------------------------------------------------------
-- 1. ESTRUCTURA ORGANIZACIONAL
-- --------------------------------------------------------

CREATE TABLE `direcciones` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la Dirección',
  `nombre` VARCHAR(150) NOT NULL COMMENT 'Nombre completo de la Dirección',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `divisiones` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `direccion_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_division_direccion` FOREIGN KEY (`direccion_id`) REFERENCES `direcciones` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `unidades` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `division_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_unidad_division` FOREIGN KEY (`division_id`) REFERENCES `divisiones` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 2. TABLAS MAESTRAS DE APOYO
-- --------------------------------------------------------

CREATE TABLE `profesiones` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `estatus_funcionarios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `condiciones_laborales` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `cargos_cet` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `cargos_onapre` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 3. GESTIÓN DE SALARIOS Y PRIMAS
-- --------------------------------------------------------

CREATE TABLE `niveles_salariales` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `salario_base` DECIMAL(10,2) NOT NULL,
  `cargo_onapre_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_nivel_onapre` FOREIGN KEY (`cargo_onapre_id`) REFERENCES `cargos_onapre` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `niveles_salariales_antiguos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `salario_antiguo` DECIMAL(10,2) NOT NULL,
  `cargo_onapre_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_nivelant_onapre` FOREIGN KEY (`cargo_onapre_id`) REFERENCES `cargos_onapre` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `primas_profesionalizacion` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `descripcion` VARCHAR(100) NOT NULL,
  `porcentaje_actual` DECIMAL(5,2) NOT NULL,
  `porcentaje_anterior` DECIMAL(5,2),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `configuracion_antiguedad` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `anios_cumplidos` INT(3) NOT NULL UNIQUE,
  `porcentaje_actual` DECIMAL(5,2) NOT NULL,
  `porcentaje_anterior` DECIMAL(5,2),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 4. TABLA PRINCIPAL: EMPLEADOS (FUNCIONARIOS)
-- --------------------------------------------------------

CREATE TABLE `empleados` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `cedula` VARCHAR(15) NOT NULL UNIQUE,
  `nombres` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(100) NOT NULL,
  `rif` VARCHAR(20) UNIQUE,
  `fecha_nacimiento` DATE NOT NULL,
  `lugar_nacimiento` VARCHAR(100) NOT NULL,
  `genero` ENUM('M','F','O') NOT NULL,
  `estado_civil` VARCHAR(50) NOT NULL,
  `tipo_sangre` VARCHAR(5),
  `deportes` TEXT,
  `actividades_culturales` TEXT,
  `direccion_habitacion` VARCHAR(255) NOT NULL,
  `telefono_fijo` VARCHAR(20),
  `celular` VARCHAR(20) NOT NULL,
  `correo_principal` VARCHAR(150) NOT NULL,
  `correo_secundario` VARCHAR(150),
  `fecha_ingreso` DATE NOT NULL,
  `estudios_actuales` VARCHAR(255),
  `fecha_culminacion_estudios` DATE,
  `contacto_emergencia_1` VARCHAR(150) NOT NULL,
  `telefono_emergencia_1` VARCHAR(20) NOT NULL,
  `contacto_emergencia_2` VARCHAR(150),
  `telefono_emergencia_2` VARCHAR(20),
  `profesion_id` INT(11),
  `estatus_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_empleado_profesion` FOREIGN KEY (`profesion_id`) REFERENCES `profesiones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_empleado_estatus` FOREIGN KEY (`estatus_id`) REFERENCES `estatus_funcionarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 5. DATOS CONTRACTUALES Y ASIGNACIONES
-- --------------------------------------------------------

CREATE TABLE `datos_laborales` (
  `empleado_id` INT(11) NOT NULL,
  `cargo_cet_id` INT(11) NOT NULL,
  `cargo_onapre_id` INT(11) NOT NULL,
  `nivel_salarial_id` INT(11) NOT NULL,
  `nivel_salarial_antiguo_id` INT(11),
  `condicion_laboral_id` INT(11) NOT NULL,
  `prima_profesional_id` INT(11),
  `direccion_id` INT(11),
  `division_id` INT(11),
  `unidad_id` INT(11),
  PRIMARY KEY (`empleado_id`),
  CONSTRAINT `fk_lab_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lab_cet` FOREIGN KEY (`cargo_cet_id`) REFERENCES `cargos_cet` (`id`),
  CONSTRAINT `fk_lab_onapre` FOREIGN KEY (`cargo_onapre_id`) REFERENCES `cargos_onapre` (`id`),
  CONSTRAINT `fk_lab_nivel` FOREIGN KEY (`nivel_salarial_id`) REFERENCES `niveles_salariales` (`id`),
  CONSTRAINT `fk_lab_condicion` FOREIGN KEY (`condicion_laboral_id`) REFERENCES `condiciones_laborales` (`id`),
  CONSTRAINT `fk_lab_dir` FOREIGN KEY (`direccion_id`) REFERENCES `direcciones` (`id`),
  CONSTRAINT `fk_lab_div` FOREIGN KEY (`division_id`) REFERENCES `divisiones` (`id`),
  CONSTRAINT `fk_lab_uni` FOREIGN KEY (`unidad_id`) REFERENCES `unidades` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 6. HISTORIALES Y REGISTROS DINÁMICOS
-- --------------------------------------------------------

CREATE TABLE `hijos_empleados` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empleado_id` INT(11) NOT NULL,
  `nombres` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(100) NOT NULL,
  `fecha_nacimiento` DATE NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hijo_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `historial_salarios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empleado_id` INT(11) NOT NULL,
  `fecha_pago` DATE NOT NULL,
  `monto_neto` DECIMAL(10,2) NOT NULL,
  `monto_bruto` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hist_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `permisos_remunerados` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empleado_id` INT(11) NOT NULL,
  `motivo` VARCHAR(255) NOT NULL,
  `requiere_justificativo` BOOLEAN NOT NULL DEFAULT 0,
  `fecha_solicitud` DATE NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE,
  `esta_aprobado` BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_permiso_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 7. USUARIOS Y ACCESOS AL SISTEMA
-- --------------------------------------------------------

CREATE TABLE `roles_sistema` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `modulos_acceso` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_modulo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `nombres` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `rol_id` int NOT NULL,
  `modulo_id` int NOT NULL,
  `cedula_referencia` varchar(15) DEFAULT NULL COMMENT 'Cédula del empleado si aplica',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles_sistema` (`id`),
  CONSTRAINT `fk_usuario_modulo` FOREIGN KEY (`modulo_id`) REFERENCES `modulos_acceso` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- VOLCADO DE DATOS INICIALES (SEMILLAS)
-- --------------------------------------------------------

INSERT INTO `roles_sistema` (`nombre_rol`) VALUES
('Visualizador'), ('Temporal'), ('Trabajador'), ('Jefe de Área'), ('Administrador');

INSERT INTO `modulos_acceso` (`nombre_modulo`) VALUES
('Acceso Global'), ('Módulo de Recursos Humanos'), ('Módulo de Bienes');