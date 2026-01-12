/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class AntiguedadModel {
  static async getAll () {
    // Ordenamos por años (ant_ani) para que el tabulador salga ordenado
    const [rows] = await pool.query('SELECT * FROM tmaant ORDER BY ant_ani ASC')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tmaant WHERE ant_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ ant_ani, ant_act, ant_ant }) {
    // Manejo de ant_ant opcional
    const valorAntiguo = ant_ant !== undefined ? ant_ant : null

    const [result] = await pool.query(
      'INSERT INTO tmaant (ant_ani, ant_act, ant_ant) VALUES (?, ?, ?)',
      [ant_ani, ant_act, valorAntiguo]
    )
    return { ant_ide: result.insertId, ant_ani, ant_act, ant_ant: valorAntiguo }
  }

  static async update (id, { ant_ani, ant_act, ant_ant }) {
    const updates = []
    const params = []

    if (ant_ani !== undefined) { updates.push('ant_ani = ?'); params.push(ant_ani) }
    if (ant_act !== undefined) { updates.push('ant_act = ?'); params.push(ant_act) }
    if (ant_ant !== undefined) { updates.push('ant_ant = ?'); params.push(ant_ant) }

    if (updates.length === 0) return 0 // Nada que actualizar

    params.push(id)
    
    const [result] = await pool.query(
      `UPDATE tmaant SET ${updates.join(', ')} WHERE ant_ide = ?`,
      params
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tmaant WHERE ant_ide = ?', [id])
    return result.affectedRows > 0
  }
}