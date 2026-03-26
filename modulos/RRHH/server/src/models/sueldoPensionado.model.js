/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class SueldoPensionadoModel {
  
  // Trae solo un registro (el primero que encuentre, teóricamente el único)
  static async getOne () {
    const [rows] = await pool.query('SELECT * FROM sueldos_pensionados LIMIT 1')
    return rows[0] || null
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM sueldos_pensionados WHERE sueldo_pensionado_id = ?', [id])
    return rows[0] || null
  }

  // Elimina TODO el contenido de la tabla
  static async deleteAll () {
    // Usamos TRUNCATE para resetear el ID autoincrementable también, o DELETE
    const [result] = await pool.query('DELETE FROM sueldos_pensionados') 
    return result.affectedRows
  }

  static async create ({ salario_base }) {
    const [result] = await pool.query(
      'INSERT INTO sueldos_pensionados (salario_base) VALUES (?)',
      [salario_base]
    )
    return { sueldo_pensionado_id: result.insertId, salario_base }
  }

  static async update (id, { salario_base }) {
    const [result] = await pool.query(
      'UPDATE sueldos_pensionados SET salario_base = ? WHERE sueldo_pensionado_id = ?',
      [salario_base, id]
    )
    return result.affectedRows > 0
  }
}