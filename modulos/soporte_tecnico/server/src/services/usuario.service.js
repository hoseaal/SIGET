import { UsuarioModel } from '../models/usuario.model.js'
import { Validaciones } from '../utils/validations.js'

const ROLES = ['Administrador', 'Tecnico', 'Consulta']

export class UsuarioService {
  static async obtenerTodos () {
    return await UsuarioModel.getAll()
  }

  static async obtenerPorId (id) {
    const usuario = await UsuarioModel.getById(id)
    if (!usuario) throw new Error('Usuario no encontrado')
    return usuario
  }

  static async crear (datos) {
    Validaciones.username(datos.username)
    Validaciones.password(datos.password)
    Validaciones.requerido(datos.nombres, 'nombres')
    Validaciones.requerido(datos.apellidos, 'apellidos')
    Validaciones.email(datos.email)

    if (!ROLES.includes(datos.rol)) throw new Error('El rol no es valido')

    const existente = await UsuarioModel.findByUsername(datos.username)
    if (existente) throw new Error('El nombre de usuario ya esta en uso')

    return await UsuarioModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await UsuarioModel.getById(id)
    if (!existe) throw new Error('Usuario no encontrado para actualizar')

    Validaciones.requerido(datos.nombres, 'nombres')
    Validaciones.requerido(datos.apellidos, 'apellidos')
    Validaciones.email(datos.email)
    if (!ROLES.includes(datos.rol)) throw new Error('El rol no es valido')

    return await UsuarioModel.update(id, datos)
  }

  static async actualizarClave (id, datos) {
    const existe = await UsuarioModel.getById(id)
    if (!existe) throw new Error('Usuario no encontrado para cambiar contrasena')

    Validaciones.password(datos.password)
    return await UsuarioModel.updatePassword(id, datos.password)
  }

  static async eliminar (id) {
    const existe = await UsuarioModel.getById(id)
    if (!existe) throw new Error('Usuario no encontrado para eliminar')
    return await UsuarioModel.delete(id)
  }
}
