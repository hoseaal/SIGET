DROP DATABASE IF EXISTS `dbsiget`;
CREATE DATABASE IF NOT EXISTS `dbsiget`;
USE `dbsiget`;

-- Tabla maestra de nómina (tmanom)
CREATE TABLE tmanom (
    nom_ced VARCHAR(10) PRIMARY KEY COMMENT "Cédula del empleado",
    nom_nom VARCHAR(50) NOT NULL COMMENT "Nombre del empleado",
    nom_ape VARCHAR(50) NOT NULL COMMENT "Apellido del empleado",
    nom_fec DATE NOT NULL COMMENT "Fecha de ingreso",
    nom_gen ENUM('M', 'F') NOT NULL COMMENT "Género del empleado",
    nom_nhi INT NOT NULL COMMENT "Número de hijos"
) ENGINE=InnoDB ON UPDATE CASCADE ON DELETE CASCADE;

-- Tabla esclava de antigüedad (tesant)
CREATE TABLE tesant (
    ant_ide INT PRIMARY KEY AUTO_INCREMENT COMMENT "Identificador único de antigüedad",
    ant_ano INT NOT NULL COMMENT "Años de antigüedad",
    ant_por DECIMAL(5,2) NOT NULL COMMENT "Porcentaje de antigüedad"
) ENGINE=InnoDB ON UPDATE CASCADE ON DELETE CASCADE;

-- Tabla esclava de departamento (tesdep)
CREATE TABLE tesdep (
    dep_ide INT PRIMARY KEY AUTO_INCREMENT COMMENT "Identificador único de departamento",
    dep_nom VARCHAR(50) NOT NULL COMMENT "Nombre del departamento",
    dep_des TEXT COMMENT "Descripción del departamento"
) ENGINE=InnoDB ON UPDATE CASCADE ON DELETE CASCADE;

-- Tabla esclava de cargo ONAPRE (tesona)
CREATE TABLE tesona (
    ona_ide INT PRIMARY KEY AUTO_INCREMENT COMMENT "Identificador único de cargo ONAPRE",
    ona_car VARCHAR(50) NOT NULL COMMENT "Nombre del cargo ONAPRE",
    ona_des TEXT COMMENT "Descripción del cargo ONAPRE"
) ENGINE=InnoDB ON UPDATE CASCADE ON DELETE CASCADE;

-- Tabla esclava de cargo CET (tescet)
CREATE TABLE tescet (
    cet_ide INT PRIMARY KEY AUTO_INCREMENT COMMENT "Identificador único de cargo CET",
    cet_car VARCHAR(50) NOT NULL COMMENT "Nombre del cargo CET",
    cet_des TEXT COMMENT "Descripción del cargo CET",
    cet_salario DECIMAL(10,2) NOT NULL COMMENT "Salario del cargo CET"
) ENGINE=InnoDB ON UPDATE CASCADE ON DELETE CASCADE;

-- Tabla esclava de primas en salario (tespri)
CREATE TABLE tespri (
    pri_ide INT PRIMARY KEY AUTO_INCREMENT COMMENT "Identificador único de prima",
    pri_raz VARCHAR(100) NOT NULL COMMENT "Razón de la prima",
    pri_por DECIMAL(5,2) NOT NULL COMMENT "Porcentaje de la prima"
) ENGINE=InnoDB ON UPDATE CASCADE ON DELETE CASCADE;

-- Tabla esclava de deducciones en salario (tesded)
CREATE TABLE tesded (
    ded_ide INT PRIMARY KEY AUTO_INCREMENT COMMENT "Identificador único de deducción",
    ded_raz VARCHAR(100) NOT NULL COMMENT "Razón de la deducción",
    ded_por DECIMAL(5,2) NOT NULL COMMENT "Porcentaje de la deducción"
) ENGINE=InnoDB ON UPDATE CASCADE ON DELETE CASCADE;