import pool from '../utils/database.js'

export class FormaAdquisicionModel {
  static async getAll () {
    const [rows] = await pool.query(`
      SELECT foa_ide, foa_nom 
      FROM tmafoa 
      ORDER BY CAST(foa_ide AS UNSIGNED)
    `)
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`
      SELECT foa_ide, foa_nom 
      FROM tmafoa 
      WHERE foa_ide = ?`, [id]
    )
    return rows[0]
  }
}
