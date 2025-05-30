/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class CategoriaModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tmacat')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tmacat WHERE cat_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ cat_ide, cat_cat }) {
    const [result] = await pool.query(
      'INSERT INTO tmacat (cat_ide, cat_cat) VALUES (?, ?)',
      [cat_ide, cat_cat]
    )
    return { cat_ide: result.insertId, cat_cat }
  }

  static async update (id, { cat_cat }) {
    const [result] = await pool.query(
      'UPDATE tmacat SET cat_cat = ? WHERE cat_ide = ?',
      [cat_cat, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tmacat WHERE cat_ide = ?', [id])
    return result.affectedRows > 0
  }
}
