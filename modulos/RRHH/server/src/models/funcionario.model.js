/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class FuncionarioModel {

  // Construye la cláusula WHERE dinámicamente
  static _buildWhere (filters) {
    const where = []
    const params = []

    if (filters.search) {
      where.push('(fun_nom LIKE ? OR fun_ape LIKE ? OR fun_ced LIKE ?)')
      const like = `%${filters.search}%`
      params.push(like, like, like)
    }

    if (filters.pro_ide) {
      where.push('pro_ide = ?')
      params.push(filters.pro_ide)
    }

    if (filters.est_ide) {
      where.push('est_ide = ?')
      params.push(filters.est_ide)
    }

    if (filters.fun_gen) {
      where.push('fun_gen = ?')
      params.push(filters.fun_gen)
    }

    // Filtro de edad calculado
    if (filters.edad_min) {
      where.push('TIMESTAMPDIFF(YEAR, fun_fna, CURDATE()) >= ?')
      params.push(filters.edad_min)
    }

    if (filters.edad_max) {
      where.push('TIMESTAMPDIFF(YEAR, fun_fna, CURDATE()) <= ?')
      params.push(filters.edad_max)
    }

    return {
      whereClause: where.length > 0 ? 'WHERE ' + where.join(' AND ') : '',
      params
    }
  }

  static async getFiltered ({ limit, offset, ...filters }) {
    const { whereClause, params } = this._buildWhere(filters)
    
    // Calculamos la edad al vuelo para mostrarla en el front si se desea
    let sql = `
      SELECT *, TIMESTAMPDIFF(YEAR, fun_fna, CURDATE()) as edad 
      FROM tmafun 
      ${whereClause} 
      ORDER BY fun_ape ASC, fun_nom ASC
    `

    if (limit !== null && limit !== undefined) {
      sql += ' LIMIT ? OFFSET ?'
      params.push(limit, offset)
    }

    const [rows] = await pool.query(sql, params)
    return rows
  }

  // Cuenta el total de resultados para la paginación
  static async countFiltered (filters) {
    const { whereClause, params } = this._buildWhere(filters)
    const sql = `SELECT COUNT(*) as total FROM tmafun ${whereClause}`
    const [rows] = await pool.query(sql, params)
    return rows[0].total
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT *, TIMESTAMPDIFF(YEAR, fun_fna, CURDATE()) as edad FROM tmafun WHERE fun_ide = ?', [id])
    return rows[0] || null
  }

  static async create (data) {
    // Desestructuramos para asegurar el orden y solo los campos permitidos
    const {
      fun_ced, fun_nom, fun_ape, fun_rif, fun_fna, fun_lna, fun_gen, fun_est,
      fun_san, fun_dep, fun_cul, fun_dir, fun_tel, fun_cel, fun_ema1, fun_ema2,
      fun_fing, fun_estu, fun_fcul, fun_emer1, fun_emer2, fun_teme1, fun_teme2,
      pro_ide, est_ide
    } = data

    const sql = `
      INSERT INTO tmafun (
        fun_ced, fun_nom, fun_ape, fun_rif, fun_fna, fun_lna, fun_gen, fun_est,
        fun_san, fun_dep, fun_cul, fun_dir, fun_tel, fun_cel, fun_ema1, fun_ema2,
        fun_fing, fun_estu, fun_fcul, fun_emer1, fun_emer2, fun_teme1, fun_teme2,
        pro_ide, est_ide
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `
    
    const params = [
      fun_ced, fun_nom, fun_ape, fun_rif, fun_fna, fun_lna, fun_gen, fun_est,
      fun_san, fun_dep, fun_cul, fun_dir, fun_tel, fun_cel, fun_ema1, fun_ema2,
      fun_fing, fun_estu, fun_fcul, fun_emer1, fun_emer2, fun_teme1, fun_teme2,
      pro_ide, est_ide
    ]

    const [result] = await pool.query(sql, params)
    return { fun_ide: result.insertId, ...data }
  }

  static async update (id, data) {
    // En update es mejor usar la sintaxis SET ? de mysql con un objeto
    // Pero para ser estrictos con tu tabla, podemos hacerlo dinámico o manual.
    // Haremos un update genérico con keys del objeto
    const [result] = await pool.query('UPDATE tmafun SET ? WHERE fun_ide = ?', [data, id])
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tmafun WHERE fun_ide = ?', [id])
    return result.affectedRows > 0
  }
}