import { HistorialSalarioService } from '../services/historialSalario.service.js'

/**
 * Obtiene el historial de pagos de un funcionario con filtros avanzados.
 * @param {number} req.params.empleado_id - ID del funcionario.
 * @param {string} [req.query.fecha_inicio] - Filtro fecha desde (YYYY-MM-DD).
 * @param {string} [req.query.fecha_fin] - Filtro fecha hasta (YYYY-MM-DD).
 * @param {number} [req.query.page=1] - Página.
 * @param {number} [req.query.limit=20] - Registros por página.
 * @param {string} [req.query.all] - Si 'true', trae todo sin paginar.
 */
export const obtenerHistorialFuncionario = async (req, res) => {
  try {
    const { empleado_id } = req.params
    const filtros = req.query
    
    const resultado = await HistorialSalarioService.obtenerHistorial(empleado_id, filtros)
    res.json(resultado)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ... El resto de métodos (CRUD simple) se mantienen igual ...

export const obtenerRegistroSalario = async (req, res) => {
  try {
    const { id } = req.params
    const registro = await HistorialSalarioService.obtenerPorId(id)
    res.json(registro)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crearRegistroSalario = async (req, res) => {
  try {
    const nuevo = await HistorialSalarioService.crear(req.body)
    res.status(201).json(nuevo)
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'El Funcionario indicado no existe.' })
    }
    res.status(400).json({ error: error.message })
  }
}

export const actualizarRegistroSalario = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await HistorialSalarioService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarRegistroSalario = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await HistorialSalarioService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}