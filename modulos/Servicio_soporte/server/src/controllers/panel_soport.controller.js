import { PanelSoportService } from '../services/panel_soport.service.js'

export const getAll = async (req, res) => {
    try {
        const paneles = await PanelSoportService.obtenerTodos()
        res.json(paneles)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getById = async (req, res) => {
    try {
        const { id } = req.params
        const panel = await PanelSoportService.obtenerPorId(id)
        res.json({ success: panel, message: "Registro encontrado" })
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}

export const create = async (req, res) => {
    try {
        const nuevo = await PanelSoportService.crear(req.body)
        res.status(201).json({ success: nuevo, message: "Panel de soporte registrado" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const update = async (req, res) => {
    try {
        const { id } = req.params
        const  panel= await PanelSoportService.actualizar(id, req.body)
        res.json({ success: panel, message:"Registro actualizado con exito"})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const remove = async (req, res) => {
    try {
        const { id } = req.params
        await PanelSoportService.eliminar(id)
        res.json({ message: "Panel de soporte eliminado con éxito" })
    } catch (error) {
        // Si no existe, el servicio lanza el error y aquí lo enviamos con 404 o 400
        res.status(404).json({ error: error.message })
    }
}