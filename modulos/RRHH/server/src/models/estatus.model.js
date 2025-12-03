/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class EstatusModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tmaest')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tmaest WHERE est_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ est_nom }) {
    const [result] = await pool.query(
      'INSERT INTO tmaest (est_nom) VALUES (?)',
      [est_nom]
    )
    return { est_ide: result.insertId, est_nom }
  }

  static async update (id, { est_nom }) {
    const [result] = await pool.query(
      'UPDATE tmaest SET est_nom = ? WHERE est_ide = ?',
      [est_nom, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tmaest WHERE est_ide = ?', [id])
    return result.affectedRows > 0
  }
}