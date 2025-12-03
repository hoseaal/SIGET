import { ProfesionService } from '../services/profesion.service.js'

/**
 * Obtiene el catálogo completo de profesiones.
 * @returns {Promise<object[]>} Array con todas las profesiones registradas.
 */
export const obtenerProfesiones = async (req, res) => {
  try {
    const profesiones = await ProfesionService.obtenerTodas()
    res.json(profesiones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca una profesión por su identificador.
 * @param {number} req.params.id - Identificador único (pro_ide).
 * @returns {Promise<object>} Objeto con los datos de la profesión.
 */
export const obtenerProfesion = async (req, res) => {
  try {
    const { id } = req.params
    const profesion = await ProfesionService.obtenerPorId(id)
    res.json(profesion)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Registra una nueva profesión en el sistema.
 * @param {object} req.body - Datos de la profesión.
 * @param {string} req.body.pro_nom - Nombre de la profesión o título (Requerido).
 * @returns {Promise<object>} La profesión creada con su ID asignado.
 */
export const crearProfesion = async (req, res) => {
  try {
    const nuevaProfesion = await ProfesionService.crear(req.body)
    res.status(201).json(nuevaProfesion)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza el nombre de una profesión existente.
 * @param {number} req.params.id - ID de la profesión a editar.
 * @param {object} req.body - Datos nuevos.
 * @param {string} req.body.pro_nom - Nuevo nombre de la profesión.
 * @returns {Promise<object>} Confirmación de la operación.
 */
export const actualizarProfesion = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await ProfesionService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina una profesión del catálogo.
 * @param {number} req.params.id - ID de la profesión a eliminar.
 * @returns {Promise<object>} Confirmación de la operación.
 */
export const eliminarProfesion = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await ProfesionService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}