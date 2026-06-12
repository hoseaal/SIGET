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
}
