-- =====================================================================
-- Disparadores para datos_laborales:
-- Al insertar o actualizar el nivel_salarial_id, automáticamente
-- se busca y asigna el nivel_salarial_antiguo_id correspondiente
-- basándose en el nombre y cargo_onapre_id de niveles_salariales_antiguos.
-- =====================================================================

-- Eliminar disparadores existentes si los hay
DROP TRIGGER IF EXISTS `before_insert_datos_laborales_nivel`;
DROP TRIGGER IF EXISTS `before_update_datos_laborales_nivel`;

-- -------------------------------------------------------
-- TRIGGER: BEFORE INSERT en datos_laborales
-- Cuando se inserta un registro con nivel_salarial_id,
-- automáticamente se asigna el nivel_salarial_antiguo_id
-- -------------------------------------------------------
DELIMITER $$
CREATE TRIGGER `before_insert_datos_laborales_nivel` BEFORE INSERT ON `datos_laborales` FOR EACH ROW
BEGIN
    IF NEW.nivel_salarial_id IS NOT NULL THEN
        SET NEW.nivel_salarial_antiguo_id = (
            SELECT nsa.nivel_salarial_antiguo_id
            FROM niveles_salariales_antiguos nsa
            INNER JOIN niveles_salariales ns 
                ON ns.nombre = nsa.nombre 
                AND ns.cargo_onapre_id = nsa.cargo_onapre_id
            WHERE ns.nivel_salarial_id = NEW.nivel_salarial_id
            LIMIT 1
        );
    END IF;
END$$
DELIMITER ;

-- -------------------------------------------------------
-- TRIGGER: BEFORE UPDATE en datos_laborales
-- Cuando se modifica el nivel_salarial_id,
-- automáticamente se actualiza el nivel_salarial_antiguo_id.
-- Si se pone nivel_salarial_id a NULL, también se limpia el antiguo.
-- -------------------------------------------------------
DELIMITER $$
CREATE TRIGGER `before_update_datos_laborales_nivel` BEFORE UPDATE ON `datos_laborales` FOR EACH ROW
BEGIN
    IF NEW.nivel_salarial_id IS NOT NULL 
       AND (OLD.nivel_salarial_id IS NULL OR NEW.nivel_salarial_id <> OLD.nivel_salarial_id) THEN
        SET NEW.nivel_salarial_antiguo_id = (
            SELECT nsa.nivel_salarial_antiguo_id
            FROM niveles_salariales_antiguos nsa
            INNER JOIN niveles_salariales ns 
                ON ns.nombre = nsa.nombre 
                AND ns.cargo_onapre_id = nsa.cargo_onapre_id
            WHERE ns.nivel_salarial_id = NEW.nivel_salarial_id
            LIMIT 1
        );
    ELSEIF NEW.nivel_salarial_id IS NULL THEN
        SET NEW.nivel_salarial_antiguo_id = NULL;
    END IF;
END$$
DELIMITER ;
