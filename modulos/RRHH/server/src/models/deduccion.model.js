/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class DeduccionModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tmade')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tmade WHERE ded_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ ded_nom, ded_por }) {
    const [result] = await pool.query(
      'INSERT INTO tmade (ded_nom, ded_por) VALUES (?, ?)',
      [ded_nom, ded_por]
    )
    return { ded_ide: result.insertId, ded_nom, ded_por }
  }

  static async update (id, { ded_nom, ded_por }) {
    const [result] = await pool.query(
      'UPDATE tmade SET ded_nom = ?, ded_por = ? WHERE ded_ide = ?',
      [ded_nom, ded_por, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tmade WHERE ded_ide = ?', [id])
    return result.affectedRows > 0
  }
}