import { ReportePadresService } from '../services/reportePadres.service.js'

export class ReportePadresController {
  static async generar(req, res) {
    try {
      const { tipo_personal } = req.query
      const resultado = await ReportePadresService.generarReporte(tipo_personal || 'Todos')
      res.json({ ok: true, ...resultado })
    } catch (error) {
      console.error('[ReportePadresController] Error:', error)
      res.status(500).json({ ok: false, error: error.message })
    }
  }
}
