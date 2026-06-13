-- =============================================================================
-- BITÁCORA SALARIAL - Disparadores de captura automática
-- =============================================================================
-- Versión: 1.0
-- Descripción:
--   Disparadores sobre datos_laborales que registran automáticamente en
--   historial_salarios todo cambio de salario (asociado o no a cambio de
--   cargo), funcionando como bitácora inmutable.
--
-- ADAPTACIÓN RESPECTO AL ESPECIFICACIÓN ORIGINAL:
--   La especificación indicaba disparadores sobre empleados, pero en el
--   esquema real de SIGET el salario (nivel_salarial_id → salario_base) y
--   el cargo (cargo_cet_id / cargo_onapre_id) residen en datos_laborales.
--   Por tanto, los triggers se implementan sobre datos_laborales, que es
--   la tabla donde efectivamente ocurren los cambios salariales y de cargo.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. TABLA DESTINO: historial_salarios (bitácora salarial)
-- ---------------------------------------------------------------------------
-- Crea la tabla si no existe (estructura especificada por el usuario).
-- La tabla ya posee integridad referencial hacia empleados.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `historial_salarios` (
  `id_historial` int(11) NOT NULL AUTO_INCREMENT,
  `empleado_id` int(11) DEFAULT NULL,
  `fecha` date NOT NULL,
  `monto_neto` decimal(10,2) DEFAULT NULL,
  `observaciones` text NOT NULL,
  PRIMARY KEY (`id_historial`),
  KEY `empleado_id` (`empleado_id`),
  CONSTRAINT `historial_salarios_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
-- 2. DISPARADORES SOBRE datos_laborales
-- ---------------------------------------------------------------------------

-- 2.1 AFTER INSERT: Captura del salario inicial
-- ---------------------------------------------------------------------------
-- Momento de activación: Cuando se asigna por primera vez un nivel salarial
-- y un cargo a un empleado (INSERCION en datos_laborales).
-- 
-- Acción: Inserta automáticamente la primera fila en historial_salarios
-- con el salario_base del nivel salarial asignado.
-- ---------------------------------------------------------------------------
DELIMITER $$
DROP TRIGGER IF EXISTS `after_insert_datos_laborales_bitacora`$$
CREATE TRIGGER `after_insert_datos_laborales_bitacora`
AFTER INSERT ON `datos_laborales`
FOR EACH ROW BEGIN
  DECLARE v_salario DECIMAL(10,2);
  DECLARE v_cargo_nombre VARCHAR(150);

  -- Obtener el salario base desde niveles_salariales
  SELECT COALESCE(ns.salario_base, 0)
    INTO v_salario
    FROM niveles_salariales ns
   WHERE ns.nivel_salarial_id = NEW.nivel_salarial_id;

  -- Obtener el nombre del cargo CET
  SELECT COALESCE(cet.nombre, 'No especificado')
    INTO v_cargo_nombre
    FROM cargos_cet cet
   WHERE cet.cargo_cet_id = NEW.cargo_cet_id;

  -- Insertar registro en la bitácora salarial
  INSERT INTO historial_salarios (empleado_id, fecha, monto_neto, observaciones)
  VALUES (
    NEW.empleado_id,
    CURDATE(),
    v_salario,
    CONCAT('Salario inicial asignado por ingreso a la institución. Cargo: ', v_cargo_nombre, '.')
  );
END$$

-- 2.2 AFTER UPDATE: Captura por modificación salarial y cambio de cargo
-- ---------------------------------------------------------------------------
-- Momento de activación: Cuando se actualiza datos_laborales de un empleado.
--
-- Condición crítica de activación:
--   Solo escribe en la bitácora si el nivel salarial (y por tanto el salario)
--   cambió (OLD.nivel_salarial_id <> NEW.nivel_salarial_id).
--   Si se actualizan otros campos (direccion_id, division_id, etc.) el
--   disparador ignora la acción para no saturar la BD.
--
-- Evaluación del motivo (observaciones dinámicas):
--   Escenario A (Cambio de Cargo):
--     Si además cambió cargo_cet_id, se registra:
--     'Ajuste salarial por Cambio de Cargo. [Cargo anterior] → [Cargo nuevo]'
--   Escenario B (Ajuste Regular):
--     Si el salario cambió pero el cargo sigue siendo el mismo:
--     'Ajuste salarial regular (Sin cambio de cargo).'
--
-- Garantía histórica:
--   Cada modificación genera una NUEVA fila (INSERT). Nunca se sobreescriben
--   ni borran registros pasados (no hay UPDATE ni DELETE en historial_salarios).
-- ---------------------------------------------------------------------------
CREATE TRIGGER `after_update_datos_laborales_bitacora`
AFTER UPDATE ON `datos_laborales`
FOR EACH ROW BEGIN
  DECLARE v_salario_nuevo DECIMAL(10,2);
  DECLARE v_cargo_anterior VARCHAR(150);
  DECLARE v_cargo_nuevo VARCHAR(150);
  DECLARE v_observacion TEXT;

  -- ──────────────────────────────────────────────────────────────────────────
  -- Evaluación de activación:
  -- Solo proceder si el nivel salarial (salario) cambió realmente.
  -- COALESCE maneja posibles valores NULL en los IDs.
  -- ──────────────────────────────────────────────────────────────────────────
  IF COALESCE(OLD.nivel_salarial_id, 0) <> COALESCE(NEW.nivel_salarial_id, 0) THEN

    -- Obtener el nuevo salario base
    SELECT COALESCE(ns.salario_base, 0)
      INTO v_salario_nuevo
      FROM niveles_salariales ns
     WHERE ns.nivel_salarial_id = NEW.nivel_salarial_id;

    -- ────────────────────────────────────────────────────────────────────────
    -- Evaluación del motivo:
    -- ¿Cambió también el cargo?
    -- ────────────────────────────────────────────────────────────────────────
    IF COALESCE(OLD.cargo_cet_id, 0) <> COALESCE(NEW.cargo_cet_id, 0) THEN
      -- Escenario A: Cambio de cargo
      SELECT COALESCE(cet.nombre, 'No especificado')
        INTO v_cargo_anterior
        FROM cargos_cet cet
       WHERE cet.cargo_cet_id = OLD.cargo_cet_id;

      SELECT COALESCE(cet.nombre, 'No especificado')
        INTO v_cargo_nuevo
        FROM cargos_cet cet
       WHERE cet.cargo_cet_id = NEW.cargo_cet_id;

      SET v_observacion = CONCAT(
        'Ajuste salarial por Cambio de Cargo. ',
        'Cargo anterior: ', v_cargo_anterior,
        '. Cargo nuevo: ', v_cargo_nuevo, '.'
      );
    ELSE
      -- Escenario B: Ajuste regular sin cambio de cargo
      SET v_observacion = 'Ajuste salarial regular (Sin cambio de cargo).';
    END IF;

    -- Insertar registro en la bitácora (una nueva fila, inmutable)
    INSERT INTO historial_salarios (empleado_id, fecha, monto_neto, observaciones)
    VALUES (
      NEW.empleado_id,
      CURDATE(),
      v_salario_nuevo,
      v_observacion
    );
  END IF;
END$$
DELIMITER ;
