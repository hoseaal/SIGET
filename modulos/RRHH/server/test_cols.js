import db from './src/utils/database.js';

async function main() {
  const [cols1] = await db.query("SHOW COLUMNS FROM empleados");
  console.log('empleados columns:', cols1.map(c => c.Field));
  const [cols2] = await db.query("SHOW COLUMNS FROM datos_laborales");
  console.log('datos_laborales columns:', cols2.map(c => c.Field));
  process.exit();
}

main();
