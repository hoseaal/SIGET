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

  static async getPage ({ page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit
    const params = []
    const countParams = []
    let whereClause = ''

    if (search.trim()) {
      whereClause = 'WHERE cat_cat LIKE ?'
      params.push(`%${search}%`)
      countParams.push(`%${search}%`)
    }

    const dataQuery = `SELECT * FROM tmacat ${whereClause} ORDER BY cat_ide ASC LIMIT ? OFFSET ?`
    const countQuery = `SELECT COUNT(*) as total FROM tmacat ${whereClause}`

    const [rows] = await pool.query(dataQuery, [...params, limit, offset])
    const [[{ total }]] = await pool.query(countQuery, countParams)

    return { data: rows, total }
  }
}
