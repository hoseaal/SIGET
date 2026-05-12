import pool from './src/utils/database.js';

async function updateDB() {
  try {
    console.log('--- Iniciando actualización de DB para Soporte Técnico ---');

    // 1. Agregar campos de diagnóstico y solución
    const [colsDiag] = await pool.query("SHOW COLUMNS FROM transferencia LIKE 'diagnostico_tecnico'");
    if (colsDiag.length === 0) {
      await pool.query("ALTER TABLE transferencia ADD COLUMN diagnostico_tecnico TEXT NULL AFTER observaciones");
      console.log('- Columna diagnostico_tecnico agregada.');
    }

    const [colsSol] = await pool.query("SHOW COLUMNS FROM transferencia LIKE 'solucion_tecnica'");
    if (colsSol.length === 0) {
      await pool.query("ALTER TABLE transferencia ADD COLUMN solucion_tecnica TEXT NULL AFTER diagnostico_tecnico");
      console.log('- Columna solucion_tecnica agregada.');
    }

    const [colsFecEnt] = await pool.query("SHOW COLUMNS FROM transferencia LIKE 'fecha_entrega'");
    if (colsFecEnt.length === 0) {
      await pool.query("ALTER TABLE transferencia ADD COLUMN fecha_entrega TIMESTAMP NULL AFTER usuario_tecnico_id");
      console.log('- Columna fecha_entrega agregada.');
    }

    console.log('--- Actualización finalizada con éxito ---');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la actualización:', error);
    process.exit(1);
  }
}

updateDB();
