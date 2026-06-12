/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class ConfiguracionVacacionesModel {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM configuracion_vacaciones ORDER BY rango_minimo ASC')
    return rows
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM configuracion_vacaciones WHERE id_configuracion = ?', [id])
    return rows[0] || null
  }

  static async create({ rango_minimo, rango_maximo, dias_disfrute, pago }) {
    const [result] = await pool.query(
      'INSERT INTO configuracion_vacaciones (rango_minimo, rango_maximo, dias_disfrute, pago) VALUES (?, ?, ?, ?)',
      [rango_minimo, rango_maximo, dias_disfrute, pago]
    )
    return { id_configuracion: result.insertId, rango_minimo, rango_maximo, dias_disfrute, pago }
  }

  static async update(id, { rango_minimo, rango_maximo, dias_disfrute, pago }) {
    const updates = []
    const params = []

    if (rango_minimo !== undefined) { updates.push('rango_minimo = ?'); params.push(rango_minimo) }
    if (rango_maximo !== undefined) { updates.push('rango_maximo = ?'); params.push(rango_maximo) }
    if (dias_disfrute !== undefined) { updates.push('dias_disfrute = ?'); params.push(dias_disfrute) }
    if (pago !== undefined) { updates.push('pago = ?'); params.push(pago) }

    if (updates.length === 0) return 0

    params.push(id)

    const [result] = await pool.query(
      `UPDATE configuracion_vacaciones SET ${updates.join(', ')} WHERE id_configuracion = ?`,
      params
    )
    return result.affectedRows > 0
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM configuracion_vacaciones WHERE id_configuracion = ?', [id])
    return result.affectedRows > 0
  }
}
