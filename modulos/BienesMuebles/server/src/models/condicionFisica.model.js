import pool from '../utils/database.js'

export class CondicionFisicaModel {
  static async getAll () {
    const [rows] = await pool.query(`
      SELECT con_ide, con_con 
      FROM tmacon 
      ORDER BY CAST(con_ide AS UNSIGNED)
    `)
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`
      SELECT con_ide, con_con 
      FROM tmacon 
      WHERE con_ide = ?`, [id]
    )
    return rows[0]
  }
}
