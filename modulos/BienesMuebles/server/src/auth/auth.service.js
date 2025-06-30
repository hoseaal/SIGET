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

    const hash = user.usu_con.replace(/^\$2y\$/, '$2a$')
    const isValid = await bcrypt.compare(password, hash)
    if (!isValid) throw new Error('Contraseña incorrecta')
    const modulo = user.usu_mod
    if (modulo === 2) throw new Error('No tienes acceso a este modulo del sistema SIGET')
    const token = jwt.sign(
      {
        usu_ide: user.usu_ide,
        usu_nom: user.usu_nom,
        usu_ape: user.usu_ape,
        usu_tip: user.usu_tip
      },
      process.env.SECRET_KEY,
      { expiresIn: '6h' }
    )

    return {
      token,
      user: {
        usu_ide: user.usu_ide,
        usu_nom: user.usu_nom,
        usu_ape: user.usu_ape,
        usu_tip: user.usu_tip
      }
    }
  }

  static async register (userData) {
    return await UserModel.create(userData)
  }
}
