/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class CargoCetModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tmacet')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tmacet WHERE cet_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ cet_nom }) {
    const [result] = await pool.query(
      'INSERT INTO tmacet (cet_nom) VALUES (?)',
      [cet_nom]
    )
    return { cet_ide: result.insertId, cet_nom }
  }

  static async update (id, { cet_nom }) {
    const [result] = await pool.query(
      'UPDATE tmacet SET cet_nom = ? WHERE cet_ide = ?',
      [cet_nom, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tmacet WHERE cet_ide = ?', [id])
    return result.affectedRows > 0
  }
}