import { EstadoUsoService } from '../services/estadoUso.service.js'

export const obtenerEstadosUso = async (req, res) => {
  try {
    const estados = await EstadoUsoService.obtenerTodos()
    res.json(estados)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerEstadoUso = async (req, res) => {
  try {
    const estado = await EstadoUsoService.obtenerPorId(req.params.id)
    res.json(estado)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}
