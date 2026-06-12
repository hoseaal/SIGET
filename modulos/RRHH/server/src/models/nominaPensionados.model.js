/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class NominaPensionadosModel {
  /**
   * Obtiene la data base de los pensionados para el proceso de nómina.
   */
  static async getPensionadosData() {
    const sql = `
      SELECT 
        e.empleado_id,
        e.cedula,
        e.nombres,
        e.apellidos,
        e.cuenta_bancaria,
        cet.nombre AS cargo_cet_nombre,
        ona.nombre AS cargo_onapre_nombre,
        (SELECT salario_base FROM sueldos_pensionados ORDER BY sueldo_pensionado_id DESC LIMIT 1) AS pension_base
      FROM empleados e
      INNER JOIN pensionado p ON e.empleado_id = p.empleado_id
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON dl.cargo_onapre_id = ona.cargo_onapre_id
      WHERE e.estatus_id IN (4, 6)
    `
    const [rows] = await pool.query(sql)
    return rows
  }
}
