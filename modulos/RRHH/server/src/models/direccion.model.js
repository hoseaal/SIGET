/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class DireccionModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tmadir')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tmadir WHERE dir_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ dir_nom }) {
    // No insertamos dir_ide porque es AUTO_INCREMENT
    const [result] = await pool.query(
      'INSERT INTO tmadir (dir_nom) VALUES (?)',
      [dir_nom]
    )
    // Devolvemos el ID generado y el nombre
    return { dir_ide: result.insertId, dir_nom }
  }

  static async update (id, { dir_nom }) {
    const [result] = await pool.query(
      'UPDATE tmadir SET dir_nom = ? WHERE dir_ide = ?',
      [dir_nom, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tmadir WHERE dir_ide = ?', [id])
    return result.affectedRows > 0
  }
}