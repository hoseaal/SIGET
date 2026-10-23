import pool from '../utils/database.js'

export class DepartamentoModel {
  static async getAll () {
    const [rows] = await pool.query(
      'SELECT id, nombre, activo FROM departamentos ORDER BY nombre'
    )
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(
      'SELECT id, nombre, activo FROM departamentos WHERE id = ?',
      [id]
    )
    return rows[0] || null
  }
}
