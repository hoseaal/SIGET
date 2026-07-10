import { PanelParedService } from '../services/panel_pared.service.js'

export const getAll = async (req, res) => {
    try {
        const filas = await PanelParedService.obtenerTodas()
        res.json(filas)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getById = async (req, res) => {
    try {
        const { id } = req.params
        const registro = await PanelParedService.obtenerPorId(id)
        res.json({ 
            success: registro, 
            message: "Panel de pared obtenido con éxito" 
        })
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}

export const create = async (req, res) => {
    try {
        const nuevo = await PanelParedService.crear(req.body)
        res.status(201).json(nuevo)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const update = async (req, res) => {
    try {
        const { id } = req.params
        const actualizado = await PanelParedService.actualizar(id, req.body)
        res.json({ success: true, data: actualizado })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const remove = async (req, res) => {
    try {
        const { id } = req.params
        await PanelParedService.eliminar(id)
        res.json({ message: "Panel de pared eliminado con éxito" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}