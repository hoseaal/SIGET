import { ReporteIngresosService } from '../services/reporteIngresos.service.js'

export class ReporteIngresosController {
  static async generar(req, res) {
    try {
      const { desde, hasta, tipo_personal } = req.query
      if (!desde || !hasta) {
        return res.status(400).json({ ok: false, error: 'desde y hasta son requeridos' })
      }
      const resultado = await ReporteIngresosService.generarReporte({ desde, hasta, tipo_personal })
      res.json({ ok: true, ...resultado })
    } catch (error) {
      console.error('[ReporteIngresosController] Error:', error)
      res.status(500).json({ ok: false, error: error.message })
    }
  }
}
