import { UnidadService } from '../services/unidad.service.js'

/**
 * Obtiene el listado completo de unidades.
 * @returns {Promise<object[]>} Array con todas las unidades.
 */
export const obtenerUnidades = async (req, res) => {
  try {
    const unidades = await UnidadService.obtenerTodas()
    res.json(unidades)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca una unidad específica por su ID.
 * @param {number} req.params.id - Identificador único de la unidad (unidad_id).
 * @returns {Promise<object>} Objeto con los datos de la unidad encontrada.
 */
export const obtenerUnidad = async (req, res) => {
  try {
    const { id } = req.params
    const unidad = await UnidadService.obtenerPorId(id)
    res.json(unidad)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Crea una nueva unidad vinculada a una división.
 * @param {object} req.body - Cuerpo de la petición.
 * @param {string} req.body.nombre - Nombre de la unidad.
 * @param {number} req.body.division_id - ID de la División (divisiones) a la que pertenece.
 * @returns {Promise<object>} Objeto de la unidad creada.
 */
export const crearUnidad = async (req, res) => {
  try {
    const nuevaUnidad = await UnidadService.crear(req.body)
    res.status(201).json(nuevaUnidad)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza los datos de una unidad existente.
 * @param {number} req.params.id - ID de la unidad a modificar.
 * @param {object} req.body - Datos a actualizar.
 * @param {string} req.body.nombre - Nuevo nombre de la unidad.
 * @param {number} req.body.division_id - Nuevo ID de la división.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const actualizarUnidad = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await UnidadService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina una unidad.
 * @param {number} req.params.id - ID de la unidad a eliminar.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const eliminarUnidad = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await UnidadService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}