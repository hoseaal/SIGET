import { tipo_equipoService } from '../services/tipo_equipo.Service.js'

export const getAll = async (req, res) => {
    try {
        const filas = await tipo_equipoService.obtenerTodas()
        res.json(filas)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getById = async (req, res) => {
    try {
        const { id } = req.params
        // Llamamos al servicio (ej. CategoriasService, TipoTonerService, etc.)
        const registro = await tipo_equipoService.obtenerPorId(id)
        
        res.json({ 
            success: registro, 
            message: "Registro obtenido con éxito" 
        })
    } catch (error) {
        // Si el servicio lanza "Registro no encontrado", cae aquí con un 404
        res.status(404).json({ error: error.message })
    }
}

export const create = async (req, res) => {
    try {
        const nuevo = await tipo_equipoService.crear(req.body)
        res.status(201).json(nuevo)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const update = async (req, res) => {
    try {
        const { id } = req.params
        const actualizado = await tipo_equipoService.actualizar(id, req.body)
        res.json({ success: true, data: actualizado })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const remove = async (req, res) => {
    try {
        const { id } = req.params
        await tipo_equipoService.eliminar(id)
        res.json({ message: "Eliminado con éxito" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}