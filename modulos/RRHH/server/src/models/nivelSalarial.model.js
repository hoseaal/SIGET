/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class NivelSalarialModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tesniv')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tesniv WHERE niv_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ niv_nom, niv_sal, ona_ide }) {
    const [result] = await pool.query(
      'INSERT INTO tesniv (niv_nom, niv_sal, ona_ide) VALUES (?, ?, ?)',
      [niv_nom, niv_sal, ona_ide]
    )
    return { niv_ide: result.insertId, niv_nom, niv_sal, ona_ide }
  }

  static async update (id, { niv_nom, niv_sal, ona_ide }) {
    const [result] = await pool.query(
      'UPDATE tesniv SET niv_nom = ?, niv_sal = ?, ona_ide = ? WHERE niv_ide = ?',
      [niv_nom, niv_sal, ona_ide, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tesniv WHERE niv_ide = ?', [id])
    return result.affectedRows > 0
  }
}