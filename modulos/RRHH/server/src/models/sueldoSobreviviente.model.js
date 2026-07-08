/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class SueldoSobrevivienteModel {
  
  // Trae solo un registro (el primero que encuentre, teóricamente el único)
  static async getOne () {
    const [rows] = await pool.query('SELECT * FROM sueldo_sobreviente LIMIT 1')
    return rows[0] || null
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM sueldo_sobreviente WHERE id_sueldo = ?', [id])
    return rows[0] || null
  }

  // Elimina el contenido de la tabla
  static async delete (id) {
    const [result] = await pool.query('DELETE FROM sueldo_sobreviente WHERE id_sueldo = ?', [id]) 
    return result.affectedRows
  }

  static async create ({ sueldo_base }) {
    const [result] = await pool.query(
      'INSERT INTO sueldo_sobreviente (sueldo_base) VALUES (?)',
      [sueldo_base]
    )
    return { id_sueldo: result.insertId, sueldo_base }
  }

  static async update (id, { sueldo_base }) {
    const [result] = await pool.query(
      'UPDATE sueldo_sobreviente SET sueldo_base = ? WHERE id_sueldo = ?',
      [sueldo_base, id]
    )
    return result.affectedRows > 0
  }
}
