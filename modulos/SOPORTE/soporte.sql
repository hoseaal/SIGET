CREATE DATABASE IF NOT EXISTS control_informatica;
USE control_informatica;

CREATE TABLE equipos_computo (
    -- Datos del Bien Mueble
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    nro_bien VARCHAR(50) UNIQUE NOT NULL,
    nombre_equipo VARCHAR(100),
    direccion_oficina VARCHAR(255),
    tipo_equipo VARCHAR(50),
    puerto_switch INT,

    -- Hardware: Tarjeta Madre
    mobo_marca VARCHAR(50),
    mobo_modelo VARCHAR(100),
    mobo_serial VARCHAR(100),

    -- Hardware: Disco Duro
    disco_marca VARCHAR(50),
    disco_serial VARCHAR(100),
    disco_capacidad_gb INT,

    -- Hardware: Memorias RAM
    ram_marca VARCHAR(50),
    ram_tipo VARCHAR(20), -- Ejemplo: DDR4
    ram_capacidad_gb INT,
    ram_serial VARCHAR(100),

    -- Hardware: Fuente de Poder
    fuente_marca VARCHAR(50),
    fuente_vatios INT,
    fuente_serial VARCHAR(100),
    fuente_bien_mueble VARCHAR(50),

    -- Hardware: Unidad CD/DVD
    unidad_optica_marca VARCHAR(50),
    unidad_optica_serial VARCHAR(100),

    -- Software
    sistema_operativo VARCHAR(100),
    version_office VARCHAR(100),

    -- Administrativo
    elaborado_por VARCHAR(100),
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);