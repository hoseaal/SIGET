import { DivisionService } from '../services/division.service.js'

/**
 * Obtiene el listado completo de divisiones.
 * @returns {Promise<object[]>} Array con todas las divisiones.
 */
export const obtenerDivisiones = async (req, res) => {
  try {
    const divisiones = await DivisionService.obtenerTodas()
    res.json(divisiones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca una división específica por su ID.
 * @param {number} req.params.id - Identificador único de la división (division_id).
 * @returns {Promise<object>} Objeto con los datos de la división encontrada.
 */
export const obtenerDivision = async (req, res) => {
  try {
    const { id } = req.params
    const division = await DivisionService.obtenerPorId(id)
    res.json(division)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Crea una nueva división vinculada a una dirección.
 * @param {object} req.body - Cuerpo de la petición.
 * @param {string} req.body.nombre - Nombre de la división.
 * @param {number} req.body.direccion_id - ID de la Dirección (direcciones) a la que pertenece.
 * @returns {Promise<object>} Objeto de la división creada.
 */
export const crearDivision = async (req, res) => {
  try {
    const nuevaDivision = await DivisionService.crear(req.body)
    res.status(201).json(nuevaDivision)
  } catch (error) {
    // Captura errores como FK no existente o datos faltantes
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza los datos de una división existente.
 * @param {number} req.params.id - ID de la división a modificar.
 * @param {object} req.body - Datos a actualizar.
 * @param {string} req.body.nombre - Nuevo nombre de la división.
 * @param {number} req.body.direccion_id - Nuevo ID de dirección (opcional/requerido según lógica).
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const actualizarDivision = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await DivisionService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina una división.
 * Nota: Puede fallar si hay tablas hijas referenciando esta división (Integridad referencial).
 * @param {number} req.params.id - ID de la división a eliminar.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const eliminarDivision = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await DivisionService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}