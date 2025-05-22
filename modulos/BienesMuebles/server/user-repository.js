/* eslint-disable camelcase */
import { getConnection } from './conn.js'
import { Validaciones } from './Validaciones.js'
import bcrypt from 'bcrypt'

export class UserRepository {
  // eslint-disable-next-line camelcase
  static async create ({ ced, password1, usu_usu, nombre, ape, tipoUsuario, modulo }) {
    const conn = await getConnection()
    try {
      // Ejecutar validaciones
      Validaciones.username(usu_usu)
      Validaciones.password(password1)

      // Verificar si usuario existe
      const [existingUsers] = await conn.query(
        'SELECT * FROM tesusu WHERE usu_usu = ?',
        [usu_usu]
      )

      if (existingUsers.length > 0) {
        throw new Error('El usuario ya existe')
      }

      const [existingCed] = await conn.query(
        'SELECT * FROM tesusu WHERE nom_ced = ?',
        [usu_usu]
      )

      if (existingCed.length > 0) {
        throw new Error('Ya hay un usuario registrado con esta Cedula de identidad')
      }

      const salt = bcrypt.genSaltSync(12)
      const hash = bcrypt.hashSync(password1, salt.replace(/^\$2a\$/, '$2y$'))

      // Insertar nuevo usuario
      // eslint-disable-next-line no-unused-vars
      const [result] = await conn.query(
        'INSERT INTO `tesusu`(`usu_ide`, `usu_usu`, `usu_con`, `usu_nom`, `usu_ape`, `usu_tip`, `usu_mod`, `nom_ced`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [ced, usu_usu, hash, nombre, ape, tipoUsuario, modulo, ced]
      )

      return { usu_ide: ced, nom_ced: ced, usu_nom: nombre, usu_ape: ape, usu_tip: tipoUsuario }
    } catch (error) {
      Validaciones.errors(error)
      throw error
    } finally {
      if (conn) conn.release()
    }
  }

  static async login ({ ci, password }) {
    const conn = await getConnection()
    Validaciones.username(ci)
    Validaciones.password(password)
    const [existingUsers] = await conn.query(
      'SELECT * FROM tesusu WHERE usu_usu = ?',
      [ci]
    )

    if (existingUsers.length === 0) {
      throw new Error('Usuario incorrecto')
    }

    const hashFromDB = existingUsers[0].usu_con.replace(/^\$2y\$/, '$2a$')
    const ValidacionPassword = await bcrypt.compare(password, hashFromDB)

    if (!ValidacionPassword) throw new Error('Contraseña incorrecta')

    const { password: _, ...publicUser } = existingUsers[0]

    return {
      success: true,
      user: {
        usu_ide: publicUser.usu_ide,
        usu_nom: publicUser.usu_nom,
        usu_ape: publicUser.usu_ape,
        usu_tip: publicUser.usu_tip
      }
    }
  }
}
