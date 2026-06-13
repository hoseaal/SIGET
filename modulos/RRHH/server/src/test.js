import pool from './utils/database.js';

async function test() {
  const [rows] = await pool.query(`
    SELECT v.id_vacaciones, fv.id_fecha, fv.id_status_vacaciones, fv.fecha_inicio, fv.fecha_fin, fv.dias_habiles, fv.observaciones
    FROM vacaciones v
    LEFT JOIN fechas_vacaciones fv ON v.id_vacaciones = fv.id_vacaciones
    WHERE v.id_empleado = 28
    ORDER BY fv.id_fecha DESC
  `);
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}
test().catch(console.error);
