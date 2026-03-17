import { EquipoService } from '../services/equipo.service.js'

export const obtenerEquipos = async (req, res) => {
  try {
    const equipos = await EquipoService.obtenerTodos()
    res.json(equipos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerEquipo = async (req, res) => {
  try {
    const { id } = req.params
    const equipo = await EquipoService.obtenerPorId(id)
    res.json(equipo)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crearEquipo = async (req, res) => {
  try {
    const nuevoEquipo = await EquipoService.crear(req.body)
    res.status(201).json(nuevoEquipo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarEquipo = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await EquipoService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarEquipo = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await EquipoService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
