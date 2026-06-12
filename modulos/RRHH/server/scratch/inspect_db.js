import pool from '../src/utils/database.js'

async function inspect() {
  try {
    console.log('--- TABLES IN DB ---')
    const [tables] = await pool.query('SHOW TABLES')
    console.log(tables)

    for (const row of tables) {
      const tableName = Object.values(row)[0]
      if (tableName.includes('vacac') || tableName === 'empleados' || tableName === 'estatus_funcionarios') {
        console.log(`\n--- COLUMNS FOR TABLE: ${tableName} ---`)
        const [columns] = await pool.query(`DESCRIBE \`${tableName}\``)
        console.log(columns)
      }
    }

    process.exit(0)
  } catch (err) {
    console.error('Error inspecting database:', err)
    process.exit(1)
  }
}

inspect()
