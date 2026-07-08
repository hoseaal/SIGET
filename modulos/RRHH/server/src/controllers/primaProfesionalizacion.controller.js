import { PrimaProfesionalizacionService } from '../services/primaProfesionalizacion.service.js'

/**
 * Obtiene el catálogo de primas de profesionalización.
 * @returns {Promise<object[]>} Lista de niveles profesionales y sus porcentajes.
 */
export const obtenerPrimasProf = async (req, res) => {
  try {
    const primas = await PrimaProfesionalizacionService.obtenerTodas()
    res.json(primas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca una prima de profesionalización por su ID.
 * @param {number} req.params.id - Identificador único (prima_profesional_id).
 * @returns {Promise<object>} Objeto con los datos de la prima.
 */
export const obtenerPrimaProf = async (req, res) => {
  try {
    const { id } = req.params
    const prima = await PrimaProfesionalizacionService.obtenerPorId(id)
    res.json(prima)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Crea un registro de prima de profesionalización.
 * @param {object} req.body - Datos de la prima.
 * @param {string} req.body.descripcion - Descripción (Ej: "Técnico Superior", "Licenciado").
 * @param {number} req.body.porcentaje_actual - Porcentaje Actual (Requerido).
 * @param {number} [req.body.porcentaje_anterior] - Porcentaje Anterior (Opcional).
 * @returns {Promise<object>} La prima creada.
 */
export const crearPrimaProf = async (req, res) => {
  try {
    const nuevaPrima = await PrimaProfesionalizacionService.crear(req.body)
    res.status(201).json(nuevaPrima)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza los porcentajes o descripción de la prima.
 * @param {number} req.params.id - ID de la prima a modificar.
 * @param {object} req.body - Datos nuevos.
 * @param {string} req.body.descripcion - Nueva descripción.
 * @param {number} req.body.porcentaje_actual - Nuevo porcentaje actual.
 * @param {number} [req.body.porcentaje_anterior] - Nuevo porcentaje anterior.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const actualizarPrimaProf = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await PrimaProfesionalizacionService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina un registro de prima de profesionalización.
 * @param {number} req.params.id - ID a eliminar.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const eliminarPrimaProf = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await PrimaProfesionalizacionService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}