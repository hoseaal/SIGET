/* eslint-disable camelcase */
import pool from '../utils/database.js'
import bcrypt from 'bcrypt'


export class UserModel {
  static async findByUsername (username) {
    const [users] = await pool.query(
      'SELECT * FROM tesusu WHERE usu_usu = ?',
      [username]
    )
    return users[0] || null
  }

  static async create ({ ced, password1, usu_usu, nombre, ape, usu_tip, usu_mod }) {
    const salt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync(password1, salt.replace(/^\$2a\$/, '$2y$'))

    // eslint-disable-next-line no-unused-vars
    const [result] = await pool.query(
      `INSERT INTO tesusu 
       (usu_usu, usu_con, usu_nom, usu_ape, usu_tip, usu_mod, nom_ced) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usu_usu, hash, nombre, ape, usu_tip, usu_mod, ced]
    )

    return {
      usu_nom: nombre,
      usu_ape: ape,
      usu_tip
    }
  }

  /**
   * Obtiene todos los usuarios de la base de datos sin incluir la contraseña.
   */
  static async getAll () {
    const [users] = await pool.query(
      'SELECT usu_ide, usu_usu, usu_nom, usu_ape, usu_tip, usu_mod, nom_ced FROM tesusu'
    )
    return users
  }

  /**
   * Obtiene un usuario por su ID sin incluir la contraseña.
   */
  static async getById (id) {
    const [user] = await pool.query(
      'SELECT usu_ide, usu_usu, usu_nom, usu_ape, usu_tip, usu_mod, nom_ced FROM tesusu WHERE usu_ide = ?',
      [id]
    )
    return user[0] || null
  }

  /**
   * Actualiza los datos de un usuario (excepto la contraseña).
   */
  static async update (id, { usu_usu, usu_nom, usu_ape, usu_tip, usu_mod, nom_ced }) {
    const [result] = await pool.query(
      `UPDATE tesusu SET 
        usu_usu = ?,
        usu_nom = ?, 
        usu_ape = ?, 
        usu_tip = ?, 
        usu_mod = ?, 
        nom_ced = ? 
      WHERE usu_ide = ?`,
      [usu_usu, usu_nom, usu_ape, usu_tip, usu_mod, nom_ced, id]
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
      'UPDATE tesusu SET usu_con = ? WHERE usu_ide = ?',
      [hash, id]
    )
    return result.affectedRows > 0
  }

  /**
   * Elimina un usuario de la base de datos.
   */
  static async delete (id) {
    const [result] = await pool.query(
      'DELETE FROM tesusu WHERE usu_ide = ?',
      [id]
    )
    return result.affectedRows > 0
  }
}
