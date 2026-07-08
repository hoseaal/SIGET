import { CondicionLaboralService } from '../services/condicionLaboral.service.js'

/**
 * Obtiene el catálogo de condiciones laborales.
 * @returns {Promise<object[]>} Lista (Ej: Fijo, Contratado).
 */
export const obtenerCondiciones = async (req, res) => {
  try {
    const condiciones = await CondicionLaboralService.obtenerTodas()
    res.json(condiciones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca una condición laboral por su ID.
 * @param {number} req.params.id - Identificador único (condicion_laboral_id).
 */
export const obtenerCondicion = async (req, res) => {
  try {
    const { id } = req.params
    const condicion = await CondicionLaboralService.obtenerPorId(id)
    res.json(condicion)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Crea una nueva condición laboral.
 * @param {object} req.body - Datos.
 * @param {string} req.body.nombre - Nombre (Ej: "Personal Fijo").
 */
export const crearCondicion = async (req, res) => {
  try {
    const nueva = await CondicionLaboralService.crear(req.body)
    res.status(201).json(nueva)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza la denominación de una condición laboral.
 * @param {number} req.params.id - ID a modificar.
 */
export const actualizarCondicion = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await CondicionLaboralService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarCondicion = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await CondicionLaboralService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}