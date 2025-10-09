-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-04-2025 a las 17:12:35
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

CREATE DATABASE IF NOT EXISTS `dbsigetrrhh`;
USE `dbsigetrrhh`;

--
-- Base de datos: `dbsigetrrhh`
--
--
-- 1. Tabla Maestra (tma): Direcciones de la institución
--
CREATE TABLE `tmadir` (
  `dir_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la Dirección',
  `dir_nom` VARCHAR(150) NOT NULL COMMENT 'Nombre completo de la Dirección',
  PRIMARY KEY (`dir_ide`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Maestra de Direcciones';

--
-- 2. Tabla Esclava (tes): Divisiones (Relación 1:N con tmadir)
--
CREATE TABLE `tesdiv` (
  `div_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la División',
  `div_nom` VARCHAR(150) NOT NULL COMMENT 'Nombre completo de la División',
  `dir_ide` INT(11) NOT NULL COMMENT 'Referencia a la Dirección a la que pertenece (tmadir)',
  PRIMARY KEY (`div_ide`),
  KEY `fk_div_dir` (`dir_ide`),
  CONSTRAINT `fk_div_dir` FOREIGN KEY (`dir_ide`) REFERENCES `tmadir` (`dir_ide`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Esclava de Divisiones';

--
-- 3. Tabla Esclava (tes): Unidades (Relación 1:N con tesdiv)
--
CREATE TABLE `tesuni` (
  `uni_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la Unidad',
  `uni_nom` VARCHAR(150) NOT NULL COMMENT 'Nombre completo de la Unidad',
  `div_ide` INT(11) NOT NULL COMMENT 'Referencia a la División a la que pertenece (tesdiv)',
  PRIMARY KEY (`uni_ide`),
  KEY `fk_uni_div` (`div_ide`),
  CONSTRAINT `fk_uni_div` FOREIGN KEY (`div_ide`) REFERENCES `tesdiv` (`div_ide`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Esclava de Unidades';

--
-- Tabla Maestra (tma): Profesiones
--
CREATE TABLE `tmapro` (
  `pro_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la Profesión',
  `pro_nom` VARCHAR(100) NOT NULL COMMENT 'Nombre de la Profesión o Título',
  PRIMARY KEY (`pro_ide`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Maestra de Profesiones';

--
-- Tabla Maestra (tma): Estatus del Funcionario
--
CREATE TABLE `tmaest` (
  `est_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del Estatus del funcionario',
  `est_nom` VARCHAR(50) NOT NULL COMMENT 'Nombre o descripción corta del Estatus',
  PRIMARY KEY (`est_ide`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Maestra de Estatus de Funcionarios';

--
-- Tabla Maestra (tma): Funcionarios (Datos Personales y Claves Foráneas)
--
CREATE TABLE `tmafun` (
  -- 1. Identificación Principal
  `fun_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del Funcionario (Clave Primaria)',
  `fun_ced` VARCHAR(15) NOT NULL UNIQUE COMMENT 'Número de Cédula de Identidad',
  `fun_nom` VARCHAR(100) NOT NULL COMMENT 'Nombres del Funcionario',
  `fun_ape` VARCHAR(100) NOT NULL COMMENT 'Apellidos del Funcionario',
  `fun_rif` VARCHAR(20) UNIQUE COMMENT 'Registro de Información Fiscal (RIF) del Funcionario (puede ser NULL)',

  -- 2. Datos Personales
  `fun_fna` DATE NOT NULL COMMENT 'Fecha de nacimiento del Funcionario',
  `fun_lna` VARCHAR(100) NOT NULL COMMENT 'Lugar o ciudad de nacimiento (texto libre)',
  `fun_gen` ENUM('M','F','O') NOT NULL COMMENT 'Género del Funcionario (M: Masculino, F: Femenino, O: Otro)',
  `fun_est` VARCHAR(50) NOT NULL COMMENT 'Estado Civil (Ej: Soltero, Casado, etc.)',
  `fun_san` VARCHAR(5) COMMENT 'Tipo de sangre (Ej: A+, O-, etc.)',
  
  -- 3. Hobbies y Actividades
  `fun_dep` TEXT COMMENT 'Deportes que practica el Funcionario (texto libre, puede ser NULL)',
  `fun_cul` TEXT COMMENT 'Actividades culturales o artísticas que realiza (texto libre, puede ser NULL)',
  
  -- 4. Contacto y Residencia
  `fun_dir` VARCHAR(255) NOT NULL COMMENT 'Dirección de habitación o residencia (texto libre)',
  `fun_tel` VARCHAR(20) COMMENT 'Número de teléfono residencial (puede ser NULL)',
  `fun_cel` VARCHAR(20) NOT NULL COMMENT 'Número de teléfono celular principal',
  `fun_ema1` VARCHAR(150) NOT NULL COMMENT 'Correo electrónico principal',
  `fun_ema2` VARCHAR(150) COMMENT 'Correo electrónico secundario (puede ser NULL)',
  
  -- 5. Datos Institucionales y Académicos
  `fun_fing` DATE NOT NULL COMMENT 'Fecha de ingreso a la institución',
  `fun_estu` VARCHAR(255) COMMENT 'Estudios que está cursando actualmente (puede ser NULL)',
  `fun_fcul` DATE COMMENT 'Fecha de culminación de los estudios en curso (puede ser NULL)',
  
  -- 6. Contactos de Emergencia
  `fun_emer1` VARCHAR(150) NOT NULL COMMENT 'Nombre y apellido del contacto de emergencia 1',
  `fun_emer2` VARCHAR(150) COMMENT 'Nombre y apellido del contacto de emergencia 2 (puede ser NULL)',
  `fun_teme1` VARCHAR(20) NOT NULL COMMENT 'Número de teléfono de emergencia 1',
  `fun_teme2` VARCHAR(20) COMMENT 'Número de teléfono de emergencia 2 (puede ser NULL)',
  
  -- 7. Claves Foráneas (Referencias a Tablas Maestras)
  `pro_ide` INT(11) COMMENT 'Clave foránea de la Profesión (tmapro)',
  `est_ide` INT(11) NOT NULL COMMENT 'Clave foránea del Estatus del Funcionario (tmaest)',
  
  -- Restricciones
  PRIMARY KEY (`fun_ide`),
  UNIQUE KEY `uk_fun_ced` (`fun_ced`),
  UNIQUE KEY `uk_fun_rif` (`fun_rif`),
  
  -- Definición de Claves Foráneas
  CONSTRAINT `fk_fun_pro` FOREIGN KEY (`pro_ide`) REFERENCES `tmapro` (`pro_ide`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_fun_est` FOREIGN KEY (`est_ide`) REFERENCES `tmaest` (`est_ide`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Maestra de Datos Personales del Funcionario';

--
-- Tabla Maestra (tma): Condición Laboral
--
CREATE TABLE `tmacol` (
  `col_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la Condición Laboral',
  `col_nom` VARCHAR(100) NOT NULL COMMENT 'Nombre de la Condición Laboral (Ej: Fijo, Contratado, etc.)',
  PRIMARY KEY (`col_ide`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Maestra de Condición Laboral';

--
-- Tabla Maestra (tma): Cargo CET (Clasificación Estándar)
--
CREATE TABLE `tmacet` (
  `cet_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del Cargo CET',
  `cet_nom` VARCHAR(150) NOT NULL COMMENT 'Nombre del Cargo según la clasificación CET',
  PRIMARY KEY (`cet_ide`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Maestra de Cargos CET';

--
-- Tabla Maestra (tma): Deducciones
--
CREATE TABLE `tmade` (
  `ded_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la Deducción',
  `ded_nom` VARCHAR(100) NOT NULL COMMENT 'Nombre de la Deducción (Ej: Seguro Social Obligatorio)',
  `ded_por` DECIMAL(5,2) NOT NULL COMMENT 'Porcentaje de la Deducción (Ej: 13.50 para 13.5%)',
  PRIMARY KEY (`ded_ide`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Maestra de Deducciones';

--
-- Tabla Maestra (tma): Cargo ONAPRE
--
CREATE TABLE `tmaona` (
  `ona_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del Cargo ONAPRE',
  `ona_nom` VARCHAR(150) NOT NULL COMMENT 'Nombre del Cargo según la clasificación ONAPRE',
  PRIMARY KEY (`ona_ide`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Maestra de Cargos ONAPRE';

--
-- Tabla Maestra (tma): Primas Generales
--
CREATE TABLE `tmapri` (
  `pri_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la Prima',
  `pri_nom` VARCHAR(100) NOT NULL COMMENT 'Nombre de la Prima (Ej: Antigüedad, Hijos, etc.)',
  `pri_por` DECIMAL(5,2) NOT NULL COMMENT 'Porcentaje de la Prima (Ej: 25.00 para 25%)',
  PRIMARY KEY (`pri_ide`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Maestra de Primas Generales';

--
-- Tabla Maestra (tma): Prima de Profesionalización
--
CREATE TABLE `tmaprf` (
  `prf_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del histórico de Prima de Profesionalización',
  `prf_nom` VARCHAR(100) NOT NULL COMMENT 'Descripción de la prima (Ej: TSU, Licenciado, Postgrado)',
  `prf_act` DECIMAL(5,2) NOT NULL COMMENT 'Porcentaje actual de la Prima',
  `prf_ant` DECIMAL(5,2) COMMENT 'Porcentaje antiguo (anterior) de la Prima (puede ser NULL)',
  PRIMARY KEY (`prf_ide`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Maestra de Prima de Profesionalización (Histórico)';

--
-- Tabla Esclava (tes): Nivel Salarial Actual (Administrativo/Profesional)
--
CREATE TABLE `tesniv` (
  `niv_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del Nivel Salarial',
  `niv_nom` VARCHAR(50) NOT NULL COMMENT 'Nombre del Nivel Salarial (Ej: Nivel I, Nivel IV)',
  `niv_sal` DECIMAL(10,2) NOT NULL COMMENT 'Salario base mensual para este nivel',
  `ona_ide` INT(11) NOT NULL COMMENT 'Referencia al Cargo ONAPRE al que pertenece el nivel (tmaona)',
  PRIMARY KEY (`niv_ide`),
  KEY `fk_niv_ona` (`ona_ide`),
  CONSTRAINT `fk_niv_ona` FOREIGN KEY (`ona_ide`) REFERENCES `tmaona` (`ona_ide`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Esclava de Nivel Salarial Actual';

--
-- Tabla Esclava (tes): Nivel Salarial Antiguo (Histórico)
--
CREATE TABLE `tesnivant` (
  `nivant_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del Nivel Salarial Antiguo',
  `nivant_nom` VARCHAR(50) NOT NULL COMMENT 'Nombre del Nivel Salarial Antiguo',
  `nivant_sal` DECIMAL(10,2) NOT NULL COMMENT 'Salario base mensual antiguo para este nivel',
  `ona_ide` INT(11) NOT NULL COMMENT 'Referencia al Cargo ONAPRE al que pertenece el nivel (tmaona)',
  PRIMARY KEY (`nivant_ide`),
  KEY `fk_nivant_ona` (`ona_ide`),
  CONSTRAINT `fk_nivant_ona` FOREIGN KEY (`ona_ide`) REFERENCES `tmaona` (`ona_ide`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Esclava de Nivel Salarial Antiguo';

-- Tabla Esclava (tes): Datos Contractuales y Asignaciones
--
CREATE TABLE `tesfun` (
  -- Clave Primaria y Foránea a tmafun (Relación 1:1)
  `fun_ide` INT(11) NOT NULL COMMENT 'Clave foránea y Primaria del Funcionario (tmafun)',

  -- Claves Foráneas de Clasificación y Salario
  `cet_ide` INT(11) NOT NULL COMMENT 'Clave foránea del Cargo CET asignado (tmacet)',
  `ona_ide` INT(11) NOT NULL COMMENT 'Clave foránea del Cargo ONAPRE asignado (tmaona)',
  `niv_ide` INT(11) NOT NULL COMMENT 'Clave foránea del Nivel Salarial actual (tesniv o tesniob)',
  `nivant_ide` INT(11) COMMENT 'Clave foránea del Nivel Salarial Antiguo (tesnivant) (puede ser NULL)',
  `col_ide` INT(11) NOT NULL COMMENT 'Clave foránea de la Condición Laboral (tmacol)',
  `prf_ide` INT(11) COMMENT 'Clave foránea de la Prima de Profesionalización (tmaprf) (puede ser NULL)',

  -- Claves Foráneas de la Estructura Organizacional (Puede ser NULL si la asignación no es fija)
  `dir_ide` INT(11) COMMENT 'Clave foránea de la Dirección asignada (tmadir) (puede ser NULL)',
  `div_ide` INT(11) COMMENT 'Clave foránea de la División asignada (tesdiv) (puede ser NULL)',
  `uni_ide` INT(11) COMMENT 'Clave foránea de la Unidad asignada (tesuni) (puede ser NULL)',

  -- Restricciones
  PRIMARY KEY (`fun_ide`),
  
  -- Definición de Claves Foráneas
  CONSTRAINT `fk_tesfun_fun` FOREIGN KEY (`fun_ide`) REFERENCES `tmafun` (`fun_ide`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tesfun_cet` FOREIGN KEY (`cet_ide`) REFERENCES `tmacet` (`cet_ide`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tesfun_ona` FOREIGN KEY (`ona_ide`) REFERENCES `tmaona` (`ona_ide`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tesfun_niv` FOREIGN KEY (`niv_ide`) REFERENCES `tesniv` (`niv_ide`) ON DELETE RESTRICT ON UPDATE CASCADE, 
  CONSTRAINT `fk_tesfun_nivant` FOREIGN KEY (`nivant_ide`) REFERENCES `tesnivant` (`nivant_ide`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tesfun_col` FOREIGN KEY (`col_ide`) REFERENCES `tmacol` (`col_ide`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tesfun_prf` FOREIGN KEY (`prf_ide`) REFERENCES `tmaprf` (`prf_ide`) ON DELETE SET NULL ON UPDATE CASCADE,

  -- Foráneas de la estructura organizacional (con SET NULL si la unidad/división es eliminada, aunque RESTRICT es más seguro)
  CONSTRAINT `fk_tesfun_dir` FOREIGN KEY (`dir_ide`) REFERENCES `tmadir` (`dir_ide`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tesfun_div` FOREIGN KEY (`div_ide`) REFERENCES `tesdiv` (`div_ide`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tesfun_uni` FOREIGN KEY (`uni_ide`) REFERENCES `tesuni` (`uni_ide`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Esclava de Datos Contractuales y Asignaciones';

--
-- Tabla Maestra (tma): Porcentaje de Antigüedad
--
CREATE TABLE `tmaant` (
  `ant_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del porcentaje de Antigüedad',
  `ant_ani` INT(3) NOT NULL UNIQUE COMMENT 'Cantidad de años cumplidos para aplicar este porcentaje',
  `ant_act` DECIMAL(5,2) NOT NULL COMMENT 'Porcentaje actual de Antigüedad (Ej: 15.00 para 15%)',
  `ant_ant` DECIMAL(5,2) COMMENT 'Porcentaje antiguo (anterior) de Antigüedad (puede ser NULL)',
  PRIMARY KEY (`ant_ide`),
  UNIQUE KEY `uk_ant_ani` (`ant_ani`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Maestra de Porcentajes de Antigüedad';

--
-- Tabla Esclava (tes): Historial de Salarios
--
CREATE TABLE `teshisal` (
  `his_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del registro de Salario',
  `fun_ide` INT(11) NOT NULL COMMENT 'Clave foránea del Funcionario (tmafun)',
  `his_fpa` DATE NOT NULL COMMENT 'Fecha de pago del salario',
  `his_net` DECIMAL(10,2) NOT NULL COMMENT 'Salario neto depositado',
  `his_bru` DECIMAL(10,2) NOT NULL COMMENT 'Salario bruto devengado',
  PRIMARY KEY (`his_ide`),
  KEY `fk_hisal_fun` (`fun_ide`),
  CONSTRAINT `fk_hisal_fun` FOREIGN KEY (`fun_ide`) REFERENCES `tmafun` (`fun_ide`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Esclava de Historial de Salarios por Funcionario';

--
-- Tabla Esclava (tes): Hijos del Funcionario
--
CREATE TABLE `teshij` (
  `hij_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del Hijo',
  `fun_ide` INT(11) NOT NULL COMMENT 'Clave foránea del Funcionario (Padre/Madre) (tmafun)',
  `hij_nom` VARCHAR(100) NOT NULL COMMENT 'Nombre(s) del hijo',
  `hij_ape` VARCHAR(100) NOT NULL COMMENT 'Apellido(s) del hijo',
  `hij_fna` DATE NOT NULL COMMENT 'Fecha de nacimiento del hijo',
  PRIMARY KEY (`hij_ide`),
  KEY `fk_hij_fun` (`fun_ide`),
  CONSTRAINT `fk_hij_fun` FOREIGN KEY (`fun_ide`) REFERENCES `tmafun` (`fun_ide`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Esclava de Hijos del Funcionario';

--
-- Tabla Esclava (tes): Registro de Antigüedades
--
CREATE TABLE `tesant` (
  `ant_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del registro de Antigüedad',
  `fun_ide` INT(11) NOT NULL COMMENT 'Clave foránea del Funcionario (tmafun)',
  `ant_fin` DATE NOT NULL COMMENT 'Fecha de inicio del periodo de cálculo de Antigüedad',
  `ant_ffen` DATE COMMENT 'Fecha de fin del periodo de cálculo de Antigüedad (NULL si está vigente)',
  PRIMARY KEY (`ant_ide`),
  KEY `fk_ant_fun` (`fun_ide`),
  CONSTRAINT `fk_ant_fun` FOREIGN KEY (`fun_ide`) REFERENCES `tmafun` (`fun_ide`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Esclava de Registros de Antigüedades del Funcionario';

--
-- Tabla Esclava (tes): Registro de Encargos Temporales
--
CREATE TABLE `tesenc` (
  `enc_ide` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del Encargo',
  `fun_ide` INT(11) NOT NULL COMMENT 'Clave foránea del Funcionario encargado (tmafun)',
  
  `enc_ini` DATE NOT NULL COMMENT 'Fecha de inicio del encargo',
  `enc_fin` DATE COMMENT 'Fecha de fin del encargo (NULL si está vigente)',
  `enc_est` BOOLEAN NOT NULL COMMENT 'Estado del encargo (1: Vigente/Activo, 0: Finalizado/Inactivo)',
  
  -- Claves Foráneas de Clasificación y Salario del Encargo
  `cet_ide` INT(11) NOT NULL COMMENT 'Clave foránea del Cargo CET del Encargo (tmacet)',
  `ona_ide` INT(11) NOT NULL COMMENT 'Clave foránea del Cargo ONAPRE del Encargo (tmaona)',
  `niv_ide` INT(11) NOT NULL COMMENT 'Clave foránea del Nivel Salarial del Encargo (tesniv/tesniob)',
  `nivant_ide` INT(11) COMMENT 'Clave foránea del Nivel Salarial Antiguo del Encargo (tesnivant) (puede ser NULL)',

  -- Claves Foráneas de la Estructura Organizacional del Encargo
  `dir_ide` INT(11) NOT NULL COMMENT 'Clave foránea de la Dirección del Encargo (tmadir)',
  `div_ide` INT(11) NOT NULL COMMENT 'Clave foránea de la División del Encargo (tesdiv)',
  `uni_ide` INT(11) NOT NULL COMMENT 'Clave foránea de la Unidad del Encargo (tesuni)',

  PRIMARY KEY (`enc_ide`),
  KEY `fk_enc_fun` (`fun_ide`),
  CONSTRAINT `fk_enc_fun` FOREIGN KEY (`fun_ide`) REFERENCES `tmafun` (`fun_ide`) ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Restricciones de Cargos del Encargo
  CONSTRAINT `fk_enc_cet` FOREIGN KEY (`cet_ide`) REFERENCES `tmacet` (`cet_ide`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_enc_ona` FOREIGN KEY (`ona_ide`) REFERENCES `tmaona` (`ona_ide`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_enc_niv` FOREIGN KEY (`niv_ide`) REFERENCES `tesniv` (`niv_ide`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_enc_nivant` FOREIGN KEY (`nivant_ide`) REFERENCES `tesnivant` (`nivant_ide`) ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Restricciones de Ubicación del Encargo
  CONSTRAINT `fk_enc_dir` FOREIGN KEY (`dir_ide`) REFERENCES `tmadir` (`dir_ide`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_enc_div` FOREIGN KEY (`div_ide`) REFERENCES `tesdiv` (`div_ide`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_enc_uni` FOREIGN KEY (`uni_ide`) REFERENCES `tesuni` (`uni_ide`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla Esclava de Encargos Temporales de Funcionarios';

