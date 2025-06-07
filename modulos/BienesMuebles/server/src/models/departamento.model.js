import pool from '../utils/database.js'

export class DepartamentoModel {
  static async getAll () {
    const [rows] = await pool.query(`
      SELECT dep_ide, dep_nom 
      FROM tesdep 
      ORDER BY CAST(dep_ide AS UNSIGNED)
    `)
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`
      SELECT dep_ide, dep_nom 
      FROM tesdep 
      WHERE dep_ide = ?`, [id]
    )
    return rows[0]
  }
}
