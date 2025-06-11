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

  static async create ({ ced, password1, usu_usu, nombre, ape, tipoUsuario, modulo }) {
    const salt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync(password1, salt.replace(/^\$2a\$/, '$2y$'))

    // eslint-disable-next-line no-unused-vars
    const [result] = await pool.query(
      `INSERT INTO tesusu 
       (usu_usu, usu_con, usu_nom, usu_ape, usu_tip, usu_mod, nom_ced) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usu_usu, hash, nombre, ape, tipoUsuario, modulo, ced]
    )

    return {
      usu_nom: nombre,
      usu_ape: ape,
      usu_tip: tipoUsuario
    }
  }
}
