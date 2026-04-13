import { PuertosService } from '../services/puertos.service.js'

export const getAll = async (req, res) => {
    try {
        const filas = await PuertosService.obtenerTodas()
        res.json(filas)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getById = async (req, res) => {
    try {
        const { id } = req.params
        const registro = await PuertosService.obtenerPorId(id)
        res.json({ 
            success: registro, 
            message: "Puerto obtenido con éxito" 
        })
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}

export const create = async (req, res) => {
    try {
        const nuevo = await PuertosService.crear(req.body)
        res.status(201).json(nuevo)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const update = async (req, res) => {
    try {
        const { id } = req.params
        const actualizado = await PuertosService.actualizar(id, req.body)
        res.json({ success: true, data: actualizado })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const remove = async (req, res) => {
    try {
        const { id } = req.params
        await PuertosService.eliminar(id)
        res.json({ message: "Puerto eliminado con éxito" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}