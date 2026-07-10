import { PisoService } from '../services/piso.service.js'

export const getAll = async (req, res) => {
    try {
        const filas = await PisoService.obtenerTodas()
        res.json(filas)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getById = async (req, res) => {
    try {
        const { id } = req.params
        const registro = await PisoService.obtenerPorId(id)
        
        res.json({ 
            success: registro, 
            message: "Registro obtenido con éxito" 
        })
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}

export const create = async (req, res) => {
    try {
        const nuevo = await PisoService.crear(req.body)
        res.status(201).json(nuevo)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const update = async (req, res) => {
    try {
        const { id } = req.params
        const actualizado = await PisoService.actualizar(id, req.body)
        res.json({ success: true, data: actualizado })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const remove = async (req, res) => {
    try {
        const { id } = req.params
        await PisoService.eliminar(id)
        res.json({ message: "Eliminado con éxito" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}