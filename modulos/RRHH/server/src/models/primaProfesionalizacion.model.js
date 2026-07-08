/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class PrimaProfesionalizacionModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM primas_profesionalizacion')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM primas_profesionalizacion WHERE prima_profesional_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ descripcion, porcentaje_actual, porcentaje_anterior }) {
    // Si porcentaje_anterior no viene, insertamos NULL
    const valorAntiguo = porcentaje_anterior !== undefined ? porcentaje_anterior : null

    const [result] = await pool.query(
      'INSERT INTO primas_profesionalizacion (descripcion, porcentaje_actual, porcentaje_anterior) VALUES (?, ?, ?)',
      [descripcion, porcentaje_actual, valorAntiguo]
    )
    return { prima_profesional_id: result.insertId, descripcion, porcentaje_actual, porcentaje_anterior: valorAntiguo }
  }

  static async update (id, { descripcion, porcentaje_actual, porcentaje_anterior }) {
    const valorAntiguo = porcentaje_anterior !== undefined ? porcentaje_anterior : null

    const [result] = await pool.query(
      'UPDATE primas_profesionalizacion SET descripcion = ?, porcentaje_actual = ?, porcentaje_anterior = ? WHERE prima_profesional_id = ?',
      [descripcion, porcentaje_actual, valorAntiguo, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM primas_profesionalizacion WHERE prima_profesional_id = ?', [id])
    return result.affectedRows > 0
  }
}