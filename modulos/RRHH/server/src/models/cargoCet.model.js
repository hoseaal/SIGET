/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class CargoCetModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM cargos_cet')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM cargos_cet WHERE cargo_cet_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ nombre }) {
    const [result] = await pool.query(
      'INSERT INTO cargos_cet (nombre) VALUES (?)',
      [nombre]
    )
    return { cargo_cet_id: result.insertId, nombre }
  }

  static async update (id, { nombre }) {
    const [result] = await pool.query(
      'UPDATE cargos_cet SET nombre = ? WHERE cargo_cet_id = ?',
      [nombre, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM cargos_cet WHERE cargo_cet_id = ?', [id])
    return result.affectedRows > 0
  }
}