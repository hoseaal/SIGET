/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class CargoOnapreModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tmaona')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tmaona WHERE ona_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ ona_nom }) {
    const [result] = await pool.query(
      'INSERT INTO tmaona (ona_nom) VALUES (?)',
      [ona_nom]
    )
    return { ona_ide: result.insertId, ona_nom }
  }

  static async update (id, { ona_nom }) {
    const [result] = await pool.query(
      'UPDATE tmaona SET ona_nom = ? WHERE ona_ide = ?',
      [ona_nom, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tmaona WHERE ona_ide = ?', [id])
    return result.affectedRows > 0
  }
}