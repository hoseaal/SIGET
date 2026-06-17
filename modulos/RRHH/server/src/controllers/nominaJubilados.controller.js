/* eslint-disable camelcase */
import { NominaJubiladosService } from '../services/nominaJubilados.service.js'
import {
  obtenerPeriodoNominaPayload,
  procesarNominaYPersistir,
  responderErrorNomina
} from '../utils/nominaResponse.js'

export class NominaJubiladosController {
  static async obtenerPeriodoObjetivo(req, res) {
    try {
      return res.status(200).json(obtenerPeriodoNominaPayload())
    } catch (error) {
      console.error('Error periodo en NominaJubiladosController:', error)
      return responderErrorNomina(res, error, 'Error interno al obtener el periodo de nomina de jubilados')
    }
  }

  static async procesar(req, res) {
    try {
      const payload = await procesarNominaYPersistir(req, NominaJubiladosService, 'total_jubilados')
      return res.status(200).json(payload)
    } catch (error) {
      console.error('Error en NominaJubiladosController:', error)
      return responderErrorNomina(res, error, 'Error interno al procesar nomina de jubilados')
    }
  }
}
