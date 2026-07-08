import { DireccionService } from '../services/direccion.service.js'

/**
 * Obtiene el listado completo de direcciones.
 * No requiere parámetros.
 * @returns {Promise<object[]>} Array con todas las direcciones.
 */
export const obtenerDirecciones = async (req, res) => {
  try {
    const direcciones = await DireccionService.obtenerTodas()
    res.json(direcciones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca una dirección específica por su ID.
 * @param {number} req.params.id - Identificador único de la dirección (direccion_id).
 * @returns {Promise<object>} Objeto con los datos de la dirección encontrada.
 */
export const obtenerDireccion = async (req, res) => {
  try {
    const { id } = req.params
    const direccion = await DireccionService.obtenerPorId(id)
    res.json(direccion)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Crea una nueva dirección en la base de datos.
 * @param {object} req.body - Cuerpo de la petición.
 * @param {string} req.body.nombre - Nombre completo de la dirección (Requerido).
 * @returns {Promise<object>} Objeto de la dirección creada con su nuevo ID.
 */
export const crearDireccion = async (req, res) => {
  try {
    const nuevaDireccion = await DireccionService.crear(req.body)
    res.status(201).json(nuevaDireccion)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza los datos de una dirección existente.
 * Valida que la dirección exista antes de actualizar.
 * @param {number} req.params.id - ID de la dirección a modificar.
 * @param {object} req.body - Datos a actualizar.
 * @param {string} req.body.nombre - Nuevo nombre de la dirección.
 * @returns {Promise<object>} Confirmación de éxito (success: true).
 */
export const actualizarDireccion = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await DireccionService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina una dirección de la base de datos.
 * Verifica existencia antes de eliminar.
 * @param {number} req.params.id - ID de la dirección a eliminar.
 * @returns {Promise<object>} Confirmación de éxito (success: true).
 */
export const eliminarDireccion = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await DireccionService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}