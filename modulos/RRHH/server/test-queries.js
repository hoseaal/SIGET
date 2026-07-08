const mysql = require('mysql2/promise');
async function run() {
  const pool = mysql.createPool({host: 'localhost', user: 'root', password: '', database: 'dbsigetrrhh-1'});
  try {
    await pool.query(`SELECT hp.id_historial AS historial_id, CONCAT(hp.quincena_no, ' quincena ', hp.mes, '-', hp.anio) AS periodo, hp.fecha_registro AS fecha_pago, hp.tipo_personal AS tipo_nomina, hp.salario_neto AS monto_total, hp.fecha_registro AS creado_en FROM historial_pagos hp WHERE hp.empleado_id = 1 ORDER BY hp.anio DESC, hp.mes DESC, hp.quincena_no DESC LIMIT 24`);
    console.log('Nomina OK');
  } catch(e) { console.error('Nomina error:', e.message); }

  try {
    await pool.query(`SELECT ra.antiguedad_id, ra.fecha_inicio AS fecha_ingreso, ra.fecha_fin AS fecha_egreso, COALESCE(ci.nombre, ra.institucion_alternativa) AS institucion, TIMESTAMPDIFF(YEAR, ra.fecha_inicio, COALESCE(ra.fecha_fin, CURDATE())) AS anios_reconocidos, TIMESTAMPDIFF(MONTH, ra.fecha_inicio, COALESCE(ra.fecha_fin, CURDATE())) % 12 AS meses_reconocidos, DATEDIFF(COALESCE(ra.fecha_fin, CURDATE()), ra.fecha_inicio + INTERVAL TIMESTAMPDIFF(MONTH, ra.fecha_inicio, COALESCE(ra.fecha_fin, CURDATE())) MONTH) AS dias_reconocidos FROM registros_antiguedades ra LEFT JOIN catalogo_instituciones ci ON ra.id_institucion = ci.id_institucion WHERE ra.empleado_id = 1 ORDER BY ra.fecha_inicio DESC`);
    console.log('Antiguedades OK');
  } catch(e) { console.error('Antiguedades error:', e.message); }

  try {
    await pool.query(`SELECT v.id_vacaciones AS vacacion_id, YEAR(v.fecha_tope) AS periodo, fv.fecha_inicio, fv.fecha_fin, fv.dias_habiles AS dias_disfrute, sv.descripcion AS estatus FROM vacaciones v JOIN fechas_vacaciones fv ON v.id_vacaciones = fv.id_vacaciones LEFT JOIN status_vacaciones sv ON fv.id_status_vacaciones = sv.id_status_vacaciones WHERE v.id_empleado = 1 ORDER BY fv.fecha_inicio DESC`);
    console.log('Vacaciones OK');
  } catch(e) { console.error('Vacaciones error:', e.message); }
  
  process.exit(0);
}
run().catch(console.error);
