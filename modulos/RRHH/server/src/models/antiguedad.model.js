/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class AntiguedadModel {
  static async getAll() {
    // Ordenamos por años (anios_cumplidos) para que el tabulador salga ordenado
    const [rows] = await pool.query('SELECT * FROM configuracion_antiguedad ORDER BY anios_cumplidos ASC')
    return rows
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM configuracion_antiguedad WHERE antiguedad_id = ?', [id])
    return rows[0] || null
  }

  static async create({ anios_cumplidos, porcentaje_actual, porcentaje_anterior }) {
    // Manejo de porcentaje_anterior opcional
    const valorAntiguo = (porcentaje_anterior !== undefined && porcentaje_anterior !== '') ? porcentaje_anterior : null

    const [result] = await pool.query(
      'INSERT INTO configuracion_antiguedad (anios_cumplidos, porcentaje_actual, porcentaje_anterior) VALUES (?, ?, ?)',
      [anios_cumplidos, porcentaje_actual, valorAntiguo]
    )
    return { antiguedad_id: result.insertId, anios_cumplidos, porcentaje_actual, porcentaje_anterior: valorAntiguo }
  }

  static async update(id, { anios_cumplidos, porcentaje_actual, porcentaje_anterior }) {
    const updates = []
    const params = []

    if (anios_cumplidos !== undefined) { updates.push('anios_cumplidos = ?'); params.push(anios_cumplidos) }
    if (porcentaje_actual !== undefined) { updates.push('porcentaje_actual = ?'); params.push(porcentaje_actual) }
    if (porcentaje_anterior !== undefined) { 
        updates.push('porcentaje_anterior = ?'); 
        params.push(porcentaje_anterior !== '' ? porcentaje_anterior : null);
    }

    if (updates.length === 0) return 0 // Nada que actualizar

    params.push(id)

    const [result] = await pool.query(
      `UPDATE configuracion_antiguedad SET ${updates.join(', ')} WHERE antiguedad_id = ?`,
      params
    )
    return result.affectedRows > 0
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM configuracion_antiguedad WHERE antiguedad_id = ?', [id])
    return result.affectedRows > 0
  }
}