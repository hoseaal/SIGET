/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class ConfiguracionVacacionesObrerosModel {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM configuracion_vacaciones_obreros ORDER BY anio ASC')
    return rows
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM configuracion_vacaciones_obreros WHERE id_configuracion = ?', [id])
    return rows[0] || null
  }

  static async create({ anio, dias_disfrute, pago }) {
    const [result] = await pool.query(
      'INSERT INTO configuracion_vacaciones_obreros (anio, dias_disfrute, pago) VALUES (?, ?, ?)',
      [anio, dias_disfrute, pago]
    )
    return { id_configuracion: result.insertId, anio, dias_disfrute, pago }
  }

  static async update(id, { anio, dias_disfrute, pago }) {
    const updates = []
    const params = []

    if (anio !== undefined) { updates.push('anio = ?'); params.push(anio) }
    if (dias_disfrute !== undefined) { updates.push('dias_disfrute = ?'); params.push(dias_disfrute) }
    if (pago !== undefined) { updates.push('pago = ?'); params.push(pago) }

    if (updates.length === 0) return 0

    params.push(id)

    const [result] = await pool.query(
      `UPDATE configuracion_vacaciones_obreros SET ${updates.join(', ')} WHERE id_configuracion = ?`,
      params
    )
    return result.affectedRows > 0
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM configuracion_vacaciones_obreros WHERE id_configuracion = ?', [id])
    return result.affectedRows > 0
  }
}
