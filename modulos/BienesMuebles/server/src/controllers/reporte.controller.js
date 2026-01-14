// controllers/reporteBM4.controller.js
import { ReporteBM4Service } from '../services/reporte.service.js' // Asegúrate de la ruta correcta

export class ReporteBM4Controller {
  /**
     * Endpoint para procesar el cierre de mes.
     * @param {Object} req - Objeto de solicitud.
     * @param {Object} res - Objeto de respuesta.
     */
  static async cerrarMes (req, res) {
    try {
      // Asegúrate de que solo los usuarios autorizados puedan acceder a este endpoint
      // (Ej: middleware de autenticación y autorización aquí)

      const result = await ReporteBM4Service.cerrarMes()
      res.status(200).json(result)
    } catch (error) {
      console.error('Error en el controlador al cerrar mes:', error)
      const statusCode = error.statusCode || 500
      res.status(statusCode).json({
        message: error.message || 'Error interno del servidor al procesar el cierre de mes.'
      })
    }
  }

  /**
     * Endpoint para obtener la existencia del mes anterior (del cierre de mes).
     * @param {Object} req - Objeto de solicitud.
     * @param {Object} res - Objeto de respuesta.
     */
  static async getExistenciaAnterior (req, res) {
    try {
      const data = await ReporteBM4Service.getExistenciaAnteriorParaMostrar()
      res.status(200).json(data)
    } catch (error) {
      console.error('Error en el controlador al obtener existencia anterior:', error)
      res.status(500).json({
        message: error.message || 'Error interno del servidor al obtener la existencia anterior.'
      })
    }
  }

  /**
     * Endpoint para obtener la existencia actual de bienes en tiempo real.
     * @param {Object} req - Objeto de solicitud.
     * @param {Object} res - Objeto de respuesta.
     */
  static async getExistenciaActual (req, res) {
    try {
      const data = await ReporteBM4Service.getExistenciaActualRealTime()
      res.status(200).json(data)
    } catch (error) {
      console.error('Error en el controlador al obtener existencia actual real-time:', error)
      res.status(500).json({
        message: error.message || 'Error interno del servidor al obtener la existencia actual.'
      })
    }
  }

  static async getCategorias (req, res) {
    try {
      const data = await ReporteBM4Service.getCategorias()
      res.status(200).json(data)
    } catch (error) {
      console.error('Error en el controlador de categorias:', error)
      res.status(500).json({
        message: error.message || 'Error interno del servidor al obtener la data.'
      })
    }
  }
}
