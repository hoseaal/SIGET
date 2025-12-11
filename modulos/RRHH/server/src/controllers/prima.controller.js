import { PrimaService } from '../services/prima.service.js'

/**
 * Obtiene el catálogo de primas disponibles.
 * @returns {Promise<object[]>} Lista de primas con sus porcentajes.
 */
export const obtenerPrimas = async (req, res) => {
  try {
    const primas = await PrimaService.obtenerTodas()
    res.json(primas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca una prima específica por su ID.
 * @param {number} req.params.id - Identificador único (pri_ide).
 * @returns {Promise<object>} Objeto con los datos de la prima.
 */
export const obtenerPrima = async (req, res) => {
  try {
    const { id } = req.params
    const prima = await PrimaService.obtenerPorId(id)
    res.json(prima)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Registra una nueva prima en el sistema.
 * @param {object} req.body - Datos de la prima.
 * @param {string} req.body.pri_nom - Nombre de la prima (Ej: "Prima por Hijos").
 * @param {number} req.body.pri_por - Porcentaje asignado (Ej: 12.50).
 * @returns {Promise<object>} La prima creada.
 */
export const crearPrima = async (req, res) => {
  try {
    const nuevaPrima = await PrimaService.crear(req.body)
    res.status(201).json(nuevaPrima)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza los datos de una prima existente.
 * @param {number} req.params.id - ID de la prima a modificar.
 * @param {object} req.body - Datos nuevos.
 * @param {string} req.body.pri_nom - Nuevo nombre.
 * @param {number} req.body.pri_por - Nuevo porcentaje.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const actualizarPrima = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await PrimaService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina una prima del sistema.
 * @param {number} req.params.id - ID de la prima a eliminar.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const eliminarPrima = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await PrimaService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}