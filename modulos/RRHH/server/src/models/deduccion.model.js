/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class DeduccionModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM deducciones')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM deducciones WHERE deduccion_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ nombre, porcentaje }) {
    const [result] = await pool.query(
      'INSERT INTO deducciones (nombre, porcentaje) VALUES (?, ?)',
      [nombre, porcentaje]
    )
    return { deduccion_id: result.insertId, nombre, porcentaje }
  }

  static async update (id, { nombre, porcentaje }) {
    const [result] = await pool.query(
      'UPDATE deducciones SET nombre = ?, porcentaje = ? WHERE deduccion_id = ?',
      [nombre, porcentaje, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM deducciones WHERE deduccion_id = ?', [id])
    return result.affectedRows > 0
  }
}