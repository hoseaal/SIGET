/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class HijoModel {
  
  static async getByFuncionarioId (fun_ide) {
    // Calculamos la edad al vuelo
    const sql = `
      SELECT *, TIMESTAMPDIFF(YEAR, hij_fna, CURDATE()) as edad
      FROM teshij
      WHERE fun_ide = ?
      ORDER BY hij_fna ASC
    `
    const [rows] = await pool.query(sql, [fun_ide])
    return rows
  }

  static async getById (id) {
    const sql = `
      SELECT *, TIMESTAMPDIFF(YEAR, hij_fna, CURDATE()) as edad
      FROM teshij 
      WHERE hij_ide = ?
    `
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  static async create ({ fun_ide, hij_nom, hij_ape, hij_fna }) {
    const [result] = await pool.query(
      'INSERT INTO teshij (fun_ide, hij_nom, hij_ape, hij_fna) VALUES (?, ?, ?, ?)',
      [fun_ide, hij_nom, hij_ape, hij_fna]
    )
    return { hij_ide: result.insertId, fun_ide, hij_nom, hij_ape, hij_fna }
  }

  static async update (id, data) {
    const [result] = await pool.query('UPDATE teshij SET ? WHERE hij_ide = ?', [data, id])
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM teshij WHERE hij_ide = ?', [id])
    return result.affectedRows > 0
  }
}