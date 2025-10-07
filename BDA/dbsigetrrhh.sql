-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-04-2025 a las 17:12:35
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30
DROP DATABASE IF EXISTS `dbsigetrrhh`;
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

