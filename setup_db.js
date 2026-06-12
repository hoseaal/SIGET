import pool from './modulos/RRHH/server/src/utils/database.js';

async function setupDB() {
  try {
    console.log('Creating dias_festivos table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dias_festivos (
        id_festivo INT AUTO_INCREMENT PRIMARY KEY,
        fecha DATE NOT NULL,
        descripcion VARCHAR(255) NOT NULL,
        recurrente TINYINT(1) DEFAULT 0
      )
    `);
    console.log('Table dias_festivos created or already exists.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating table:', err);
    process.exit(1);
  }
}

setupDB();
