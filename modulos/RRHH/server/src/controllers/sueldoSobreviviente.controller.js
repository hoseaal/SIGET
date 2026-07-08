import { SueldoSobrevivienteService } from '../services/sueldoSobreviviente.service.js'

export const obtenerSueldoActual = async (req, res) => {
  try {
    const sueldo = await SueldoSobrevivienteService.obtenerActual()
    res.json(sueldo)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const guardarSueldo = async (req, res) => {
  try {
    const nuevo = await SueldoSobrevivienteService.guardar(req.body)
    res.status(201).json(nuevo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarSueldo = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await SueldoSobrevivienteService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarSueldo = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await SueldoSobrevivienteService.eliminar(id)
    res.json({ success: eliminado > 0 })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
