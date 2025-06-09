import pool from '../utils/database.js'

class BienModel {
  static async getAllForExcel () {
    const [rows] = await pool.query('SELECT * FROM vw_bienes_muebles')
    return rows
  }
}

export default BienModel
