import { ClasificacionService } from '../services/clasificacion.service.js'

export const obtenerClasificaciones = async (req, res) => {
  try {
    const clasificaciones = await ClasificacionService.obtenerTodas()
    res.json(clasificaciones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerClasificacionesActivas = async (req, res) => {
  try {
    const clasificaciones = await ClasificacionService.obtenerActivas()
    res.json(clasificaciones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerClasificacion = async (req, res) => {
  try {
    const clasificacion = await ClasificacionService.obtenerPorId(req.params.id)
    res.json(clasificacion)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crearClasificacion = async (req, res) => {
  try {
    const clasificacion = await ClasificacionService.crear(req.body)
    res.status(201).json(clasificacion)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarClasificacion = async (req, res) => {
  try {
    const actualizado = await ClasificacionService.actualizar(req.params.id, req.body)
    res.json({ success: actualizado, message: 'Clasificacion actualizada correctamente' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarClasificacion = async (req, res) => {
  try {
    await ClasificacionService.eliminar(req.params.id)
    res.json({ success: true, message: 'Clasificacion eliminada correctamente' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
