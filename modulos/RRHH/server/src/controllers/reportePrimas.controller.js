import { ReportePrimasService } from '../services/reportePrimas.service.js'

export class ReportePrimasController {
  static async generar(req, res) {
    try {
      const { mes, anio, quincena } = req.query
      if (!mes || !anio) {
        return res.status(400).json({ ok: false, error: 'mes y anio son requeridos' })
      }
      const resultado = await ReportePrimasService.generarReporte(
        Number(mes), Number(anio), quincena ? Number(quincena) : 1
      )
      res.json({ ok: true, ...resultado })
    } catch (error) {
      console.error('[ReportePrimasController] Error:', error)
      res.status(500).json({ ok: false, error: error.message })
    }
  }
}
