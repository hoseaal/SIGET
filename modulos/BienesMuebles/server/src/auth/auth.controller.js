import { AuthService } from './auth.service.js'
import { cache } from '../utils/cache.js'

export const login = async (req, res) => {
  try {
    const { ci, password } = req.body
    const result = await AuthService.login(ci, password)

    // Configurar cookie
    res.cookie('access_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 6 * (3600000) // 6 horas
    })

    res.json({
      success: true,
      user: result.user
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    })
  }
}

export const register = async (req, res) => {
  try {
    const user = await AuthService.register(req.body)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const verifyAuth = (req, res) => {
  const response = {
    success: true,
    user: req.user
  }

  // Cachear respuesta (30 segundos)
  cache.set(req.cookies.access_token, {
    data: response,
    expires: Date.now() + 30000
  })

  res.json(response)
}

export const logout = (req, res) => {
  res.clearCookie('access_token')
    .json({ message: 'Sesión cerrada' })
}
