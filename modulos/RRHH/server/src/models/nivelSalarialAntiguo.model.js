/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class NivelSalarialAntiguoModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM tesnivant')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM tesnivant WHERE nivant_ide = ?', [id])
    return rows[0] || null
  }

  static async create ({ nivant_nom, nivant_sal, ona_ide }) {
    const [result] = await pool.query(
      'INSERT INTO tesnivant (nivant_nom, nivant_sal, ona_ide) VALUES (?, ?, ?)',
      [nivant_nom, nivant_sal, ona_ide]
    )
    return { nivant_ide: result.insertId, nivant_nom, nivant_sal, ona_ide }
  }

  static async update (id, { nivant_nom, nivant_sal, ona_ide }) {
    const [result] = await pool.query(
      'UPDATE tesnivant SET nivant_nom = ?, nivant_sal = ?, ona_ide = ? WHERE nivant_ide = ?',
      [nivant_nom, nivant_sal, ona_ide, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tesnivant WHERE nivant_ide = ?', [id])
    return result.affectedRows > 0
  }
}