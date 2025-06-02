/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class MarcaModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT mar_ide, mar_mar FROM tmamar')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(
      'SELECT mar_ide, mar_mar FROM tmamar WHERE mar_ide = ?',
      [id]
    )
    return rows[0] || null
  }

  static async create ({ mar_ide, mar_mar }) {
    const [result] = await pool.query(
      'INSERT INTO tmamar (mar_ide, mar_mar) VALUES (?, ?)',
      [mar_ide, mar_mar]
    )
    return { mar_ide: result.insertId, mar_mar }
  }

  static async update (id, { mar_mar }) {
    const [result] = await pool.query(
      'UPDATE tmamar SET mar_mar = ? WHERE mar_ide = ?',
      [mar_mar, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query(
      'DELETE FROM tmamar WHERE mar_ide = ?',
      [id]
    )
    return result.affectedRows > 0
  }
}
