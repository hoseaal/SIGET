import { TipoActividadService } from '../services/tipoActividad.service.js'

export const obtenerTipos = async (req, res) => {
  try {
    if (req.query.clasificacion_id) {
      const tipos = await TipoActividadService.obtenerPorClasificacion(req.query.clasificacion_id)
      return res.json(tipos)
    }
    const tipos = await TipoActividadService.obtenerTodos()
    res.json(tipos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerTipo = async (req, res) => {
  try {
    const tipo = await TipoActividadService.obtenerPorId(req.params.id)
    res.json(tipo)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crearTipo = async (req, res) => {
  try {
    const tipo = await TipoActividadService.crear(req.body)
    res.status(201).json(tipo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarTipo = async (req, res) => {
  try {
    const actualizado = await TipoActividadService.actualizar(req.params.id, req.body)
    res.json({ success: actualizado, message: 'Tipo de actividad actualizado correctamente' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarTipo = async (req, res) => {
  try {
    await TipoActividadService.eliminar(req.params.id)
    res.json({ success: true, message: 'Tipo de actividad eliminado correctamente' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
