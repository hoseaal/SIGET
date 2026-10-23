import jwt from 'jsonwebtoken'
import 'dotenv/config'
import bcrypt from 'bcrypt'
import { UsuarioModel } from '../models/usuario.model.js'
import { Validaciones } from '../utils/validations.js'

export class AuthService {
  static async login (username, password) {
    Validaciones.username(username)
    Validaciones.password(password)

    const user = await UsuarioModel.findByUsername(username)
    if (!user) throw new Error('Usuario o contrasena incorrectos')
    if (!user.activo) throw new Error('El usuario se encuentra inactivo')

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) throw new Error('Usuario o contrasena incorrectos')

    const payload = {
      id: user.id,
      username: user.username,
      nombres: user.nombres,
      apellidos: user.apellidos,
      rol: user.rol,
      departamento_id: user.departamento_id
    }

    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '6h' })

    return {
      token,
      user: payload
    }
  }
}
