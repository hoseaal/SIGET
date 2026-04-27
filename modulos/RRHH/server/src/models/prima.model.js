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

  static async create ({ nombre, asignacion }) {
    const [result] = await pool.query(
      'INSERT INTO primas_generales (nombre, asignacion) VALUES (?, ?)',
      [nombre, asignacion]
    )
    return { prima_id: result.insertId, nombre, asignacion }
  }

  static async update (id, { nombre, asignacion }) {
    const [result] = await pool.query(
      'UPDATE primas_generales SET nombre = ?, asignacion = ? WHERE prima_id = ?',
      [nombre, asignacion, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM primas_generales WHERE prima_id = ?', [id])
    return result.affectedRows > 0
  }
}