/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class NominaSobrevivientesModel {
  /**
   * Obtiene la data base de los sobrevivientes para el proceso de nómina.
   */
  static async getSobrevivientesData() {
    const sql = `
      SELECT 
        s.id_sobreviviente,
        nf.cedula AS familiar_cedula,
        nf.nombres AS familiar_nombres,
        nf.apellidos AS familiar_apellidos,
        nf.cuenta_bancaria AS familiar_cuenta_bancaria,
        e.cedula AS empleado_cedula,
        CONCAT(e.nombres, ' ', e.apellidos) AS empleado_nombre,
        s.fecha_ingreso AS fecha_inicio_beneficio,
        (SELECT sueldo_base FROM sueldo_sobreviente ORDER BY id_sueldo DESC LIMIT 1) AS pension_base_sobreviviente,
        nsa.salario_antiguo AS sueldo_base_anterior_empleado,
        (SELECT asignacion FROM primas_generales WHERE nombre LIKE '%mejoramiento económico%' LIMIT 1) AS prima_mejoramiento_porcentaje
      FROM sobreviviente s
      INNER JOIN nucleo_familiar nf ON s.familiar_id = nf.familiar_id
      INNER JOIN empleados e ON s.empleado_id = e.empleado_id
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN niveles_salariales_antiguos nsa ON dl.nivel_salarial_antiguo_id = nsa.nivel_salarial_antiguo_id
      WHERE s.status = 1
    `
    const [rows] = await pool.query(sql)
    return rows
  }
}
