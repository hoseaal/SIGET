import pool from '../utils/database.js'

const SELECT_BASE = `
  SELECT c.id, c.nombre, c.codigo, c.orden, c.activo, c.created_at
  FROM clasificacion c
`

export class ClasificacionModel {
  static async getAll () {
    const [rows] = await pool.query(`${SELECT_BASE} ORDER BY c.orden, c.nombre`)
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`${SELECT_BASE} WHERE c.id = ?`, [id])
    return rows[0] || null
  }

  static async getActivas () {
    const [rows] = await pool.query(`${SELECT_BASE} WHERE c.activo = 1 ORDER BY c.orden, c.nombre`)
    return rows
  }

  static async create ({ nombre, codigo, orden, activo }) {
    const [result] = await pool.query(
      `INSERT INTO clasificacion (nombre, codigo, orden, activo)
       VALUES (?, ?, ?, ?)`,
      [nombre, codigo || null, orden || 0, activo ? 1 : 1]
    )
    return this.getById(result.insertId)
  }

  static async update (id, { nombre, codigo, orden, activo }) {
    const [result] = await pool.query(
      `UPDATE clasificacion SET nombre = ?, codigo = ?, orden = ?, activo = ?
       WHERE id = ?`,
      [nombre, codigo || null, orden || 0, activo ? 1 : 0, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM clasificacion WHERE id = ?', [id])
    return result.affectedRows > 0
  }
}
