import pool from './src/utils/database.js';

async function checkStatus() {
  try {
    const [rows] = await pool.query('SELECT * FROM status');
    console.log('Current Statuses:', JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkStatus();
