/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class CargoOnapreModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM cargos_onapre')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM cargos_onapre WHERE cargo_onapre_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ nombre }) {
    const [result] = await pool.query(
      'INSERT INTO cargos_onapre (nombre) VALUES (?)',
      [nombre]
    )
    return { cargo_onapre_id: result.insertId, nombre }
  }

  static async update (id, { nombre }) {
    const [result] = await pool.query(
      'UPDATE cargos_onapre SET nombre = ? WHERE cargo_onapre_id = ?',
      [nombre, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM cargos_onapre WHERE cargo_onapre_id = ?', [id])
    return result.affectedRows > 0
  }
}