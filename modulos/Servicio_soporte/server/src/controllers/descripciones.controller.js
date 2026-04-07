import {DescripcionesService} from '../services/descripciones.service.js'

/**
 * Obtiene el tabulador completo de antigüedad.
 * @returns {Promise<object[]>} Lista de años y sus porcentajes.
 */
export const obtenerDescripciones = async (req, res) => {
    try {
        const todas = await DescripcionesService.obtenerTodas();
        res.json(todas)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * @param {object} req.body - Datos de la descripcion a resgistrar 
 */
export const crearDescripcion = async (req, res) => {
    try {
        const nueva = await DescripcionesService.crear(req.body)
        res.status(201).json(nueva)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
export const getbyId = async (req, res) => {
    try {
        const { id } = req.params
        const descripcion = await DescripcionesService.obtenerPorId(id)
        res.json({ success: descripcion, message:"descripción obtenida con exito"})
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}
export const updateDescripcion = async (req, res) => {
    try {
        const { id } = req.params
        const descripcion = await DescripcionesService.actualizar(id, req.body)
        res.json({ success: descripcion, message:"descripción actualizada con exito"})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
export const deleteDescripcion = async (req, res) => {
    try {
        const { id } = req.params
        const eliminado = await DescripcionesService.eliminar(id)
        res.json({ success: eliminado, message: "descripción eliminada con exito" })
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}