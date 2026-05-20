/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class SubcategoriaModel {
  static async getAll () {
    const [rows] = await pool.query(`
      SELECT s.sca_ide, s.sca_sca, s.cat_ide, c.cat_cat
      FROM tessca s
      JOIN tmacat c ON s.cat_ide = c.cat_ide
      ORDER BY s.sca_ide ASC
    `)
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`
      SELECT s.sca_ide, s.sca_sca, s.cat_ide, c.cat_cat
      FROM tessca s
      JOIN tmacat c ON s.cat_ide = c.cat_ide
      WHERE s.sca_ide = ?
    `, [id])
    return rows[0] || null
  }

  static async getByCategoria (catId) {
    const [rows] = await pool.query(`
      SELECT s.sca_ide, s.sca_sca 
      FROM tessca s
      WHERE s.cat_ide = ?
    `, [catId])
    return rows
  }

  static async create ({ sca_ide, sca_sca, cat_ide }) {
    const [result] = await pool.query(
      'INSERT INTO tessca (sca_ide, sca_sca, cat_ide) VALUES (?, ?, ?)',
      [sca_ide, sca_sca, cat_ide]
    )
    return { sca_ide: result.insertId, sca_sca, cat_ide }
  }

  static async update (id, { sca_sca, cat_ide }) {
    const [result] = await pool.query(
      'UPDATE tessca SET sca_sca = ?, cat_ide = ? WHERE sca_ide = ?',
      [sca_sca, cat_ide, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tessca WHERE sca_ide = ?', [id])
    return result.affectedRows > 0
  }

  static async getPage ({ page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit
    const params = []
    const countParams = []
    let whereClause = ''

    if (search.trim()) {
      whereClause = 'WHERE s.sca_sca LIKE ? OR c.cat_cat LIKE ?'
      params.push(`%${search}%`, `%${search}%`)
      countParams.push(`%${search}%`, `%${search}%`)
    }

    const dataQuery = `
      SELECT s.sca_ide, s.sca_sca, s.cat_ide, c.cat_cat
      FROM tessca s
      JOIN tmacat c ON s.cat_ide = c.cat_ide
      ${whereClause}
      ORDER BY s.sca_ide ASC
      LIMIT ? OFFSET ?
    `
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tessca s
      JOIN tmacat c ON s.cat_ide = c.cat_ide
      ${whereClause}
    `

    const [rows] = await pool.query(dataQuery, [...params, limit, offset])
    const [[{ total }]] = await pool.query(countQuery, countParams)

    return { data: rows, total }
  }
}
