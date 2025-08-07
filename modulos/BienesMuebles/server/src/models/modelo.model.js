/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class ModeloModel {
  static async getAll () {
    const [rows] = await pool.query(`
      SELECT m.mod_ide, m.mod_mod, m.mar_ide, ma.mar_mar 
      FROM tesmod m
      JOIN tmamar ma ON m.mar_ide = ma.mar_ide
    `)
    return rows
  }

  static async getAllAlphabetically () {
    const [rows] = await pool.query(`
      SELECT m.mod_ide, m.mod_mod, m.mar_ide, ma.mar_mar 
      FROM tesmod m
      JOIN tmamar ma ON m.mar_ide = ma.mar_ide
      ORDER BY m.mod_mod
    `)
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`
      SELECT m.mod_ide, m.mod_mod, m.mar_ide, ma.mar_mar
      FROM tesmod m
      JOIN tmamar ma ON m.mar_ide = ma.mar_ide
      WHERE m.mod_ide = ?
    `, [id])
    return rows[0] || null
  }

  static async getByMarca (marId) {
    const [rows] = await pool.query(
      'SELECT mod_ide, mod_mod FROM tesmod WHERE mar_ide = ? ORDER BY mod_mod',
      [marId]
    )
    return rows
  }

  static async create ({ mod_ide, mod_mod, mar_ide }) {
    const [result] = await pool.query(
      'INSERT INTO tesmod (mod_ide, mod_mod, mar_ide) VALUES (?, ?, ?)',
      [mod_ide, mod_mod, mar_ide]
    )
    return { mod_ide: result.insertId, mod_mod, mar_ide }
  }

  static async update (id, { mod_mod, mar_ide }) {
    const [result] = await pool.query(
      'UPDATE tesmod SET mod_mod = ?, mar_ide = ? WHERE mod_ide = ?',
      [mod_mod, mar_ide, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query(
      'DELETE FROM tesmod WHERE mod_ide = ?',
      [id]
    )
    return result.affectedRows > 0
  }
}
