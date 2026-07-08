/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class CategoriaEspecificaModel {
  static async getAll () {
    const [rows] = await pool.query(`
      SELECT ce.cae_ide, ce.cae_cae, ce.sca_ide, s.sca_sca, c.cat_cat
      FROM tescae ce
      JOIN tessca s ON ce.sca_ide = s.sca_ide
      JOIN tmacat c ON s.cat_ide = c.cat_ide
      ORDER BY ce.cae_ide ASC
    `)
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`
      SELECT ce.cae_ide, ce.cae_cae, ce.sca_ide, s.sca_sca 
      FROM tescae ce
      JOIN tessca s ON ce.sca_ide = s.sca_ide
      WHERE ce.cae_ide = ?
      ORDER BY ce.cae_ide ASC
    `, [id])
    return rows[0] || null
  }

  static async getBySubcategoria (scaId) {
    const [rows] = await pool.query(
      'SELECT cae_ide, cae_cae FROM tescae WHERE sca_ide = ? ORDER BY cae_ide ASC',
      [scaId]
    )
    return rows
  }

  static async create ({ cae_ide, cae_cae, sca_ide }) {
    const [result] = await pool.query(
      'INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (?, ?, ?)',
      [cae_ide, cae_cae, sca_ide]
    )
    return { cae_ide: result.insertId, cae_cae, sca_ide }
  }

  static async update (id, { cae_cae, sca_ide }) {
    const [result] = await pool.query(
      'UPDATE tescae SET cae_cae = ?, sca_ide = ? WHERE cae_ide = ?',
      [cae_cae, sca_ide, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query(
      'DELETE FROM tescae WHERE cae_ide = ?',
      [id]
    )
    return result.affectedRows > 0
  }

  static async getAllPaginated ({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit
    // Consulta para los datos paginados
    const [rows] = await pool.query(`
      SELECT ce.*, s.sca_sca as subcategoria 
      FROM tescae ce
      JOIN tessca s ON ce.sca_ide = s.sca_ide
      ORDER BY ce.cae_ide ASC
      LIMIT ? OFFSET ?
    `, [limit, offset])

    // Consulta para el total de registros
    const [totalRows] = await pool.query(`
      SELECT COUNT(*) as total FROM tescae
    `)

    return {
      data: rows,
      total: totalRows[0].total
    }
  }

  static async searchByNombre (searchTerm, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit
    const [rows] = await pool.query(`
      SELECT ce.*, s.sca_sca as subcategoria 
      FROM tescae ce
      JOIN tessca s ON ce.sca_ide = s.sca_ide
      WHERE ce.cae_cae LIKE ? 
      ORDER BY ce.cae_ide ASC
      LIMIT ? OFFSET ?
    `, [`%${searchTerm}%`, limit, offset])

    const [totalRows] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM tescae ce
      WHERE ce.cae_cae LIKE ?
    `, [`%${searchTerm}%`])

    return {
      data: rows,
      total: totalRows[0].total
    }
  }
}
