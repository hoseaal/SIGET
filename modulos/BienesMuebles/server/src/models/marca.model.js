/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class MarcaModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT mar_ide, mar_mar FROM tmamar')
    return rows
  }

  static async getAllAlphabetically () {
    const [rows] = await pool.query('SELECT mar_ide, mar_mar FROM tmamar ORDER BY mar_mar')
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

  static async getPage ({ page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit
    const params = []
    const countParams = []
    let whereClause = ''

    if (search.trim()) {
      whereClause = 'WHERE mar_mar LIKE ?'
      params.push(`%${search}%`)
      countParams.push(`%${search}%`)
    }

    const dataQuery = `SELECT mar_ide, mar_mar FROM tmamar ${whereClause} ORDER BY mar_ide ASC LIMIT ? OFFSET ?`
    const countQuery = `SELECT COUNT(*) as total FROM tmamar ${whereClause}`

    const [rows] = await pool.query(dataQuery, [...params, limit, offset])
    const [[{ total }]] = await pool.query(countQuery, countParams)

    return { data: rows, total }
  }
}
