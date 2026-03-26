/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class HistorialSalarioModel {

  static _buildWhere (filters) {
    const where = ['empleado_id = ?'] // Siempre filtramos por funcionario
    const params = [filters.empleado_id]

    if (filters.fecha_inicio) {
      where.push('fecha_pago >= ?')
      params.push(filters.fecha_inicio)
    }

    if (filters.fecha_fin) {
      where.push('fecha_pago <= ?')
      params.push(filters.fecha_fin)
    }

    return {
      whereClause: 'WHERE ' + where.join(' AND '),
      params
    }
  }

  static async getFiltered ({ limit, offset, ...filters }) {
    const { whereClause, params } = this._buildWhere(filters)

    let sql = `SELECT * FROM historial_salarios ${whereClause} ORDER BY fecha_pago DESC`

    if (limit !== null) {
      sql += ' LIMIT ? OFFSET ?'
      params.push(limit, offset)
    }

    const [rows] = await pool.query(sql, params)
    return rows
  }

  static async countFiltered (filters) {
    const { whereClause, params } = this._buildWhere(filters)
    const sql = `SELECT COUNT(*) as total FROM historial_salarios ${whereClause}`
    const [rows] = await pool.query(sql, params)
    return rows[0].total
  }

  // CRUD Basico
  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM historial_salarios WHERE historial_salario_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ empleado_id, fecha_pago, monto_neto, monto_bruto }) {
    const [result] = await pool.query(
      'INSERT INTO historial_salarios (empleado_id, fecha_pago, monto_neto, monto_bruto) VALUES (?, ?, ?, ?)',
      [empleado_id, fecha_pago, monto_neto, monto_bruto]
    )
    return { historial_salario_id: result.insertId, empleado_id, fecha_pago, monto_neto, monto_bruto }
  }

  static async update (id, data) {
    const [result] = await pool.query('UPDATE historial_salarios SET ? WHERE historial_salario_id = ?', [data, id])
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM historial_salarios WHERE historial_salario_id = ?', [id])
    return result.affectedRows > 0
  }
}

