/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class AntiguedadRegistroModel {
  
  static async getByFuncionarioId (fun_ide) {
    // TIMESTAMPDIFF(YEAR, inicio, fin) calcula años completos.
    // Si ant_ffen es NULL, usa CURDATE() (Fecha actual).
    const sql = `
      SELECT *, 
    TIMESTAMPDIFF(YEAR, ant_fin, COALESCE(ant_ffen, CURDATE())) AS anios,
    TIMESTAMPDIFF(MONTH, ant_fin, COALESCE(ant_ffen, CURDATE())) % 12 AS meses,
    DATEDIFF(
        COALESCE(ant_ffen, CURDATE()), 
        ant_fin + INTERVAL TIMESTAMPDIFF(MONTH, ant_fin, COALESCE(ant_ffen, CURDATE())) MONTH
    ) AS dias
FROM tesant;
    `
    const [rows] = await pool.query(sql, [fun_ide])
    return rows
  }

  static async getById (id) {
    const sql = `
      SELECT *, TIMESTAMPDIFF(YEAR, ant_fin, COALESCE(ant_ffen, CURDATE())) as anios
      FROM tesant 
      WHERE ant_ide = ?
    `
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  static async create ({ fun_ide, ant_fin, ant_ffen }) {
    // Si ant_ffen es undefined, se guarda como NULL
    const fechaFin = ant_ffen || null
    
    const [result] = await pool.query(
      'INSERT INTO tesant (fun_ide, ant_fin, ant_ffen) VALUES (?, ?, ?)',
      [fun_ide, ant_fin, fechaFin]
    )
    return { ant_ide: result.insertId, fun_ide, ant_fin, ant_ffen: fechaFin }
  }

  static async update (id, data) {
    const [result] = await pool.query('UPDATE tesant SET ? WHERE ant_ide = ?', [data, id])
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tesant WHERE ant_ide = ?', [id])
    return result.affectedRows > 0
  }
}