/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class InstitucionModel {
  /**
   * Busca coincidencias de instituciones por nombre o siglas, limitando a 10 resultados.
   * @param {string} search - Término de búsqueda.
   * @returns {Promise<object[]>} Resultados de la búsqueda.
   */
  static async search (search) {
    const queryTerm = `%${search}%`
    const sql = `
      SELECT id_institucion, nombre, siglas 
      FROM catalogo_instituciones 
      WHERE nombre LIKE ? OR siglas LIKE ?
      LIMIT 10
    `
    const [rows] = await pool.query(sql, [queryTerm, queryTerm])
    return rows
  }

  static async getAll () {
    const [rows] = await pool.query('SELECT id_institucion, nombre, siglas FROM catalogo_instituciones')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT id_institucion, nombre, siglas FROM catalogo_instituciones WHERE id_institucion = ?', [id])
    return rows[0] || null
  }

  static async create ({ nombre, siglas }) {
    const [result] = await pool.query(
      'INSERT INTO catalogo_instituciones (nombre, siglas) VALUES (?, ?)',
      [nombre, siglas]
    )
    return { id_institucion: result.insertId, nombre, siglas }
  }

  static async update (id, { nombre, siglas }) {
    const [result] = await pool.query(
      'UPDATE catalogo_instituciones SET nombre = ?, siglas = ? WHERE id_institucion = ?',
      [nombre, siglas, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM catalogo_instituciones WHERE id_institucion = ?', [id])
    return result.affectedRows > 0
  }
}
