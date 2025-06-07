import jwt from 'jsonwebtoken'
import config from '../utils/config.js'
import { cache } from '../utils/cache.js'

export const authenticate = (req, res, next) => {
  const token = req.cookies.access_token

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado'
    })
  }

  try {
    const data = jwt.verify(token, config.SECRET_KEY)
    req.user = data

    // Verificar caché (opcional)
    if (cache.has(token)) {
      req.user = cache.get(token).data.user
    }

    next()
  } catch (err) {
    console.error('Error verifying token:', err)
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado'
    })
  }
}

export const checkRole = (rolesPermitidos) => (req, res, next) => {
  if (!rolesPermitidos.includes(req.user.usu_tip)) {
    return res.status(403).json({ error: 'Acceso prohibido' })
  }
  next()
}
