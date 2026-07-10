import pool from './src/utils/database.js';

async function setupDB() {
  try {
    console.log('--- Iniciando refinamiento de Base de Datos ---');

    // 1. Crear o modificar tabla transferencia
    // Primero verificamos si existe
    const [tables] = await pool.query("SHOW TABLES LIKE 'transferencia'");
    
    if (tables.length > 0) {
      console.log('Tabla transferencia detectada. Aplicando modificaciones...');
      
      // Comprobar si 'nro' existe para eliminarlo
      const [cols] = await pool.query("SHOW COLUMNS FROM transferencia LIKE 'nro'");
      if (cols.length > 0) {
        await pool.query("ALTER TABLE transferencia DROP COLUMN nro");
        console.log('- Columna nro eliminada.');
      }
      
      // Agregar nuevas columnas si no existen
      const [nroCasoCol] = await pool.query("SHOW COLUMNS FROM transferencia LIKE 'nro_caso'");
      if (nroCasoCol.length === 0) {
        await pool.query("ALTER TABLE transferencia ADD COLUMN nro_caso VARCHAR(15) AFTER id");
        console.log('- Columna nro_caso agregada.');
      }
      
      const [userIdCol] = await pool.query("SHOW COLUMNS FROM transferencia LIKE 'usuario_id'");
      if (userIdCol.length === 0) {
        await pool.query("ALTER TABLE transferencia ADD COLUMN usuario_id INT(11) AFTER equipo_id");
        console.log('- Columna usuario_id agregada.');
      }

      const [prioridadCol] = await pool.query("SHOW COLUMNS FROM transferencia LIKE 'prioridad'");
      if (prioridadCol.length === 0) {
        await pool.query("ALTER TABLE transferencia ADD COLUMN prioridad ENUM('Baja', 'Media', 'Alta') DEFAULT 'Media' AFTER asunto");
        console.log('- Columna prioridad agregada.');
      }

      const [obsCol] = await pool.query("SHOW COLUMNS FROM transferencia LIKE 'observaciones'");
      if (obsCol.length === 0) {
        await pool.query("ALTER TABLE transferencia ADD COLUMN observaciones TEXT NULL AFTER prioridad");
        console.log('- Columna observaciones agregada.');
      }

      const [fecRecCol] = await pool.query("SHOW COLUMNS FROM transferencia LIKE 'fecha_recepcion'");
      if (fecRecCol.length === 0) {
        await pool.query("ALTER TABLE transferencia ADD COLUMN fecha_recepcion TIMESTAMP NULL AFTER status");
        console.log('- Columna fecha_recepcion agregada.');
      }

      const [tecIdCol] = await pool.query("SHOW COLUMNS FROM transferencia LIKE 'usuario_tecnico_id'");
      if (tecIdCol.length === 0) {
        await pool.query("ALTER TABLE transferencia ADD COLUMN usuario_tecnico_id INT(11) NULL AFTER fecha_recepcion");
        console.log('- Columna usuario_tecnico_id agregada.');
      }

    } else {
      console.log('Creando tabla transferencia desde cero...');
      await pool.query(`
        CREATE TABLE transferencia (
          id INT(11) NOT NULL AUTO_INCREMENT,
          nro_caso VARCHAR(15) NOT NULL,
          fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          origen_id INT(11) NOT NULL,
          destino_id INT(11) NOT NULL,
          equipo_id INT(11) NOT NULL,
          usuario_id INT(11) NOT NULL,
          asunto TEXT NOT NULL,
          prioridad ENUM('Baja', 'Media', 'Alta') DEFAULT 'Media',
          observaciones TEXT NULL,
          status INT(11) DEFAULT 1,
          fecha_recepcion TIMESTAMP NULL NULL DEFAULT NULL,
          usuario_tecnico_id INT(11) NULL,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
    }

    // 2. Poblar status
    const statuses = [
      'Pendiente',
      'Recibido',
      'En Revisión',
      'En Reparación',
      'Listo para Entrega',
      'Entregado',
      'Anulado'
    ];

    for (const name of statuses) {
      const [rows] = await pool.query('SELECT * FROM status WHERE nombre = ?', [name]);
      if (rows.length === 0) {
        await pool.query('INSERT INTO status (nombre) VALUES (?)', [name]);
        console.log(`- Status '${name}' insertado.`);
      }
    }

    // 3. Añadir constraints si no existen (simplificado)
    try {
      await pool.query('ALTER TABLE transferencia ADD CONSTRAINT fk_trans_orig FOREIGN KEY (origen_id) REFERENCES departamentos(id)');
      await pool.query('ALTER TABLE transferencia ADD CONSTRAINT fk_trans_dest FOREIGN KEY (destino_id) REFERENCES departamentos(id)');
      await pool.query('ALTER TABLE transferencia ADD CONSTRAINT fk_trans_eq FOREIGN KEY (equipo_id) REFERENCES equipos(id)');
      await pool.query('ALTER TABLE transferencia ADD CONSTRAINT fk_trans_stat FOREIGN KEY (status) REFERENCES status(id)');
      await pool.query('ALTER TABLE transferencia ADD CONSTRAINT fk_trans_user FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id)');
      await pool.query('ALTER TABLE transferencia ADD CONSTRAINT fk_trans_tecnico FOREIGN KEY (usuario_tecnico_id) REFERENCES usuarios(usuario_id)');
      console.log('Constraints añadidas correctamente.');
    } catch (e) {
      console.log('Nota: Algunas constraints ya podrían existir o fallaron por datos existentes.');
    }

    console.log('--- Proceso finalizado con éxito ---');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el setup:', error);
    process.exit(1);
  }
}

setupDB();
