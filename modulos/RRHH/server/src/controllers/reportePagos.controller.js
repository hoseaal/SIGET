import { ReportePagosService } from '../services/reportePagos.service.js'

export class ReportePagosController {
  static async generar(req, res) {
    try {
      const { mes, anio, quincena } = req.query
      if (!mes || !anio) {
        return res.status(400).json({ ok: false, error: 'mes y anio son requeridos' })
      }
      const resultado = await ReportePagosService.generarReporte(
        Number(mes), Number(anio), quincena ? Number(quincena) : 1
      )
      res.json({ ok: true, ...resultado })
    } catch (error) {
      console.error('[ReportePagosController] Error:', error)
      res.status(500).json({ ok: false, error: error.message })
    }
  }
}
