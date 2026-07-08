import pool from './modulos/RRHH/server/src/utils/database.js';

async function checkEstatus() {
    try {
        const [rows] = await pool.query('SELECT * FROM estatus_funcionarios');
        console.log('Estatus:', rows);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkEstatus();
