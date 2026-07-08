import { PorcentajeJerarquiaService } from '../services/porcentajeJerarquia.service.js'

export const obtenerJerarquias = async (req, res) => {
  try {
    const jerarquias = await PorcentajeJerarquiaService.obtenerTodas()
    res.json(jerarquias)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerJerarquia = async (req, res) => {
  try {
    const { id } = req.params
    const jerarquia = await PorcentajeJerarquiaService.obtenerPorId(id)
    res.json(jerarquia)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crearJerarquia = async (req, res) => {
  try {
    const nuevaJerarquia = await PorcentajeJerarquiaService.crear(req.body)
    res.status(201).json(nuevaJerarquia)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarJerarquia = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await PorcentajeJerarquiaService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarJerarquia = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await PorcentajeJerarquiaService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
