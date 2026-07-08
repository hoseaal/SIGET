-- ============================================================
-- TRIGGERS: Sincronización automática entre tablas de niveles salariales
-- Ejecutar este script en la base de datos MySQL/MariaDB
-- ============================================================

-- Eliminar triggers existentes si ya existen
DROP TRIGGER IF EXISTS after_insert_nivel;
DROP TRIGGER IF EXISTS after_update_nivel;
DROP TRIGGER IF EXISTS after_insert_nivel_antiguo;
DROP TRIGGER IF EXISTS after_update_nivel_antiguo;

DELIMITER $$

-- ============================================================
-- TRIGGER 1: Después de INSERT en niveles_salariales
-- ============================================================
CREATE TRIGGER after_insert_nivel
AFTER INSERT ON niveles_salariales
FOR EACH ROW
BEGIN
  IF @disable_sync_triggers IS NULL OR @disable_sync_triggers = 0 THEN
      SET @disable_sync_triggers = 1;
      
      IF NOT EXISTS (
          SELECT 1 FROM niveles_salariales_antiguos 
          WHERE nombre = NEW.nombre AND cargo_onapre_id = NEW.cargo_onapre_id
      ) THEN
          INSERT INTO niveles_salariales_antiguos (nombre, salario_antiguo, cargo_onapre_id)
          VALUES (NEW.nombre, 0.00, NEW.cargo_onapre_id);
      END IF;
      
      SET @disable_sync_triggers = 0;
  END IF;
END$$

-- ============================================================
-- TRIGGER 2: Después de INSERT en niveles_salariales_antiguos
-- ============================================================
CREATE TRIGGER after_insert_nivel_antiguo
AFTER INSERT ON niveles_salariales_antiguos
FOR EACH ROW
BEGIN
  IF @disable_sync_triggers IS NULL OR @disable_sync_triggers = 0 THEN
      SET @disable_sync_triggers = 1;
      
      IF NOT EXISTS (
          SELECT 1 FROM niveles_salariales 
          WHERE nombre = NEW.nombre AND cargo_onapre_id = NEW.cargo_onapre_id
      ) THEN
          INSERT INTO niveles_salariales (nombre, salario_base, cargo_onapre_id)
          VALUES (NEW.nombre, 0.00, NEW.cargo_onapre_id);
      END IF;
      
      SET @disable_sync_triggers = 0;
  END IF;
END$$

-- ============================================================
-- TRIGGER 3: Después de UPDATE en niveles_salariales
-- ============================================================
CREATE TRIGGER after_update_nivel
AFTER UPDATE ON niveles_salariales
FOR EACH ROW
BEGIN
  IF (OLD.nombre != NEW.nombre OR OLD.cargo_onapre_id != NEW.cargo_onapre_id) THEN
      IF @disable_sync_triggers IS NULL OR @disable_sync_triggers = 0 THEN
          SET @disable_sync_triggers = 1;
          
          UPDATE niveles_salariales_antiguos
          SET nombre = NEW.nombre,
              cargo_onapre_id = NEW.cargo_onapre_id
          WHERE nombre = OLD.nombre AND cargo_onapre_id = OLD.cargo_onapre_id;
          
          SET @disable_sync_triggers = 0;
      END IF;
  END IF;
END$$

-- ============================================================
-- TRIGGER 4: Después de UPDATE en niveles_salariales_antiguos
-- ============================================================
CREATE TRIGGER after_update_nivel_antiguo
AFTER UPDATE ON niveles_salariales_antiguos
FOR EACH ROW
BEGIN
  IF (OLD.nombre != NEW.nombre OR OLD.cargo_onapre_id != NEW.cargo_onapre_id) THEN
      IF @disable_sync_triggers IS NULL OR @disable_sync_triggers = 0 THEN
          SET @disable_sync_triggers = 1;
          
          UPDATE niveles_salariales
          SET nombre = NEW.nombre,
              cargo_onapre_id = NEW.cargo_onapre_id
          WHERE nombre = OLD.nombre AND cargo_onapre_id = OLD.cargo_onapre_id;
          
          SET @disable_sync_triggers = 0;
      END IF;
  END IF;
END$$

DELIMITER ;


