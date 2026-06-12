import pool from '../utils/database.js'

export class FestivosModel {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM dias_festivos ORDER BY MONTH(fecha), DAY(fecha)')
    return rows
  }

  static async create(data) {
    const { fecha, descripcion, recurrente } = data
    const [result] = await pool.query(
      'INSERT INTO dias_festivos (fecha, descripcion, recurrente) VALUES (?, ?, ?)',
      [fecha, descripcion, recurrente ? 1 : 0]
    )
    return result.insertId
  }

  static async update(id, data) {
    const { fecha, descripcion, recurrente } = data
    const [result] = await pool.query(
      'UPDATE dias_festivos SET fecha = ?, descripcion = ?, recurrente = ? WHERE id_festivo = ?',
      [fecha, descripcion, recurrente ? 1 : 0, id]
    )
    return result.affectedRows
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM dias_festivos WHERE id_festivo = ?', [id])
    return result.affectedRows
  }
}
