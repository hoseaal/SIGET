import pool from './src/utils/database.js';

async function checkRoles() {
  try {
    const [roles] = await pool.query('SELECT * FROM roles_sistema');
    console.log('Roles in DB:', JSON.stringify(roles, null, 2));
    const [users] = await pool.query('SELECT username, rol_id FROM usuarios LIMIT 5');
    console.log('Sample Users:', JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkRoles();
