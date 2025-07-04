/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class ConceptoMovimientoModel {
  static async getAll () {
    const [rows] = await pool.query(`
      SELECT com_ide, com_com 
      FROM tmacom 
      ORDER BY CAST(com_ide AS UNSIGNED)
    `)
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`
      SELECT com_ide, com_com 
      FROM tmacom 
      WHERE com_ide = ?`, [id]
    )
    return rows[0]
  }

  static async create ({ com_ide, com_com }) {
    const [result] = await pool.query(
      'INSERT INTO tmacom (com_ide, com_com) VALUES (?, ?)',
      [com_ide, com_com]
    )
    return { com_ide: result.insertId, com_com }
  }

  static async update (id, { com_com }) {
    const [result] = await pool.query(
      'UPDATE tmacom SET com_com = ? WHERE com_ide = ?',
      [com_com, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tmacom WHERE com_ide = ?', [id])
    return result.affectedRows > 0
  }
}
