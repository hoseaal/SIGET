import { CargoOnapreService } from '../services/cargoOnapre.service.js'

/**
 * Obtiene el catálogo completo de Cargos ONAPRE.
 * @returns {Promise<object[]>} Lista de cargos clasificados por ONAPRE.
 */
export const obtenerCargosOnapre = async (req, res) => {
  try {
    const cargos = await CargoOnapreService.obtenerTodos()
    res.json(cargos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca un Cargo ONAPRE específico por su ID.
 * @param {number} req.params.id - Identificador único (ona_ide).
 * @returns {Promise<object>} Objeto con los datos del cargo.
 */
export const obtenerCargoOnapre = async (req, res) => {
  try {
    const { id } = req.params
    const cargo = await CargoOnapreService.obtenerPorId(id)
    res.json(cargo)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Crea un nuevo Cargo ONAPRE en el sistema.
 * @param {object} req.body - Datos del cargo.
 * @param {string} req.body.ona_nom - Nombre del cargo (Ej: "Analista I", "Jefe de División").
 * @returns {Promise<object>} El cargo creado con su ID.
 */
export const crearCargoOnapre = async (req, res) => {
  try {
    const nuevoCargo = await CargoOnapreService.crear(req.body)
    res.status(201).json(nuevoCargo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza la denominación de un Cargo ONAPRE.
 * @param {number} req.params.id - ID del cargo a modificar.
 * @param {object} req.body - Datos nuevos.
 * @param {string} req.body.ona_nom - Nuevo nombre del cargo.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const actualizarCargoOnapre = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await CargoOnapreService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina un Cargo ONAPRE.
 * @param {number} req.params.id - ID del cargo a eliminar.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const eliminarCargoOnapre = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await CargoOnapreService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}