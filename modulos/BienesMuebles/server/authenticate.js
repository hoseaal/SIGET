import config from './config.js'
import jwt from 'jsonwebtoken'

const authenticate = (req, res, next) => {
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
    next()
  } catch (err) {
    console.error('Error verifying token:', err)
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado'
    })
  }
}

export default authenticate
