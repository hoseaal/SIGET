import db from './src/utils/database.js';

async function main() {
  const [cet] = await db.query("SELECT * FROM cargos_cet WHERE nombre LIKE '%OBRERO%' OR nombre LIKE '%ASEADOR%' OR nombre LIKE '%MENSAJERO%' OR nombre LIKE '%VIGILANTE%'");
  console.log('CET C:', cet);
  const [onapre] = await db.query("SELECT * FROM cargos_onapre WHERE nombre LIKE '%OBRERO%' OR nombre LIKE '%ASEADOR%' OR nombre LIKE '%MENSAJERO%' OR nombre LIKE '%VIGILANTE%'");
  console.log('ONAPRE:', onapre);
  process.exit();
}

main();
