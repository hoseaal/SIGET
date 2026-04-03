import db from './src/utils/database.js';

async function main() {
  const [cols1] = await db.query("SELECT * FROM condiciones_laborales LIMIT 10");
  console.log('condiciones_laborales:', cols1);
  process.exit();
}

main();
