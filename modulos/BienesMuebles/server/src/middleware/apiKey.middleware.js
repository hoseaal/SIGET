import crypto from 'crypto'

/**
 * Protege los endpoints de integracion usados por otros modulos.
 * Acepta la clave en x-api-key o en Authorization: Bearer <clave>.
 */
export const requireApiKey = (req, res, next) => {
  const configured = process.env.SOPORTE_API_KEY

  if (!configured) {
    return res.status(500).json({
      error: 'SOPORTE_API_KEY no esta configurada en el servidor de Bienes Muebles'
    })
  }

  const header = req.get('x-api-key')
  const bearer = req.get('authorization')?.startsWith('Bearer ')
    ? req.get('authorization').slice(7)
    : null
  const provided = String(header || bearer || '')

  const providedBuffer = Buffer.from(provided)
  const configuredBuffer = Buffer.from(configured)

  const valid = providedBuffer.length === configuredBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, configuredBuffer)

  if (!valid) {
    return res.status(401).json({ error: 'Clave de integracion invalida' })
  }

  next()
}
