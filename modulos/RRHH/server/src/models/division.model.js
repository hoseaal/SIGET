/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class DivisionModel {
  static async getAll () {
    // Opcional: Podrías hacer un JOIN con direcciones para traer el nombre de la dirección
    // pero para mantener el CRUD puro de la tabla, traemos los campos directos.
    const [rows] = await pool.query('SELECT * FROM divisiones')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM divisiones WHERE division_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ nombre, direccion_id }) {
    const [result] = await pool.query(
      'INSERT INTO divisiones (nombre, direccion_id) VALUES (?, ?)',
      [nombre, direccion_id]
    )
    return { division_id: result.insertId, nombre, direccion_id }
  }

  static async update (id, { nombre, direccion_id }) {
    const [result] = await pool.query(
      'UPDATE divisiones SET nombre = ?, direccion_id = ? WHERE division_id = ?',
      [nombre, direccion_id, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM divisiones WHERE division_id = ?', [id])
    return result.affectedRows > 0
  }
}