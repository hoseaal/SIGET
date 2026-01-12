/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class HistorialSalarioModel {

  static _buildWhere (filters) {
    const where = ['fun_ide = ?'] // Siempre filtramos por funcionario
    const params = [filters.fun_ide]

    if (filters.fecha_inicio) {
      where.push('his_fpa >= ?')
      params.push(filters.fecha_inicio)
    }

    if (filters.fecha_fin) {
      where.push('his_fpa <= ?')
      params.push(filters.fecha_fin)
    }

    return {
      whereClause: 'WHERE ' + where.join(' AND '),
      params
    }
  }

  static async getFiltered ({ limit, offset, ...filters }) {
    const { whereClause, params } = this._buildWhere(filters)

    let sql = `SELECT * FROM teshisal ${whereClause} ORDER BY his_fpa DESC`

    if (limit !== null) {
      sql += ' LIMIT ? OFFSET ?'
      params.push(limit, offset)
    }

    const [rows] = await pool.query(sql, params)
    return rows
  }

  static async countFiltered (filters) {
    const { whereClause, params } = this._buildWhere(filters)
    const sql = `SELECT COUNT(*) as total FROM teshisal ${whereClause}`
    const [rows] = await pool.query(sql, params)
    return rows[0].total
  }

  // CRUD Basico
  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM teshisal WHERE his_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ fun_ide, his_fpa, his_net, his_bru }) {
    const [result] = await pool.query(
      'INSERT INTO teshisal (fun_ide, his_fpa, his_net, his_bru) VALUES (?, ?, ?, ?)',
      [fun_ide, his_fpa, his_net, his_bru]
    )
    return { his_ide: result.insertId, fun_ide, his_fpa, his_net, his_bru }
  }

  static async update (id, data) {
    const [result] = await pool.query('UPDATE teshisal SET ? WHERE his_ide = ?', [data, id])
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM teshisal WHERE his_ide = ?', [id])
    return result.affectedRows > 0
  }
}

