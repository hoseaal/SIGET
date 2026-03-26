import { EstatusService } from '../services/estatus.service.js'

/**
 * Obtiene el listado completo de estatus disponibles.
 * @returns {Promise<object[]>} Array con todos los estatus.
 */
export const obtenerListaEstatus = async (req, res) => {
  try {
    const lista = await EstatusService.obtenerTodos()
    res.json(lista)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca un estatus específico por su ID.
 * @param {number} req.params.id - Identificador único (estatus_id).
 * @returns {Promise<object>} Objeto con los datos del estatus.
 */
export const obtenerEstatus = async (req, res) => {
  try {
    const { id } = req.params
    const estatus = await EstatusService.obtenerPorId(id)
    res.json(estatus)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Crea un nuevo estatus para funcionarios.
 * @param {object} req.body - Datos del estatus.
 * @param {string} req.body.nombre - Nombre o descripción (Ej: "Activo", "Vacaciones").
 * @returns {Promise<object>} El estatus creado.
 */
export const crearEstatus = async (req, res) => {
  try {
    const nuevoEstatus = await EstatusService.crear(req.body)
    res.status(201).json(nuevoEstatus)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza la descripción de un estatus existente.
 * @param {number} req.params.id - ID del estatus a modificar.
 * @param {object} req.body - Datos nuevos.
 * @param {string} req.body.nombre - Nuevo nombre del estatus.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const actualizarEstatus = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await EstatusService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina un estatus de la base de datos.
 * @param {number} req.params.id - ID del estatus a eliminar.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const eliminarEstatus = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await EstatusService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}