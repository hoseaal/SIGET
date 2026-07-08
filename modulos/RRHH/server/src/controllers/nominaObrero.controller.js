import { NominaObreroService } from '../services/nominaObrero.services.js'
import {
  obtenerPeriodoNominaPayload,
  procesarNominaYPersistir,
  responderErrorNomina
} from '../utils/nominaResponse.js'

export class NominaObreroController {
  static async obtenerPeriodoObjetivo(req, res) {
    try {
      return res.status(200).json(obtenerPeriodoNominaPayload())
    } catch (error) {
      console.error('[NominaObreroController] Error periodo:', error)
      return responderErrorNomina(res, error, 'Error interno al obtener el periodo de nomina de obreros.')
    }
  }

  static async procesar(req, res) {
    try {
      const payload = await procesarNominaYPersistir(req, NominaObreroService, 'total_obreros')
      return res.status(200).json(payload)
    } catch (error) {
      console.error('[NominaObreroController] Error:', error)
      return responderErrorNomina(res, error, 'Error interno al procesar la nomina de obreros.')
    }
  }
}
