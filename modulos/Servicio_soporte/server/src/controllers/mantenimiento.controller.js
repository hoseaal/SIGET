import { MantenimientoService } from '../services/mantenimiento.service.js'

export class MantenimientoController {
    static async getAll(req, res) {
        try {
            const data = await MantenimientoService.getAll(req.user)
            res.json(data)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    static async getByDepto(req, res) {
        try {
            const { id } = req.params
            const data = await MantenimientoService.getByDepto(id, req.user)
            res.json(data)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    static async create(req, res) {
        try {
            const result = await MantenimientoService.create(req.body)
            res.status(201).json({
                message: 'Solicitud de mantenimiento registrada con éxito.',
                data: result
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    static async updateStatus(req, res) {
        try {
            const { id } = req.params
            const success = await MantenimientoService.updateStatus(id, req.body)

            if (!success) {
                return res.status(404).json({ message: 'Mantenimiento no encontrado o sin cambios.' })
            }

            res.json({ message: 'Estado del mantenimiento actualizado correctamente.' })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}
