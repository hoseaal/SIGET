import { EncargoTemporalService } from '../services/encargoTemporal.service.js'

/**
 * GET /api/rrhh/encargos-temporales/funcionario/:empleado_id
 * Historial completo de encargos de un funcionario + encargo activo señalado.
 */
export const obtenerPorFuncionario = async (req, res) => {
  try {
    const { empleado_id } = req.params
    const datos = await EncargoTemporalService.obtenerPorFuncionario(empleado_id)
    res.json(datos)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * GET /api/rrhh/encargos-temporales/activo/:empleado_id
 * Retorna solo el encargo activo del funcionario (o null).
 */
export const obtenerActivo = async (req, res) => {
  try {
    const { empleado_id } = req.params
    const activo = await EncargoTemporalService.obtenerActivo(empleado_id)
    res.json({ encargo_activo: activo })
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * GET /api/rrhh/encargos-temporales/:id
 * Obtiene un encargo por su ID.
 */
export const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params
    const encargo = await EncargoTemporalService.obtenerPorId(id)
    res.json(encargo)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * POST /api/rrhh/encargos-temporales
 * Registra un nuevo encargo temporal activo.
 * Body: { empleado_id, fecha_inicio, cargo_cet_id, cargo_onapre_id,
 *         nivel_salarial_id, nivel_salarial_antiguo_id?,
 *         direccion_id, division_id, unidad_id }
 */
export const crearEncargo = async (req, res) => {
  try {
    const nuevo = await EncargoTemporalService.crear(req.body)
    res.status(201).json(nuevo)
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Uno o más ID referenciados no existen en la base de datos.' })
    }
    res.status(400).json({ error: error.message })
  }
}

/**
 * PATCH /api/rrhh/encargos-temporales/:id/finalizar
 * Finaliza el encargo: registra fecha_fin y cambia estatus a 0.
 * Body: { fecha_fin }
 */
export const finalizarEncargo = async (req, res) => {
  try {
    const { id } = req.params
    const { fecha_fin } = req.body
    const resultado = await EncargoTemporalService.finalizar(id, fecha_fin)
    res.json({ success: resultado, message: 'Encargo temporal finalizado correctamente.' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * PUT /api/rrhh/encargos-temporales/:id
 * Actualiza los datos de un encargo temporal.
 */
export const actualizarEncargo = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await EncargoTemporalService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * DELETE /api/rrhh/encargos-temporales/:id
 * Elimina un encargo temporal.
 */
export const eliminarEncargo = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await EncargoTemporalService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
