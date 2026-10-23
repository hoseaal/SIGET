-- Ficha tecnica ampliada para computadores de dbsiget.
-- La informacion general del bien sigue viviendo en dbsiget.tmab_m.
-- Estas tablas solo almacenan los datos tecnicos que Bienes Muebles no maneja.

USE soporte_tecnico;

-- ---------------------------------------------------------------------------
-- 1. Datos generales de la ficha tecnica del computador
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bien_detalle_computo (
  bim_ide VARCHAR(10) NOT NULL,
  nombre_equipo VARCHAR(100) DEFAULT NULL,
  sistema_operativo VARCHAR(100) DEFAULT NULL,
  version_office VARCHAR(100) DEFAULT NULL,
  marca VARCHAR(100) DEFAULT NULL,
  modelo VARCHAR(150) DEFAULT NULL,
  serial VARCHAR(100) DEFAULT NULL,
  ip VARCHAR(45) DEFAULT NULL,
  mac_address VARCHAR(17) DEFAULT NULL,
  anydesk VARCHAR(50) DEFAULT NULL,
  elaborado_por VARCHAR(100) DEFAULT NULL,
  observaciones TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (bim_ide)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
-- 2. Componentes internos del computador
--    Permite varias filas del mismo tipo (por ejemplo, dos memorias RAM).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bien_componente (
  id INT NOT NULL AUTO_INCREMENT,
  bim_ide VARCHAR(10) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  marca VARCHAR(100) DEFAULT NULL,
  modelo VARCHAR(150) DEFAULT NULL,
  serial VARCHAR(100) DEFAULT NULL,
  capacidad VARCHAR(100) DEFAULT NULL,
  nro_bien VARCHAR(50) DEFAULT NULL,
  observaciones VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_componente_bim_ide (bim_ide),
  CONSTRAINT fk_componente_detalle
    FOREIGN KEY (bim_ide) REFERENCES bien_detalle_computo (bim_ide)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
