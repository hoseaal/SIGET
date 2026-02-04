/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class CondicionLaboralModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tmacol')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tmacol WHERE col_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ col_nom }) {
    const [result] = await pool.query(
      'INSERT INTO tmacol (col_nom) VALUES (?)',
      [col_nom]
    )
    return { col_ide: result.insertId, col_nom }
  }

  static async update (id, { col_nom }) {
    const [result] = await pool.query(
      'UPDATE tmacol SET col_nom = ? WHERE col_ide = ?',
      [col_nom, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tmacol WHERE col_ide = ?', [id])
    return result.affectedRows > 0
  }
}