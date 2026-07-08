import { UserModel } from '../models/user.model.js'
import { Validaciones } from '../utils/validations.js'

export class UserService {
  static async obtenerTodos () {
    return await UserModel.getAll()
  }

  static async crearConEmpleado (datos) {
    // Podríamos añadir más validaciones aquí
    return await UserModel.create(datos)
  }

  static async obtenerPorId (id) {
    const usuario = await UserModel.getById(id)
    if (!usuario) throw new Error('Usuario no encontrado')
    return usuario
  }

  static async actualizar (id, datos) {
    // Primero, verificamos si el usuario existe
    const existe = await UserModel.getById(id)
    if (!existe) throw new Error('Usuario no encontrado para actualizar')

    // Validaciones básicas
    if (!datos.nombres || !datos.apellidos || !datos.rol_id) {
      throw new Error('Nombre, apellido y tipo de usuario son requeridos.')
    }

    return await UserModel.update(id, datos)
  }

  static async actualizarClave (id, datos) {
    const { password } = datos
    if (!password) throw new Error('La nueva contraseña es requerida')

    const existe = await UserModel.getById(id)
    if (!existe) throw new Error('Usuario no encontrado para cambiar contraseña')
    Validaciones.password(password)
    return await UserModel.updatePassword(id, password)
  }

  static async eliminar (id) {
    const existe = await UserModel.getById(id)
    if (!existe) throw new Error('Usuario no encontrado para eliminar')

    return await UserModel.delete(id)
  }
}
