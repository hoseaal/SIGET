/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class EstatusModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM estatus_funcionarios')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM estatus_funcionarios WHERE estatus_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ nombre }) {
    const [result] = await pool.query(
      'INSERT INTO estatus_funcionarios (nombre) VALUES (?)',
      [nombre]
    )
    return { estatus_id: result.insertId, nombre }
  }

  static async update (id, { nombre }) {
    const [result] = await pool.query(
      'UPDATE estatus_funcionarios SET nombre = ? WHERE estatus_id = ?',
      [nombre, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM estatus_funcionarios WHERE estatus_id = ?', [id])
    return result.affectedRows > 0
  }
}