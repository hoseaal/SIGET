// backend/repositories/UserRepository.js
import { selectData, insertData } from './cruds.js'

export default class UserRepository {
  static async create ({ ci, password }) {
    // Validaciones
    if (typeof ci !== 'string') throw new Error('El CI está vacío')
    if (ci.length < 3) throw new Error('El CI debe tener mínimo 3 caracteres')
    if (typeof password !== 'string') throw new Error('La contraseña está vacía')

    // Verificar si el usuario ya existe
    const existingUsers = await selectData('tesusu', `WHERE ci = '${ci}'`)
    if (existingUsers.length > 0) {
      throw new Error('El usuario ya existe')
    }

    // Crear nuevo usuario
    const newUser = { ci, password }
    const userId = await insertData('tesusu', newUser)
    return { id: userId, ...newUser }
  }

  static async login ({ username, password }) {
    // Lógica de login aquí
  }
}
