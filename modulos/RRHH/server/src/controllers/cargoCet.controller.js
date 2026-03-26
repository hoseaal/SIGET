import { CargoCetService } from '../services/cargoCet.service.js'

/**
 * Obtiene el catálogo completo de Cargos CET.
 * @returns {Promise<object[]>} Array con todos los cargos CET.
 */
export const obtenerCargosCet = async (req, res) => {
  try {
    const cargos = await CargoCetService.obtenerTodos()
    res.json(cargos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca un Cargo CET específico por su ID.
 * @param {number} req.params.id - Identificador único (cargo_cet_id).
 * @returns {Promise<object>} Objeto con los datos del cargo.
 */
export const obtenerCargoCet = async (req, res) => {
  try {
    const { id } = req.params
    const cargo = await CargoCetService.obtenerPorId(id)
    res.json(cargo)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Crea un nuevo Cargo CET.
 * @param {object} req.body - Datos del cargo.
 * @param {string} req.body.nombre - Nombre del cargo (Requerido).
 * @returns {Promise<object>} El cargo creado con su ID.
 */
export const crearCargoCet = async (req, res) => {
  try {
    const nuevoCargo = await CargoCetService.crear(req.body)
    res.status(201).json(nuevoCargo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza la descripción de un Cargo CET existente.
 * @param {number} req.params.id - ID del cargo a modificar.
 * @param {object} req.body - Datos nuevos.
 * @param {string} req.body.nombre - Nuevo nombre del cargo.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const actualizarCargoCet = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await CargoCetService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina un Cargo CET.
 * @param {number} req.params.id - ID del cargo a eliminar.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const eliminarCargoCet = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await CargoCetService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}