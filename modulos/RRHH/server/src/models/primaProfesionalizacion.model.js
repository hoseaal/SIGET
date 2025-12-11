/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class PrimaProfesionalizacionModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tmaprf')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tmaprf WHERE prf_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ prf_nom, prf_act, prf_ant }) {
    // Si prf_ant no viene, insertamos NULL
    const valorAntiguo = prf_ant !== undefined ? prf_ant : null

    const [result] = await pool.query(
      'INSERT INTO tmaprf (prf_nom, prf_act, prf_ant) VALUES (?, ?, ?)',
      [prf_nom, prf_act, valorAntiguo]
    )
    return { prf_ide: result.insertId, prf_nom, prf_act, prf_ant: valorAntiguo }
  }

  static async update (id, { prf_nom, prf_act, prf_ant }) {
    const valorAntiguo = prf_ant !== undefined ? prf_ant : null

    const [result] = await pool.query(
      'UPDATE tmaprf SET prf_nom = ?, prf_act = ?, prf_ant = ? WHERE prf_ide = ?',
      [prf_nom, prf_act, valorAntiguo, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tmaprf WHERE prf_ide = ?', [id])
    return result.affectedRows > 0
  }
}