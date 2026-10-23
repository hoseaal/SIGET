import pool from '../utils/database.js'
import bcrypt from 'bcrypt'

const SELECT_BASE = `
  SELECT u.id, u.username, u.nombres, u.apellidos, u.cedula, u.email,
         u.rol, u.departamento_id, u.activo, u.created_at,
         d.nombre AS departamento_nombre
  FROM usuarios u
  LEFT JOIN departamentos d ON u.departamento_id = d.id
`

export class UsuarioModel {
  static async findByUsername (username) {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE username = ?',
      [username]
    )
    return rows[0] || null
  }

  static async getAll () {
    const [rows] = await pool.query(`${SELECT_BASE} ORDER BY u.nombres, u.apellidos`)
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`${SELECT_BASE} WHERE u.id = ?`, [id])
    return rows[0] || null
  }

  static async create ({ username, password, nombres, apellidos, cedula, email, rol, departamento_id }) {
    const hash = await bcrypt.hash(password, 12)
    const [result] = await pool.query(
      `INSERT INTO usuarios
        (username, password_hash, nombres, apellidos, cedula, email, rol, departamento_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, hash, nombres, apellidos, cedula || null, email || null, rol, departamento_id || null]
    )
    return this.getById(result.insertId)
  }

  static async update (id, { username, nombres, apellidos, cedula, email, rol, departamento_id, activo }) {
    const [result] = await pool.query(
      `UPDATE usuarios SET
        username = ?, nombres = ?, apellidos = ?, cedula = ?, email = ?,
        rol = ?, departamento_id = ?, activo = ?
       WHERE id = ?`,
      [username, nombres, apellidos, cedula || null, email || null, rol, departamento_id || null, activo ? 1 : 0, id]
    )
    return result.affectedRows > 0
  }

  static async updatePassword (id, password) {
    const hash = await bcrypt.hash(password, 12)
    const [result] = await pool.query(
      'UPDATE usuarios SET password_hash = ? WHERE id = ?',
      [hash, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id])
    return result.affectedRows > 0
  }
}
