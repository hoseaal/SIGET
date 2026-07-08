/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class CondicionLaboralModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM condiciones_laborales')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM condiciones_laborales WHERE condicion_laboral_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ nombre }) {
    const [result] = await pool.query(
      'INSERT INTO condiciones_laborales (nombre) VALUES (?)',
      [nombre]
    )
    return { condicion_laboral_id: result.insertId, nombre }
  }

  static async update (id, { nombre }) {
    const [result] = await pool.query(
      'UPDATE condiciones_laborales SET nombre = ? WHERE condicion_laboral_id = ?',
      [nombre, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM condiciones_laborales WHERE condicion_laboral_id = ?', [id])
    return result.affectedRows > 0
  }
}