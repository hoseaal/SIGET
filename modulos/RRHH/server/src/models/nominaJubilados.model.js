/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class NominaJubiladosModel {
  /**
   * Obtiene la data base de los jubilados para el proceso de nómina.
   */
  static async getJubiladosData() {
    const sql = `
      SELECT 
        e.empleado_id,
        e.cedula,
        e.nombres,
        e.apellidos,
        e.fecha_ingreso,
        e.cuenta_bancaria,
        j.porcentaje_jubilacion,
        j.fecha_efectiva AS fecha_retiro,
        ns.salario_base,
        cet.nombre AS cargo_cet_nombre,
        ona.nombre AS cargo_onapre_nombre,
        dir.nombre AS direccion_nombre,
        divi.nombre AS division_nombre,
        uni.nombre AS unidad_nombre,
        FLOOR((
          COALESCE((
            SELECT SUM(DATEDIFF(COALESCE(ra.fecha_fin, CURDATE()), ra.fecha_inicio))
            FROM registros_antiguedades ra
            WHERE ra.empleado_id = e.empleado_id
          ), 0) + DATEDIFF(CURDATE(), e.fecha_ingreso)
        ) / 365) AS anios_antiguedad
      FROM empleados e
      INNER JOIN jubilados j ON e.empleado_id = j.empleado_id
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN niveles_salariales ns ON dl.nivel_salarial_id = ns.nivel_salarial_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON dl.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      LEFT JOIN divisiones divi ON dl.division_id = divi.division_id
      LEFT JOIN unidades uni ON dl.unidad_id = uni.unidad_id
      WHERE e.estatus_id = 3
    `
    const [rows] = await pool.query(sql)
    return rows
  }

  static async getEscalasAntiguedad() {
    const sql = `SELECT anios_cumplidos, porcentaje_actual, porcentaje_anterior FROM configuracion_antiguedad ORDER BY anios_cumplidos ASC`;
    const [rows] = await pool.query(sql);
    return rows;
  }
}
