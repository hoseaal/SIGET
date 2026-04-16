-- ============================================================
-- TRIGGERS: Sincronización automática niveles_salariales → niveles_salariales_antiguos
-- Ejecutar este script en la base de datos MySQL/MariaDB
-- ============================================================

-- Eliminar triggers existentes si ya existen
DROP TRIGGER IF EXISTS after_insert_nivel;
DROP TRIGGER IF EXISTS after_update_nivel;

-- ============================================================
-- TRIGGER 1: Después de INSERT en niveles_salariales
-- Inserta automáticamente un registro espejo en niveles_salariales_antiguos
-- ============================================================
DELIMITER $$

CREATE TRIGGER after_insert_nivel
AFTER INSERT ON niveles_salariales
FOR EACH ROW
BEGIN
  INSERT INTO niveles_salariales_antiguos (
    nombre,
    salario_antiguo,
    cargo_onapre_id
  )
  VALUES (
    NEW.nombre,
    NEW.salario_base,
    NEW.cargo_onapre_id
  );
END$$

DELIMITER ;

-- ============================================================
-- TRIGGER 2: Después de UPDATE en niveles_salariales
-- Actualiza automáticamente el registro espejo en niveles_salariales_antiguos
-- ============================================================
DELIMITER $$

CREATE TRIGGER after_update_nivel
AFTER UPDATE ON niveles_salariales
FOR EACH ROW
BEGIN
  UPDATE niveles_salariales_antiguos
  SET 
    salario_antiguo = NEW.salario_base,
    cargo_onapre_id = NEW.cargo_onapre_id
  WHERE nombre = NEW.nombre;
END$$

DELIMITER ;
