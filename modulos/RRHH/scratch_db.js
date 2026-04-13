import pool from './server/src/utils/database.js';

async function run() {
    try {
        console.log("Adding cedula column to nucleo_familiar...");
        await pool.query('ALTER TABLE nucleo_familiar ADD COLUMN cedula VARCHAR(20) DEFAULT NULL');
        console.log("Added cedula");
    } catch(e) { console.error(e.message); }
    process.exit(0);
}

run();
