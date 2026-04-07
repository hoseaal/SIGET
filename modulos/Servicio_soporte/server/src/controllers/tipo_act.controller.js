import {tipo_actService} from '../services/tipo_act.service.js'

/**
 * Obtiene el tabulador completo de antigüedad.
 * @returns {Promise<object[]>} Lista de años y sus porcentajes.
 */
export const obtenerTipo_act = async (req, res) => {
    try {
        const todas = await tipo_actService.obtenerTodas();
        res.json(todas)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * @param {object} req.body - Datos de la actividad a registrar 
 */
export const crearTipo_act = async (req, res) => {
    try {
        const nueva = await tipo_actService.crear(req.body)
        res.status(201).json(nueva)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
export const getbyId = async (req, res) => {
    try {
        const { id } = req.params
        const descripcion = await tipo_actService.obtenerPorId(id)
        res.json({ success: descripcion, message:"Actividad obtenida con exito"})
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}
export const updateTipo_act = async (req, res) => {
    try {
        const { id } = req.params
        const descripcion = await tipo_actService.actualizar(id, req.body)
        res.json({ success: descripcion, message:"Actividad actualizada con exito"})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
export const deleteTipo_act = async (req, res) => {
    try {
        const { id } = req.params
        const eliminado = await tipo_actService.eliminar(id)
        res.json({ success: eliminado, message: "Actividad eliminada con exito" })
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}