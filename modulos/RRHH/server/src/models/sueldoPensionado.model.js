/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class SueldoPensionadoModel {
  
  // Trae solo un registro (el primero que encuentre, teóricamente el único)
  static async getOne () {
    const [rows] = await pool.query('SELECT * FROM tmasup LIMIT 1')
    return rows[0] || null
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tmasup WHERE sup_ide = ?', [id])
    return rows[0] || null
  }

  // Elimina TODO el contenido de la tabla
  static async deleteAll () {
    // Usamos TRUNCATE para resetear el ID autoincrementable también, o DELETE
    const [result] = await pool.query('DELETE FROM tmasup') 
    return result.affectedRows
  }

  static async create ({ sup_sal }) {
    const [result] = await pool.query(
      'INSERT INTO tmasup (sup_sal) VALUES (?)',
      [sup_sal]
    )
    return { sup_ide: result.insertId, sup_sal }
  }

  static async update (id, { sup_sal }) {
    const [result] = await pool.query(
      'UPDATE tmasup SET sup_sal = ? WHERE sup_ide = ?',
      [sup_sal, id]
    )
    return result.affectedRows > 0
  }
}