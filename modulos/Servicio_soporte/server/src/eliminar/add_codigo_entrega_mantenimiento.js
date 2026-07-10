import pool from '../utils/database.js';

async function migrate() {
    try {
        console.log('--- Iniciando Migración: Agregar codigo_entrega a Mantenimiento ---');
        
        // Verificar si la columna ya existe
        const [columns] = await pool.query("SHOW COLUMNS FROM mantenimiento LIKE 'codigo_entrega'");
        
        if (columns.length === 0) {
            await pool.query("ALTER TABLE mantenimiento ADD COLUMN codigo_entrega VARCHAR(6) DEFAULT NULL AFTER status");
            console.log('✅ Columna "codigo_entrega" agregada con éxito a la tabla "mantenimiento".');
        } else {
            console.log('ℹ️ La columna "codigo_entrega" ya existe en la tabla "mantenimiento".');
        }
        
        console.log('--- Migración finalizada con éxito ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();
