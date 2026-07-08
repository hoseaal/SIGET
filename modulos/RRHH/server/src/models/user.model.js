/* eslint-disable camelcase */
import pool from '../utils/database.js'
import bcrypt from 'bcrypt'


export class UserModel {
  static async findByUsername (username) {
    const [users] = await pool.query(
      `SELECT u.*, ue.empleado_id, r.nombre_rol 
       FROM usuarios u 
       LEFT JOIN usuarios_empleados ue ON u.usuario_id = ue.usuario_id 
       LEFT JOIN roles_sistema r ON u.rol_id = r.rol_id
       WHERE u.username = ?`,
      [username]
    )
    return users[0] || null
  }

  static async create ({ ced, password1, username, nombre, ape, rol_id, modulo_id, empleado_id }) {
    const salt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync(password1, salt.replace(/^\$2a\$/, '$2y$'))

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO usuarios 
         (username, password_hash, nombres, apellidos, rol_id, modulo_id, cedula_referencia) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [username, hash, nombre, ape, rol_id, modulo_id, ced]
      )

      const nuevoUsuarioId = result.insertId;

      if (empleado_id) {
        await connection.query(
          `INSERT INTO usuarios_empleados (usuario_id, empleado_id) VALUES (?, ?)`,
          [nuevoUsuarioId, empleado_id]
        );
      }

      await connection.commit();

      return {
        nombres: nombre,
        apellidos: ape,
        rol_id,
        usuario_id: nuevoUsuarioId
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtiene todos los usuarios de la base de datos sin incluir la contraseña.
   */
  static async getAll () {
    const [users] = await pool.query(
      'SELECT usuario_id, username, nombres, apellidos, rol_id, modulo_id, cedula_referencia FROM usuarios'
    )
    return users
  }

  /**
   * Obtiene un usuario por su ID sin incluir la contraseña.
   */
  static async getById (id) {
    const [user] = await pool.query(
      'SELECT usuario_id, username, nombres, apellidos, rol_id, modulo_id, cedula_referencia FROM usuarios WHERE usuario_id = ?',
      [id]
    )
    return user[0] || null
  }

  /**
   * Actualiza los datos de un usuario (excepto la contraseña).
   */
  static async update (id, { username, nombres, apellidos, rol_id, modulo_id, cedula_referencia }) {
    const [result] = await pool.query(
      `UPDATE usuarios SET 
        username = ?,
        nombres = ?, 
        apellidos = ?, 
        rol_id = ?, 
        modulo_id = ?, 
        cedula_referencia = ? 
      WHERE usuario_id = ?`,
      [username, nombres, apellidos, rol_id, modulo_id, cedula_referencia, id]
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
}
