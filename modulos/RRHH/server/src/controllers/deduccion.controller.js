import { DeduccionService } from '../services/deduccion.service.js'

/**
 * Obtiene el listado completo de deducciones configuradas.
 * @returns {Promise<object[]>} Array con las deducciones.
 */
export const obtenerDeducciones = async (req, res) => {
  try {
    const deducciones = await DeduccionService.obtenerTodas()
    res.json(deducciones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca una deducción por su ID.
 * @param {number} req.params.id - Identificador único (deduccion_id).
 * @returns {Promise<object>} Objeto con los datos de la deducción.
 */
export const obtenerDeduccion = async (req, res) => {
  try {
    const { id } = req.params
    const deduccion = await DeduccionService.obtenerPorId(id)
    res.json(deduccion)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Crea una nueva deducción.
 * @param {object} req.body - Datos de la deducción.
 * @param {string} req.body.nombre - Nombre de la deducción (Ej: "Seguro Social").
 * @param {number} req.body.porcentaje - Porcentaje a aplicar (Ej: 4.00).
 * @returns {Promise<object>} La deducción creada.
 */
export const crearDeduccion = async (req, res) => {
  try {
    const nuevaDeduccion = await DeduccionService.crear(req.body)
    res.status(201).json(nuevaDeduccion)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza una deducción existente.
 * @param {number} req.params.id - ID de la deducción a modificar.
 * @param {object} req.body - Datos nuevos.
 * @param {string} req.body.nombre - Nuevo nombre.
 * @param {number} req.body.porcentaje - Nuevo porcentaje.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const actualizarDeduccion = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await DeduccionService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina una deducción.
 * @param {number} req.params.id - ID de la deducción a eliminar.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const eliminarDeduccion = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await DeduccionService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}