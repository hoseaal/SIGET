/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class PrimaModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM primas_generales')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM primas_generales WHERE prima_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ nombre, porcentaje }) {
    const [result] = await pool.query(
      'INSERT INTO primas_generales (nombre, porcentaje) VALUES (?, ?)',
      [nombre, porcentaje]
    )
    return { prima_id: result.insertId, nombre, porcentaje }
  }

  static async update (id, { nombre, porcentaje }) {
    const [result] = await pool.query(
      'UPDATE primas_generales SET nombre = ?, porcentaje = ? WHERE prima_id = ?',
      [nombre, porcentaje, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM primas_generales WHERE prima_id = ?', [id])
    return result.affectedRows > 0
  }
}