-- Migracion del modulo Soporte Tecnico para consumir Bienes Muebles.
-- Ejecutar una sola vez sobre la base de datos soporte_tecnico.
-- Los datos de la tabla equipos se eliminan de forma directa (decision del usuario).

USE soporte_tecnico;

-- ---------------------------------------------------------------------------
-- 1. Mapeo entre departamentos de Soporte y departamentos de Bienes Muebles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departamento_bienes_map (
  departamento_id INT NOT NULL,
  dep_ide INT NULL,
  observacion VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (departamento_id),
  CONSTRAINT fk_map_departamento
    FOREIGN KEY (departamento_id) REFERENCES departamentos (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO departamento_bienes_map (departamento_id, dep_ide, observacion) VALUES
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
  (14, NULL, 'Sin equivalente en tesdep: Division de Servicio Tecnico')
ON DUPLICATE KEY UPDATE
  dep_ide = VALUES(dep_ide),
  observacion = VALUES(observacion);

-- ---------------------------------------------------------------------------
-- 2. Reemplazo de equipo_id por bim_ide en actividades
-- ---------------------------------------------------------------------------
ALTER TABLE actividades
  ADD COLUMN bim_ide VARCHAR(10) NULL AFTER tipo_actividad_id;

-- Migra las coincidencias historicas por numero de bien. Si tmab_m esta vacia,
-- no se migra ninguna fila y las actividades quedan con bim_ide NULL.
UPDATE actividades a
JOIN equipos e ON a.equipo_id = e.id
JOIN dbsiget.tmab_m b ON b.bim_ide = e.nro_bien
SET a.bim_ide = b.bim_ide;

ALTER TABLE actividades DROP FOREIGN KEY fk_act_equipo;
ALTER TABLE actividades DROP COLUMN equipo_id;
ALTER TABLE actividades ADD INDEX idx_act_bim_ide (bim_ide);

-- ---------------------------------------------------------------------------
-- 3. Eliminacion de la tabla equipos
-- ---------------------------------------------------------------------------
DROP TABLE equipos;
