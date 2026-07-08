/* eslint-disable camelcase */
import pool from '../utils/database.js'
import bcrypt from 'bcrypt'


export class UserModel {
  static async findByUsername (username) {
    const [users] = await pool.query(
      'SELECT * FROM usuarios WHERE username = ?',
      [username]
    )
    return users[0] || null
  }

  static async create ({ ced, password1, username, nombre, ape, rol_id, direc_id }) {
    const salt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync(password1, salt.replace(/^\$2a\$/, '$2y$'))

    // eslint-disable-next-line no-unused-vars
    const [result] = await pool.query(
      `INSERT INTO usuarios 
       (username, password_hash, nombres, apellidos, rol_id, cedula_referencia, direc_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, hash, nombre, ape, rol_id, ced, direc_id]
    )

    return {
      nombres: nombre,
      apellidos: ape,
      rol_id,
      direc_id
    }
  }

  /**
   * Obtiene todos los usuarios de la base de datos sin incluir la contraseña.
   */
  static async getAll () {
    const [users] = await pool.query(
      'SELECT usuario_id, username, nombres, apellidos, rol_id, cedula_referencia, direc_id FROM usuarios'
    )
    return users
  }

  /**
   * Obtiene un usuario por su ID sin incluir la contraseña.
   */
  static async getById (id) {
    const [user] = await pool.query(
      'SELECT usuario_id, username, nombres, apellidos, rol_id, cedula_referencia, direc_id FROM usuarios WHERE usuario_id = ?',
      [id]
    )
    return user[0] || null
  }

  /**
   * Actualiza los datos de un usuario (excepto la contraseña).
   */
  static async update (id, { username, nombres, apellidos, rol_id, direc_id, cedula_referencia }) {
    const [result] = await pool.query(
      `UPDATE usuarios SET 
        username = ?,
        nombres = ?, 
        apellidos = ?, 
        rol_id = ?, 
        direc_id = ?,
        cedula_referencia = ? 
      WHERE usuario_id = ?`,
      [username, nombres, apellidos, rol_id, direc_id, cedula_referencia, id]
    )
    return result.affectedRows > 0
  }

  /**
   * Actualiza únicamente la contraseña de un usuario.
   */
  static async updatePassword (id, password) {
    const salt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync(password, salt.replace(/^\$2a\$/, '$2y$'))

    const [result] = await pool.query(
      'UPDATE usuarios SET password_hash = ? WHERE usuario_id = ?',
      [hash, id]
    )
    return result.affectedRows > 0
  }

  /**
   * Elimina un usuario de la base de datos.
   */
  static async delete (id) {
    const [result] = await pool.query(
      'DELETE FROM usuarios WHERE usuario_id = ?',
      [id]
    )
    return result.affectedRows > 0
  }

  /**
   * Obtiene todos los roles del sistema.
   */
  static async getAllRoles () {
    const [roles] = await pool.query('SELECT rol_id, nombre_rol FROM roles_sistema')
    return roles
  }
}
