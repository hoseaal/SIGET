/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class DivisionModel {
  static async getAll () {
    // Opcional: Podrías hacer un JOIN con tmadir para traer el nombre de la dirección
    // pero para mantener el CRUD puro de la tabla, traemos los campos directos.
    const [rows] = await pool.query('SELECT * FROM tesdiv')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tesdiv WHERE div_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ div_nom, dir_ide }) {
    const [result] = await pool.query(
      'INSERT INTO tesdiv (div_nom, dir_ide) VALUES (?, ?)',
      [div_nom, dir_ide]
    )
    return { div_ide: result.insertId, div_nom, dir_ide }
  }

  static async update (id, { div_nom, dir_ide }) {
    const [result] = await pool.query(
      'UPDATE tesdiv SET div_nom = ?, dir_ide = ? WHERE div_ide = ?',
      [div_nom, dir_ide, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tesdiv WHERE div_ide = ?', [id])
    return result.affectedRows > 0
  }
}