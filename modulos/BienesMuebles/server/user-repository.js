import { getConnection } from './conn.js'
import { Validaciones } from './Validaciones.js'
import bcrypt from 'bcrypt'

export class UserRepository {
  static async create ({ ci, password, terms }) {
    const conn = await getConnection()
    try {
      // Ejecutar validaciones
      Validaciones.username(ci)
      Validaciones.password(password)
      Validaciones.terms(terms)

      // Verificar si usuario existe
      const [existingUsers] = await conn.query(
        'SELECT * FROM tesusu WHERE usu_ide = ?',
        [ci]
      )

      if (existingUsers.length > 0) {
        throw new Error('El usuario ya existe')
      }

      const hashedPassword = bcrypt.hashSync(password, 12)

      // Insertar nuevo usuario
      // eslint-disable-next-line no-unused-vars
      const [result] = await conn.query(
        'INSERT INTO tesusu (usu_ide, usu_con, usu_tip, nom_ced) VALUES (?, ?, 1, ?)',
        [ci, hashedPassword, ci]
      )

      return { usu_ide: ci, nom_ced: ci }
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
      'SELECT * FROM tesusu WHERE usu_ide = ?',
      [ci]
    )

    if (existingUsers.length === 0) {
      throw new Error('Usuario incorrecto')
    }

    const ValidacionPassword = await bcrypt.compare(password, existingUsers[0].usu_con)
    if (!ValidacionPassword) throw new Error('Contraseña incorrecta')

    const { password: _, ...publicUser } = existingUsers[0]

    return {
      success: true,
      user: {
        usu_ide: publicUser.usu_ide
      }
    }
  }
}
