import { ModeloService } from '../services/modelo.service.js'

export const getAll = async (req, res) => {
    try {
        const modelos = await ModeloService.obtenerTodos()
        res.json(modelos)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getById = async (req, res) => {
    try {
        const { id } = req.params
        const modelo = await ModeloService.obtenerPorId(id)
        res.json({ success: modelo, message: "Modelo obtenido con éxito" })
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}

export const create = async (req, res) => {
    try {
        const nuevo = await ModeloService.crear(req.body)
        res.status(201).json({ success: nuevo, message: "Modelo creado" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const update = async (req, res) => {
    try {
        const { id } = req.params
        const actualizado = await ModeloService.actualizar(id, req.body)
        res.json({ success: actualizado, message: "Modelo actualizado" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const remove = async (req, res) => {
    try {
        const { id } = req.params
        await ModeloService.eliminar(id)
        res.json({ message: "Modelo eliminado correctamente" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}