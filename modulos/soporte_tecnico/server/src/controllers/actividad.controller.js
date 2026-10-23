import { ActividadService } from '../services/actividad.service.js'

export const obtenerActividades = async (req, res) => {
  try {
    const actividades = await ActividadService.obtenerTodas({
      desde: req.query.desde,
      hasta: req.query.hasta,
      departamento_id: req.query.departamento_id,
      clasificacion_id: req.query.clasificacion_id,
      tipo_actividad_id: req.query.tipo_actividad_id,
      search: req.query.search
    })
    res.json(actividades)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerActividad = async (req, res) => {
  try {
    const actividad = await ActividadService.obtenerPorId(req.params.id)
    res.json(actividad)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const generarProximoNumero = async (req, res) => {
  try {
    const numero = await ActividadService.generarNroActividad()
    res.json({ numero })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const crearActividad = async (req, res) => {
  try {
    const actividad = await ActividadService.crear(req.body, req.user.id)
    res.status(201).json({
      message: 'Actividad registrada exitosamente',
      data: actividad
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarActividad = async (req, res) => {
  try {
    const actualizada = await ActividadService.actualizar(req.params.id, req.body)
    res.json({
      message: 'Actividad actualizada correctamente',
      data: actualizada
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarActividad = async (req, res) => {
  try {
    const resultado = await ActividadService.eliminar(req.params.id)
    res.json(resultado)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await ActividadService.obtenerEstadisticas()
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
