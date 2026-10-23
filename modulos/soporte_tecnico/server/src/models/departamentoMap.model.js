import pool from '../utils/database.js'

export class DepartamentoMapModel {
  static async getAll () {
    const [rows] = await pool.query(
      `SELECT m.departamento_id, m.dep_ide, m.observacion, d.nombre AS departamento_nombre
       FROM departamento_bienes_map m
       LEFT JOIN departamentos d ON d.id = m.departamento_id
       ORDER BY m.departamento_id ASC`
    )
    return rows
  }

  static async getDepIde (departamentoId) {
    const [rows] = await pool.query(
      'SELECT dep_ide FROM departamento_bienes_map WHERE departamento_id = ? LIMIT 1',
      [departamentoId]
    )
    return rows[0]?.dep_ide ?? null
  }
}
