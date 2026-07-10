import { PuertosPanelSService } from '../services/puertos_panel_s.service.js'

export const getAll = async (req, res) => {
    try {
        const filas = await PuertosPanelSService.obtenerTodas()
        res.json(filas)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getById = async (req, res) => {
    try {
        const { id } = req.params
        const registro = await PuertosPanelSService.obtenerPorId(id)
        res.json({ 
            success: registro, 
            message: "Puerto de servidor obtenido con éxito" 
        })
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}

export const create = async (req, res) => {
    try {
        const nuevo = await PuertosPanelSService.crear(req.body)
        res.status(201).json(nuevo)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const update = async (req, res) => {
    try {
        const { id } = req.params
        const actualizado = await PuertosPanelSService.actualizar(id, req.body)
        res.json({ success: true, data: actualizado })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const remove = async (req, res) => {
    try {
        const { id } = req.params
        await PuertosPanelSService.eliminar(id)
        res.json({ message: "Puerto de servidor eliminado con éxito" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}