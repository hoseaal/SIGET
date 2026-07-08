/* eslint-disable camelcase */
import { NominaSobrevivientesService } from '../services/nominaSobrevivientes.service.js'
import {
  obtenerPeriodoNominaPayload,
  procesarNominaYPersistir,
  responderErrorNomina
} from '../utils/nominaResponse.js'

export class NominaSobrevivientesController {
  static async obtenerPeriodoObjetivo(req, res) {
    try {
      return res.status(200).json(obtenerPeriodoNominaPayload())
    } catch (error) {
      console.error('Error periodo en NominaSobrevivientesController:', error)
      return responderErrorNomina(res, error, 'Error interno al obtener el periodo de nomina de sobrevivientes')
    }
  }

  static async procesar(req, res) {
    try {
      const payload = await procesarNominaYPersistir(req, NominaSobrevivientesService, 'total_sobrevivientes')
      return res.status(200).json(payload)
    } catch (error) {
      console.error('Error en NominaSobrevivientesController:', error)
      return responderErrorNomina(res, error, 'Error interno al procesar nomina de sobrevivientes')
    }
  }
}
