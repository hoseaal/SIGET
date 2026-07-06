import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { UserModel } from '../models/user.model.js'
import { Validaciones } from '../utils/validations.js'
import bcrypt from 'bcrypt'

export class AuthService {
  static async login (ci, password) {
    Validaciones.username(ci)
    Validaciones.password(password)

    const user = await UserModel.findByUsername(ci)
    if (!user) throw new Error('Usuario incorrecto')

    const hash = user.password_hash.replace(/^\$2y\$/, '$2a$')
    const isValid = await bcrypt.compare(password, hash)
    if (!isValid) throw new Error('Contraseña incorrecta')
    const modulo = user.modulo_id
    if (modulo === 2) throw new Error('No tienes acceso a este modulo del sistema SIGET')
    const token = jwt.sign(
      {
        usuario_id: user.usuario_id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol_id: user.rol_id,
        nombre_rol: user.nombre_rol, // Se añade el nombre del rol
        empleado_id: user.empleado_id // Se añade el id del empleado
      },
      process.env.SECRET_KEY,
      { expiresIn: '6h' }
    )

    return {
      token,
      user: {
        usuario_id: user.usuario_id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol_id: user.rol_id,
        nombre_rol: user.nombre_rol, // Se añade el nombre del rol
        empleado_id: user.empleado_id // Se añade el id del empleado
      }
    }
  }

  static async register (userData) {
    Validaciones.username(userData.username)
    Validaciones.password(userData.password1)
    return await UserModel.create(userData)
  }
}
