/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class PermisoModel {

  static _baseQuery () {
    return `
      SELECT p.*, 
             -- Cálculo automático de días de duración
             DATEDIFF(COALESCE(p.per_ffe, p.per_fin), p.per_fin) + 1 as dias_duracion
      FROM tesperm p
    `
  }

  static async getByFuncionarioId (fun_ide, estado) {
    let sql = `${this._baseQuery()} WHERE p.fun_ide = ?`
    const params = [fun_ide]

    // Si envían estado (0 o 1), filtramos también por eso
    if (estado !== undefined) {
      sql += ' AND p.per_apr = ?'
      params.push(estado)
    }

    sql += ' ORDER BY p.per_fsol DESC' // Lo más reciente primero

    const [rows] = await pool.query(sql, params)
    return rows
  }

  static async getById (id) {
    // Aquí sí hacemos JOIN para ver el nombre del funcionario en el detalle individual si se requiere
    const sql = `
      SELECT p.*, f.fun_nom, f.fun_ape, f.fun_ced,
             DATEDIFF(COALESCE(p.per_ffe, p.per_fin), p.per_fin) + 1 as dias_duracion
      FROM tesperm p
      JOIN tmafun f ON p.fun_ide = f.fun_ide
      WHERE p.per_ide = ?
    `
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  static async create (data) {
    const { fun_ide, per_mot, per_jus, per_fsol, per_fin, per_ffe, per_apr } = data
    const aprobado = per_apr !== undefined ? per_apr : 0

    const [result] = await pool.query(
      'INSERT INTO tesperm (fun_ide, per_mot, per_jus, per_fsol, per_fin, per_ffe, per_apr) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [fun_ide, per_mot, per_jus || 0, per_fsol, per_fin, per_ffe || null, aprobado]
    )
    return { per_ide: result.insertId, ...data }
  }

  static async update (id, data) {
    const [result] = await pool.query('UPDATE tesperm SET ? WHERE per_ide = ?', [data, id])
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tesperm WHERE per_ide = ?', [id])
    return result.affectedRows > 0
  }
}