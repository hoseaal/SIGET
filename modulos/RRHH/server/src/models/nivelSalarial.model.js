/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class NivelSalarialModel {
  static async getAll (cargo_onapre_id = null) {
    if (cargo_onapre_id) {
      const [rows] = await pool.query('SELECT * FROM niveles_salariales WHERE cargo_onapre_id = ?', [cargo_onapre_id])
      return rows
    }
    const [rows] = await pool.query('SELECT * FROM niveles_salariales')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM niveles_salariales WHERE nivel_salarial_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ niv_nom, salario_base, cargo_onapre_id }) {
    const [result] = await pool.query(
      'INSERT INTO niveles_salariales (niv_nom, salario_base, cargo_onapre_id) VALUES (?, ?, ?)',
      [niv_nom, salario_base, cargo_onapre_id]
    )
    return { nivel_salarial_id: result.insertId, niv_nom, salario_base, cargo_onapre_id }
  }

  static async update (id, { niv_nom, salario_base, cargo_onapre_id }) {
    const [result] = await pool.query(
      'UPDATE niveles_salariales SET niv_nom = ?, salario_base = ?, cargo_onapre_id = ? WHERE nivel_salarial_id = ?',
      [niv_nom, salario_base, cargo_onapre_id, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM niveles_salariales WHERE nivel_salarial_id = ?', [id])
    return result.affectedRows > 0
  }
}