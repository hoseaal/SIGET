import { statusService } from '../services/status.service.js'

/**
 * Obtiene el tabulador completo de antigüedad.
 * @returns {Promise<object[]>} Lista de años y sus porcentajes.
 */
export const obtenerStatus = async (req, res) => {
    try {
        const todas = await statusService.obtenerTodas();
        res.json(todas)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * @param {object} req.body - Datos de la descripcion a resgistrar 
 */
export const crearStatus = async (req, res) => {
    try {
        const nueva = await statusService.crear(req.body)
        res.status(201).json(nueva)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
/**
 * 
 * @param {number} req.params.id - ID de la descripcion a obtener 
 * @returns {Promise<object[]>}
 */
export const getbyId = async (req, res) => {
    try {
        const { id } = req.params
        const descripcion = await statusService.obtenerPorId(id)
        res.json({ success: descripcion, message: "Obtenido con exito" })
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}

/**
 * 
 * @param {number} req.params.id - ID de la descripcion a actualizar
 * @param {object} req.body 
 */
export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params
        const descripcion = await statusService.actualizar(id, req.body)
        res.json({ success: descripcion, message: "Actualizado con exito" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
/**
 * @param {number} req.params.id - ID de la descripcion a eliminar
 */
export const deleteStatus = async (req, res) => {
    try {
        const { id } = req.params
        const eliminado = await statusService.eliminar(id)
        res.json({ success: eliminado, message: "Eliminado con exito" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}