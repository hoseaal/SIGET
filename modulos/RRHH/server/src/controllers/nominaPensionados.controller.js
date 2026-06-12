/* eslint-disable camelcase */
import { NominaPensionadosService } from '../services/nominaPensionados.service.js'
import {
  obtenerPeriodoNominaPayload,
  procesarNominaEnCaliente,
  responderErrorNomina
} from '../utils/nominaResponse.js'

export class NominaPensionadosController {
  static async obtenerPeriodoObjetivo(req, res) {
    try {
      return res.status(200).json(obtenerPeriodoNominaPayload())
    } catch (error) {
      console.error('Error periodo en NominaPensionadosController:', error)
      return responderErrorNomina(res, error, 'Error interno al obtener el periodo de nomina de pensionados')
    }
  }

  static async procesar(req, res) {
    try {
      const payload = await procesarNominaEnCaliente(req, NominaPensionadosService, 'total_pensionados')
      return res.status(200).json(payload)
    } catch (error) {
      console.error('Error en NominaPensionadosController:', error)
      return responderErrorNomina(res, error, 'Error interno al procesar nomina de pensionados')
    }
  }
}
