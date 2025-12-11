/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class PrimaModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tmapri')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tmapri WHERE pri_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ pri_nom, pri_por }) {
    const [result] = await pool.query(
      'INSERT INTO tmapri (pri_nom, pri_por) VALUES (?, ?)',
      [pri_nom, pri_por]
    )
    return { pri_ide: result.insertId, pri_nom, pri_por }
  }

  static async update (id, { pri_nom, pri_por }) {
    const [result] = await pool.query(
      'UPDATE tmapri SET pri_nom = ?, pri_por = ? WHERE pri_ide = ?',
      [pri_nom, pri_por, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tmapri WHERE pri_ide = ?', [id])
    return result.affectedRows > 0
  }
}