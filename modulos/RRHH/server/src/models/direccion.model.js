/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class DireccionModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM direcciones')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM direcciones WHERE direccion_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ nombre }) {
    // No insertamos direccion_id porque es AUTO_INCREMENT
    const [result] = await pool.query(
      'INSERT INTO direcciones (nombre) VALUES (?)',
      [nombre]
    )
    // Devolvemos el ID generado y el nombre
    return { direccion_id: result.insertId, nombre }
  }

  static async update (id, { nombre }) {
    const [result] = await pool.query(
      'UPDATE direcciones SET nombre = ? WHERE direccion_id = ?',
      [nombre, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM direcciones WHERE direccion_id = ?', [id])
    return result.affectedRows > 0
  }
}