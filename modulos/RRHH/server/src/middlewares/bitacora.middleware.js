import jwt from 'jsonwebtoken'
import { BitacoraModel } from '../models/bitacora.model.js'

const TIPO_POR_METODO = {
  POST: 'CREACION',
  PUT: 'ACTUALIZACION',
  PATCH: 'ACTUALIZACION',
  DELETE: 'ELIMINACION'
}

// Rutas que NO se registran en la bitácora
const RUTAS_EXCLUIDAS = ['/auth', '/bitacora']

// Campos cuyo valor nunca debe guardarse
const esSensible = (clave) => {
  const k = String(clave).toLowerCase()
  return k.includes('password') || k.includes('contras') || k.includes('token')
}

const limpiarBody = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  const limpio = {}
  for (const [clave, valor] of Object.entries(body)) {
    limpio[clave] = esSensible(clave) ? '***' : valor
  }
  return limpio
}

/**
 * Middleware que registra automáticamente las operaciones de escritura
 * (POST/PUT/PATCH/DELETE) que llegan a la API de RRHH.
 *
 * - Se ejecuta al terminar la respuesta y solo si fue exitosa (status < 400).
 * - Nunca interrumpe ni afecta la operación original (los errores se ignoran).
 */
export const registrarBitacora = (req, res, next) => {
  const tipoCambio = TIPO_POR_METODO[req.method]
  if (!tipoCambio) return next()

  // req.originalUrl nunca es modificado por los routers anidados (req.path/req.params sí)
  const ruta = (req.originalUrl || '').split('?')[0]
  const segmentos = ruta.replace(/^\/api\/rrhh\/?/, '').split('/').filter(Boolean)
  const recurso = segmentos[0] || null

  if (recurso && RUTAS_EXCLUIDAS.includes(recurso)) return next()

  res.on('finish', () => {
    if (res.statusCode >= 400) return
    try {
      let usuario = null
      const token = req.cookies?.access_token
      if (token) {
        try { usuario = jwt.verify(token, process.env.SECRET_KEY) } catch { usuario = null }
      }

      // ID afectado: último segmento numérico de la URL, o el id del body
      let registroId = null
      const ultimo = segmentos[segmentos.length - 1]
      if (segmentos.length > 1 && ultimo && /^\d+$/.test(ultimo)) registroId = ultimo
      if (registroId == null && req.body?.id != null) registroId = req.body.id

      BitacoraModel.registrar({
        usuario_id: usuario?.usuario_id ?? null,
        nombre_usuario: usuario?.nombres ?? null,
        apellido_usuario: usuario?.apellidos ?? null,
        registro_id_afectado: registroId,
        tipo_cambio: tipoCambio,
        modulo: 'RRHH',
        tabla: recurso,
        datos_antiguos: null,
        datos_nuevos: tipoCambio === 'ELIMINACION' ? null : limpiarBody(req.body)
      }).catch(() => { /* nunca romper la respuesta */ })
    } catch { /* ignorar */ }
  })

  next()
}
