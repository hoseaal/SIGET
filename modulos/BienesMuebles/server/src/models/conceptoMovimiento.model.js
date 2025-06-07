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
}
