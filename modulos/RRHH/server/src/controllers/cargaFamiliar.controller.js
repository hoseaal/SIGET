import { HijoService } from '../services/hijo.service.js'

export const obtenerCargaFamiliar = async (req, res) => {
  try {
    const { empleado_id } = req.params
    const hijos = await HijoService.obtenerPorFuncionario(empleado_id)
    res.json(hijos)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crearCargaFamiliar = async (req, res) => {
  try {
    const nuevo = await HijoService.crear(req.body)
    res.status(201).json(nuevo)
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'El Empleado indicado no existe.' })
    }
    res.status(400).json({ error: error.message })
  }
}

export const actualizarCargaFamiliar = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await HijoService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarCargaFamiliar = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await HijoService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
