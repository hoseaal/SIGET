/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class ProfesionModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tmapro')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tmapro WHERE pro_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ pro_nom }) {
    const [result] = await pool.query(
      'INSERT INTO tmapro (pro_nom) VALUES (?)',
      [pro_nom]
    )
    return { pro_ide: result.insertId, pro_nom }
  }

  static async update (id, { pro_nom }) {
    const [result] = await pool.query(
      'UPDATE tmapro SET pro_nom = ? WHERE pro_ide = ?',
      [pro_nom, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tmapro WHERE pro_ide = ?', [id])
    return result.affectedRows > 0
  }
}