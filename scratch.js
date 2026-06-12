import pool from './modulos/RRHH/server/src/utils/database.js';

async function checkHolidays() {
  try {
    const [rows] = await pool.query("SHOW TABLES LIKE '%festiv%'");
    console.log("Tables found:", rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkHolidays();
