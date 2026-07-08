import pool from '../src/utils/database.js'

async function inspectRows() {
  try {
    const tables = ['vacaciones', 'fechas_vacaciones', 'solicitud_vacaciones', 'historial_vacaciones', 'configuracion_vacaciones', 'configuracion_vacaciones_obreros']
    for (const table of tables) {
      const [rows] = await pool.query(`SELECT * FROM \`${table}\` LIMIT 5`)
      console.log(`\n--- ROWS IN TABLE: ${table} (Total: ${rows.length}) ---`)
      console.log(rows)
    }
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

inspectRows()
