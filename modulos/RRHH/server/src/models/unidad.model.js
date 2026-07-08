
/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class UnidadModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM unidades')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM unidades WHERE unidad_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ nombre, division_id }) {
    const [result] = await pool.query(
      'INSERT INTO unidades (nombre, division_id) VALUES (?, ?)',
      [nombre, division_id]
    )
    return { unidad_id: result.insertId, nombre, division_id }
  }

  static async update (id, { nombre, division_id }) {
    const [result] = await pool.query(
      'UPDATE unidades SET nombre = ?, division_id = ? WHERE unidad_id = ?',
      [nombre, division_id, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM unidades WHERE unidad_id = ?', [id])
    return result.affectedRows > 0
  }
}