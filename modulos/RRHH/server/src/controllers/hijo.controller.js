import { HijoService } from '../services/hijo.service.js'

/**
 * Obtiene la lista de hijos de un funcionario específico.
 * Incluye el cálculo automático de la edad.
 * @param {number} req.params.empleado_id - ID del funcionario (Padre/Madre).
 * @returns {Promise<object[]>} Lista de hijos con su edad actual.
 */
export const obtenerHijosPorFuncionario = async (req, res) => {
  try {
    const { empleado_id } = req.params
    const hijos = await HijoService.obtenerPorFuncionario(empleado_id)
    res.json(hijos)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Busca un hijo por su ID único.
 * @param {number} req.params.id - ID del hijo (hijo_id).
 */
export const obtenerHijo = async (req, res) => {
  try {
    const { id } = req.params
    const hijo = await HijoService.obtenerPorId(id)
    res.json(hijo)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Registra un nuevo hijo en el sistema.
 * @param {object} req.body - Datos del hijo.
 * @param {number} req.body.empleado_id - ID del funcionario padre.
 * @param {string} req.body.nombres - Nombres.
 * @param {string} req.body.apellidos - Apellidos.
 * @param {string} req.body.fecha_nacimiento - Fecha de nacimiento (YYYY-MM-DD).
 * @returns {Promise<object>} Registro creado.
 */
export const crearHijo = async (req, res) => {
  try {
    const nuevo = await HijoService.crear(req.body)
    res.status(201).json(nuevo)
  } catch (error) {
    // Error si el funcionario padre no existe
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'El Funcionario indicado no existe.' })
    }
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza los datos de un hijo.
 * @param {number} req.params.id - ID del hijo a modificar.
 */
export const actualizarHijo = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await HijoService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina el registro de un hijo.
 * @param {number} req.params.id - ID del hijo a eliminar.
 */
export const eliminarHijo = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await HijoService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}