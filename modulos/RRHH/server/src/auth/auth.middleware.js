import jwt from 'jsonwebtoken'
import 'dotenv/config'
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
    const data = jwt.verify(token, process.env.SECRET_KEY)
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
  if (!rolesPermitidos.includes(req.user.rol_id)) {
    return res.status(403).json({ error: 'Acceso prohibido' })
  }
  next()
}

export const requireEmployeeScope = (req, res, next) => {
  if (req.user.nombre_rol === 'Visualizador') {
    if (!req.user.empleado_id) {
      return res.status(403).json({ error: 'Usuario Visualizador no tiene un empleado asociado' })
    }

    // Verificar que no se intente inyectar un ID distinto
    const incomingId = req.query.empleado_id || req.body.empleado_id || req.params.empleado_id || req.params.id;
    if (incomingId && Number(incomingId) !== Number(req.user.empleado_id)) {
      return res.status(403).json({ error: 'Acceso denegado: Intento de inyección de ID rechazado.' });
    }

    // Forzamos el empleado_id en params o body (dependiendo de donde lo necesiten los controladores)
    // Usualmente para GET se usa query o params. Lo ponemos en ambos para que los controladores solo puedan consultar este.
    if (req.method === 'GET') {
      req.query.empleado_id = req.user.empleado_id
    } else {
      req.body.empleado_id = req.user.empleado_id
    }
  }
  next()
}
