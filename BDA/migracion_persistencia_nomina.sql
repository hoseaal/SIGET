DELIMITER $$
CREATE TRIGGER `before_insert_historial_pagos`
BEFORE INSERT ON `historial_pagos`
FOR EACH ROW BEGIN
  DECLARE msg VARCHAR(255);
  IF NEW.quincena_no NOT IN (1, 2) THEN
    SET msg = CONCAT('Valor inválido para quincena_no: ', NEW.quincena_no, '. Debe ser 1 o 2.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.mes < 1 OR NEW.mes > 12 THEN
    SET msg = CONCAT('Valor inválido para mes: ', NEW.mes, '. Debe estar entre 1 y 12.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.anio < 2000 OR NEW.anio > 2100 THEN
    SET msg = CONCAT('Valor inválido para anio: ', NEW.anio, '. Debe estar entre 2000 y 2100.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.salario_neto < 0 THEN
    SET msg = CONCAT('El salario neto no puede ser negativo: ', NEW.salario_neto);
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
END$$

CREATE TRIGGER `before_insert_caja_ahorro`
BEFORE INSERT ON `caja_ahorro`
FOR EACH ROW BEGIN
  DECLARE msg VARCHAR(255);
  IF NEW.quincena_no NOT IN (1, 2) THEN
    SET msg = CONCAT('Valor inválido para quincena_no: ', NEW.quincena_no, '. Debe ser 1 o 2.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.mes < 1 OR NEW.mes > 12 THEN
    SET msg = CONCAT('Valor inválido para mes: ', NEW.mes, '. Debe estar entre 1 y 12.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.anio < 2000 OR NEW.anio > 2100 THEN
    SET msg = CONCAT('Valor inválido para anio: ', NEW.anio, '. Debe estar entre 2000 y 2100.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.monto < 0 THEN
    SET msg = CONCAT('El monto de caja de ahorro no puede ser negativo: ', NEW.monto);
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
END$$

CREATE TRIGGER `before_update_historial_pagos`
BEFORE UPDATE ON `historial_pagos`
FOR EACH ROW BEGIN
  DECLARE msg VARCHAR(255);
  IF NEW.empleado_id != OLD.empleado_id OR
     NEW.quincena_no != OLD.quincena_no OR
     NEW.mes != OLD.mes OR
     NEW.anio != OLD.anio THEN
    SET msg = 'No está permitido modificar empleado_id, quincena_no, mes o anio de un registro existente.';
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.salario_neto < 0 THEN
    SET msg = CONCAT('El salario neto no puede ser negativo: ', NEW.salario_neto);
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
END$$

CREATE TRIGGER `before_update_caja_ahorro`
BEFORE UPDATE ON `caja_ahorro`
FOR EACH ROW BEGIN
  DECLARE msg VARCHAR(255);
  IF NEW.empleado_id != OLD.empleado_id OR
     NEW.quincena_no != OLD.quincena_no OR
     NEW.mes != OLD.mes OR
     NEW.anio != OLD.anio THEN
    SET msg = 'No está permitido modificar empleado_id, quincena_no, mes o anio de un registro existente.';
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.monto < 0 THEN
    SET msg = CONCAT('El monto de caja de ahorro no puede ser negativo: ', NEW.monto);
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
END$$
DELIMITER ;