CREATE DATABASE IF NOT EXISTS control_informatica;
USE control_informatica;

-- Tabla Maestra de Direcciones (Corregida)
CREATE TABLE `tmadir` (
  `dir_ide` int(11) NOT NULL AUTO_INCREMENT,
  `dir_nom` varchar(150) NOT NULL,
  PRIMARY KEY (`dir_ide`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de Equipos (Campos opcionales con DEFAULT NULL)
CREATE TABLE equipos_computo (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    nro_bien VARCHAR(50) UNIQUE NOT NULL,
    nombre_equipo VARCHAR(100) DEFAULT NULL,
    dir_ide INT NOT NULL, -- Obligatorio
    tipo_equipo VARCHAR(50) DEFAULT NULL,
    puerto_switch INT DEFAULT NULL,

    -- Hardware
    mobo_marca VARCHAR(50) DEFAULT NULL,
    mobo_modelo VARCHAR(100) DEFAULT NULL,
    mobo_serial VARCHAR(100) DEFAULT NULL,
    disco_marca VARCHAR(50) DEFAULT NULL,
    disco_serial VARCHAR(100) DEFAULT NULL,
    disco_capacidad_gb INT DEFAULT NULL,
    ram_marca VARCHAR(50) DEFAULT NULL,
    ram_tipo VARCHAR(20) DEFAULT NULL,
    ram_capacidad_gb INT DEFAULT NULL,
    ram_serial VARCHAR(100) DEFAULT NULL,
    fuente_marca VARCHAR(50) DEFAULT NULL,
    fuente_vatios INT DEFAULT NULL,
    fuente_serial VARCHAR(100) DEFAULT NULL,
    fuente_bien_mueble VARCHAR(50) DEFAULT NULL,
    unidad_optica_marca VARCHAR(50) DEFAULT NULL,
    unidad_optica_serial VARCHAR(100) DEFAULT NULL,

    -- Software y Otros
    sistema_operativo VARCHAR(100) DEFAULT NULL,
    version_office VARCHAR(100) DEFAULT NULL,
    elaborado_por VARCHAR(100) DEFAULT NULL,
    observaciones TEXT DEFAULT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `fk_dir_ide` FOREIGN KEY (`dir_ide`) REFERENCES `tmadir` (`dir_ide`)
) ENGINE=InnoDB;

-- Datos iniciales
INSERT INTO `tmadir` (`dir_ide`, `dir_nom`) VALUES
(1, 'Despacho Contralor'), (2, 'Secretaría del Despacho'), (3, 'Auditoria Interna'),
(4, 'Dirección General'), (5, 'Consultoria Jurídica'), (6, 'Recursos Humanos'),
(7, 'Administración'), (8, 'Atención al Público'), (9, 'Transporte'),
(10, 'Administración Central'), (11, 'Administración Descentralizada'),
(12, 'Investigaciones'), (13, 'Determinación de Responsabilidades');