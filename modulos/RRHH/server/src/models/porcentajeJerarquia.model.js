/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class PorcentajeJerarquiaModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM porcentajes_jerarquias ORDER BY porcentaje DESC')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM porcentajes_jerarquias WHERE jerarquia_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ cargo, porcentaje }) {
    const [result] = await pool.query(
      'INSERT INTO porcentajes_jerarquias (cargo, porcentaje) VALUES (?, ?)',
      [cargo, porcentaje]
    )
    return { jerarquia_id: result.insertId, cargo, porcentaje }
  }

  static async update (id, { cargo, porcentaje }) {
    const [result] = await pool.query(
      'UPDATE porcentajes_jerarquias SET cargo = ?, porcentaje = ? WHERE jerarquia_id = ?',
      [cargo, porcentaje, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM porcentajes_jerarquias WHERE jerarquia_id = ?', [id])
    return result.affectedRows > 0
  }
}
