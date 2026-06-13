import pool from '../utils/database.js'

const EXCLUDE_OBRERO = `(cet.nombre LIKE '%OBRERO%' OR cet.nombre LIKE '%ASEADOR%' OR cet.nombre LIKE '%MENSAJERO%' OR cet.nombre LIKE '%VIGILANTE%' OR cet.nombre LIKE '%CHOFER%' OR
ona.nombre LIKE '%OBRERO%' OR ona.nombre LIKE '%ASEADOR%' OR ona.nombre LIKE '%MENSAJERO%' OR ona.nombre LIKE '%VIGILANTE%' OR ona.nombre LIKE '%CHOFER%')`

export class DashboardModel {

  static async contarEmpleados() {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS total_empleados,
        COUNT(CASE WHEN t.estatus_id IN (1, 8, 9) THEN 1 END) AS total_activos,
        COUNT(CASE WHEN t.estatus_id = 3 THEN 1 END) AS total_jubilados,
        COUNT(CASE WHEN t.estatus_id IN (4, 6) THEN 1 END) AS total_pensionados,
        COUNT(CASE WHEN t.estatus_id = 7 THEN 1 END) AS total_sobrevivientes
      FROM empleados t
    `)
    const r = rows[0]

    // Clasificar activos en funcionarios/obreros
    const [activos] = await pool.query(`
      SELECT
        COUNT(CASE WHEN (${EXCLUDE_OBRERO}) AND c.condicion_laboral_id = 1 THEN 1 END) AS total_obreros,
        COUNT(CASE WHEN NOT (${EXCLUDE_OBRERO}) OR c.condicion_laboral_id != 1 THEN 1 END) AS total_funcionarios
      FROM empleados t
      INNER JOIN datos_laborales c ON t.empleado_id = c.empleado_id
      LEFT JOIN cargos_cet cet ON c.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON c.cargo_onapre_id = ona.cargo_onapre_id
      WHERE t.estatus_id IN (1, 8, 9)
    `)

    return {
      total_empleados: Number(r.total_empleados),
      total_activos: Number(r.total_activos),
      total_funcionarios: Number(activos[0].total_funcionarios),
      total_obreros: Number(activos[0].total_obreros),
      total_jubilados: Number(r.total_jubilados),
      total_pensionados: Number(r.total_pensionados),
      total_sobrevivientes: Number(r.total_sobrevivientes)
    }
  }

  static async obtenerTotalesNominaMes(anio, mes) {
    const [rows] = await pool.query(`
      SELECT
        COALESCE(SUM(monto_bruto), 0) AS total_bruto,
        COALESCE(SUM(monto_neto), 0) AS total_neto,
        COALESCE(SUM(monto_bruto - monto_neto), 0) AS total_deducciones,
        COUNT(*) AS total_registros
      FROM historial_salarios_legacy
      WHERE YEAR(fecha_pago) = ? AND MONTH(fecha_pago) = ?
    `, [anio, mes])
    return rows[0]
  }
}
