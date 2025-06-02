/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class TipoBienModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tmatip ORDER BY CAST(tip_ide AS UNSIGNED)')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tmatip WHERE tip_ide = ?', [id])
    return rows[0]
  }

  static async create ({ tip_ide, tip_tip }) {
    const [result] = await pool.query('INSERT INTO tmatip (tip_ide, tip_tip) VALUES (?, ?)', [tip_ide, tip_tip])
    return { tip_ide: result.insertId, tip_tip }
  }

  static async update (id, { tip_tip }) {
    await pool.query('UPDATE tmatip SET tip_tip = ? WHERE tip_ide = ?', [tip_tip, id])
  }

  static async delete (id) {
    await pool.query('DELETE FROM tmatip WHERE tip_ide = ?', [id])
  }
}
