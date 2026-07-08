import { PermisoService } from '../services/permiso.service.js'

/**
 * Obtiene el historial de permisos de un funcionario.
 * @param {number} req.params.empleado_id - ID del funcionario.
 * @param {string} [req.query.estado] - Opcional: '0' (Pendiente), '1' (Aprobado).
 */
export const obtenerPermisosPorFuncionario = async (req, res) => {
  try {
    const { empleado_id } = req.params
    const { estado } = req.query // Filtro opcional
    
    const permisos = await PermisoService.obtenerPorFuncionario(empleado_id, estado)
    res.json(permisos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerPermiso = async (req, res) => {
  try {
    const { id } = req.params
    const permiso = await PermisoService.obtenerPorId(id)
    res.json(permiso)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crearPermiso = async (req, res) => {
  try {
    const nuevo = await PermisoService.crear(req.body)
    res.status(201).json(nuevo)
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'El funcionario no existe.' })
    }
    res.status(400).json({ error: error.message })
  }
}

export const actualizarPermiso = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await PermisoService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const cambiarEstadoAprobacion = async (req, res) => {
  try {
    const { id } = req.params
    const { esta_aprobado } = req.body
    const resultado = await PermisoService.cambiarEstado(id, esta_aprobado)
    res.json({ success: true, message: 'Estado de aprobación actualizado.' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarPermiso = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await PermisoService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}