/* eslint-disable no-empty-pattern */
// user-repository.js
import { getConnection } from './conn.js'

class UserRepository {
  async create ({ ci, password }) {
    // Validaciones
    if (typeof ci !== 'string') throw new Error('El CI está vacío')
    if (ci.length < 3) throw new Error('El CI debe tener mínimo 3 caracteres')
    if (typeof password !== 'string') throw new Error('La contraseña está vacía')

    const conn = await getConnection()
    try {
      // Verificar si usuario existe
      const [existingUsers] = await conn.query(
        'SELECT * FROM tesusu WHERE usu_ide = ?',
        [ci]
      )

      if (existingUsers.length > 0) {
        throw new Error('El usuario ya existe')
      }

      const [] = await conn.query(
        'INSERT INTO tesusu (usu_ide, usu_con, usu_tip, nom_ced) VALUES (?, ?, 1, ?)',
        [ci, password, ci]
      )

      return { id: ci, ci }
    } finally {
      if (conn) conn.release()
    }
  }
}

// Exporta una instancia en lugar de la clase
export default new UserRepository()
