import pool from '../utils/database.js'

class BienModel {
  static async getAllForExcel () {
    const [rows] = await pool.query('SELECT * FROM vw_bienes_muebles')
    return rows
  }

  static async getBM1ForExcel () {
    const [rows] = await pool.query('SELECT * FROM vw_bienes_muebles_bm1')
    return rows
  }

  static async getBM3ForExcel () {
    const [rows] = await pool.query('SELECT * FROM vw_bienes_muebles_bm3')
    return rows
  }
}

export default BienModel
