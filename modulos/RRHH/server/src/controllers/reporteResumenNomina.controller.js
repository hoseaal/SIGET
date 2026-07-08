import { ReporteResumenNominaService } from '../services/reporteResumenNomina.service.js'

export class ReporteResumenNominaController {
  static async generar(req, res) {
    try {
      const { mes, anio, quincena } = req.query
      if (!mes || !anio) {
        return res.status(400).json({ ok: false, error: 'mes y anio son requeridos' })
      }
      const resultado = await ReporteResumenNominaService.generarReporte(
        Number(mes), Number(anio), quincena ? Number(quincena) : 1
      )
      res.json({ ok: true, ...resultado })
    } catch (error) {
      console.error('[ReporteResumenNominaController] Error:', error)
      res.status(500).json({ ok: false, error: error.message })
    }
  }
}
