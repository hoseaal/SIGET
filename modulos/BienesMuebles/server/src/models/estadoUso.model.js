import pool from '../utils/database.js'

export class EstadoUsoModel {
  static async getAll () {
    const [rows] = await pool.query(`
      SELECT esu_ide, esu_esu 
      FROM tmaesu 
      ORDER BY CAST(esu_ide AS UNSIGNED)
    `)
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`
      SELECT esu_ide, esu_esu 
      FROM tmaesu 
      WHERE esu_ide = ?`, [id]
    )
    return rows[0]
  }
}
