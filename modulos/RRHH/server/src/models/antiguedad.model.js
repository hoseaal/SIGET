/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class AntiguedadModel {
  static async getAll () {
    // Ordenamos por años (anios_cumplidos) para que el tabulador salga ordenado
    const [rows] = await pool.query('SELECT * FROM configuracion_antiguedad ORDER BY anios_cumplidos ASC')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM configuracion_antiguedad WHERE antiguedad_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ anios_cumplidos, ant_act, ant_ant }) {
    // Manejo de ant_ant opcional
    const valorAntiguo = ant_ant !== undefined ? ant_ant : null

    const [result] = await pool.query(
      'INSERT INTO configuracion_antiguedad (anios_cumplidos, ant_act, ant_ant) VALUES (?, ?, ?)',
      [anios_cumplidos, ant_act, valorAntiguo]
    )
    return { antiguedad_id: result.insertId, anios_cumplidos, ant_act, ant_ant: valorAntiguo }
  }

  static async update (id, { anios_cumplidos, ant_act, ant_ant }) {
    const updates = []
    const params = []

    if (anios_cumplidos !== undefined) { updates.push('anios_cumplidos = ?'); params.push(anios_cumplidos) }
    if (ant_act !== undefined) { updates.push('ant_act = ?'); params.push(ant_act) }
    if (ant_ant !== undefined) { updates.push('ant_ant = ?'); params.push(ant_ant) }

    if (updates.length === 0) return 0 // Nada que actualizar

    params.push(id)
    
    const [result] = await pool.query(
      `UPDATE configuracion_antiguedad SET ${updates.join(', ')} WHERE antiguedad_id = ?`,
      params
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM configuracion_antiguedad WHERE antiguedad_id = ?', [id])
    return result.affectedRows > 0
  }
}