-- ============================================================================
-- TRIGGERS DE VALIDACIÓN DE SALARIOS - SIGET RRHH
-- Fecha: 2026-05-20
-- Descripción:
--   1. Reemplaza los triggers BEFORE INSERT/UPDATE en datos_laborales
--      para asignar nivel BI I por defecto si no viene asignado,
--      y rechazar salarios inferiores al mínimo configurado en la escala.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. DATOS_LABORALES: BEFORE INSERT
--    - Si nivel_salarial_id es NULL → asignar nivel 'I' de Bachiller I (onapre 40)
--    - Validar que el salario del nivel asignado sea >= salario mínimo de la escala
--    - Mantiene la lógica existente de sincronizar nivel_salarial_antiguo_id
-- ────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS `before_insert_datos_laborales_nivel`;

DELIMITER $$
CREATE TRIGGER `before_insert_datos_laborales_nivel` BEFORE INSERT ON `datos_laborales`
FOR EACH ROW
BEGIN
    DECLARE v_salario DECIMAL(10,2);
    DECLARE v_default_nivel INT;
    DECLARE v_salario_minimo DECIMAL(10,2);

    -- Si no viene nivel salarial, asignar BI I (Bachiller I, nivel I)
    IF NEW.nivel_salarial_id IS NULL THEN
        SELECT nivel_salarial_id INTO v_default_nivel
        FROM niveles_salariales
        WHERE nombre = 'I' AND cargo_onapre_id = 40
        LIMIT 1;

        IF v_default_nivel IS NOT NULL THEN
            SET NEW.nivel_salarial_id = v_default_nivel;
        END IF;
    END IF;

    -- Validar que el salario del nivel asignado sea >= salario mínimo de la escala
    IF NEW.nivel_salarial_id IS NOT NULL THEN
        SELECT salario_base INTO v_salario
        FROM niveles_salariales
        WHERE nivel_salarial_id = NEW.nivel_salarial_id
        LIMIT 1;

        SELECT MIN(salario_base) INTO v_salario_minimo
        FROM niveles_salariales;

        IF v_salario IS NOT NULL AND v_salario_minimo IS NOT NULL AND v_salario < v_salario_minimo THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[ALERTA SALARIO] El salario del nivel asignado es inferior al mínimo de la escala. Registro rechazado.';
        END IF;

        -- Sincronizar nivel_salarial_antiguo_id (lógica existente)
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

-- ────────────────────────────────────────────────────────────────────────────
-- 2. DATOS_LABORALES: BEFORE UPDATE
--    - Misma lógica que INSERT pero solo cuando cambia el nivel_salarial_id
-- ────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS `before_update_datos_laborales_nivel`;

DELIMITER $$
CREATE TRIGGER `before_update_datos_laborales_nivel` BEFORE UPDATE ON `datos_laborales`
FOR EACH ROW
BEGIN
    DECLARE v_salario DECIMAL(10,2);
    DECLARE v_default_nivel INT;
    DECLARE v_salario_minimo DECIMAL(10,2);

    -- Si el nuevo nivel es NULL, asignar BI I por defecto
    IF NEW.nivel_salarial_id IS NULL THEN
        SELECT nivel_salarial_id INTO v_default_nivel
        FROM niveles_salariales
        WHERE nombre = 'I' AND cargo_onapre_id = 40
        LIMIT 1;

        IF v_default_nivel IS NOT NULL THEN
            SET NEW.nivel_salarial_id = v_default_nivel;
        END IF;
    END IF;

    -- Solo validar/sincronizar si cambió el nivel
    IF NEW.nivel_salarial_id IS NOT NULL
       AND (OLD.nivel_salarial_id IS NULL OR NEW.nivel_salarial_id <> OLD.nivel_salarial_id) THEN

        -- Validar salario mínimo
        SELECT salario_base INTO v_salario
        FROM niveles_salariales
        WHERE nivel_salarial_id = NEW.nivel_salarial_id
        LIMIT 1;

        SELECT MIN(salario_base) INTO v_salario_minimo
        FROM niveles_salariales;

        IF v_salario IS NOT NULL AND v_salario_minimo IS NOT NULL AND v_salario < v_salario_minimo THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[ALERTA SALARIO] El salario del nivel asignado es inferior al mínimo de la escala. Registro rechazado.';
        END IF;

        -- Sincronizar nivel_salarial_antiguo_id (lógica existente)
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

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Eliminar triggers antiguos innecesarios de salario mínimo estático
-- ────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS `before_insert_nivel_salario_minimo`;
DROP TRIGGER IF EXISTS `before_update_nivel_salario_minimo`;

