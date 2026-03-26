/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class ProfesionModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM profesiones')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM profesiones WHERE profesion_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ nombre }) {
    const [result] = await pool.query(
      'INSERT INTO profesiones (nombre) VALUES (?)',
      [nombre]
    )
    return { profesion_id: result.insertId, nombre }
  }

  static async update (id, { nombre }) {
    const [result] = await pool.query(
      'UPDATE profesiones SET nombre = ? WHERE profesion_id = ?',
      [nombre, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM profesiones WHERE profesion_id = ?', [id])
    return result.affectedRows > 0
  }
}