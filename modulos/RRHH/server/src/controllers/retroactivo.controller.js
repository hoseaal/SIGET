import { RetroactivoService } from '../services/retroactivo.service.js'

export class RetroactivoController {
  static async listar(req, res) {
    try {
      const data = await RetroactivoService.listarPorEmpleado(req.params.empleadoId)
      return res.json({ ok: true, data })
    } catch (error) {
      return res.status(500).json({ ok: false, error: error.message })
    }
  }

  static async crear(req, res) {
    try {
      const data = await RetroactivoService.crear({ ...req.body, empleado_id: req.params.empleadoId })
      return res.status(201).json({ ok: true, data })
    } catch (error) {
      return res.status(400).json({ ok: false, error: error.message })
    }
  }

  static async actualizar(req, res) {
    try {
      const data = await RetroactivoService.actualizar(req.params.id, { ...req.body, empleado_id: req.params.empleadoId })
      return res.json({ ok: true, data })
    } catch (error) {
      return res.status(400).json({ ok: false, error: error.message })
    }
  }

  static async eliminar(req, res) {
    try {
      await RetroactivoService.eliminar(req.params.id)
      return res.json({ ok: true })
    } catch (error) {
      return res.status(400).json({ ok: false, error: error.message })
    }
  }

  static async pagar(req, res) {
    try {
      const data = await RetroactivoService.pagar(req.params.id, req.body?.tipoNomina)
      return res.json({ ok: true, data })
    } catch (error) {
      return res.status(400).json({ ok: false, error: error.message })
    }
  }
}
