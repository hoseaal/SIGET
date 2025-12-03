
/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class UnidadModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tesuni')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tesuni WHERE uni_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ uni_nom, div_ide }) {
    const [result] = await pool.query(
      'INSERT INTO tesuni (uni_nom, div_ide) VALUES (?, ?)',
      [uni_nom, div_ide]
    )
    return { uni_ide: result.insertId, uni_nom, div_ide }
  }

  static async update (id, { uni_nom, div_ide }) {
    const [result] = await pool.query(
      'UPDATE tesuni SET uni_nom = ?, div_ide = ? WHERE uni_ide = ?',
      [uni_nom, div_ide, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tesuni WHERE uni_ide = ?', [id])
    return result.affectedRows > 0
  }
}