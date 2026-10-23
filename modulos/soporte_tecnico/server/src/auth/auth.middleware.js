import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { cache } from '../utils/cache.js'

export const authenticate = (req, res, next) => {
  const token = req.cookies.access_token

  if (!token) {
    return res.status(401).json({ success: false, error: 'Acceso no autorizado' })
  }

  try {
    const data = jwt.verify(token, process.env.SECRET_KEY)
    req.user = data

    if (cache.has(token)) {
      const cached = cache.get(token)
      if (cached.expires > Date.now()) {
        req.user = cached.data.user
      } else {
        cache.delete(token)
      }
    }

    next()
  } catch (err) {
    console.error('Error verifying token:', err.message)
    return res.status(401).json({ success: false, error: 'Token invalido o expirado' })
  }
}

export const checkRole = (rolesPermitidos) => (req, res, next) => {
  if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
    return res.status(403).json({ error: 'Acceso prohibido' })
  }
  next()
}
