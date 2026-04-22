import { TransferenciaModel } from '../models/transferencia.model.js'

export class TransferenciaController {
    static async getAll(req, res) {
        try {
            const data = await TransferenciaModel.getAll()
            res.json(data)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    static async getByOrigen(req, res) {
        try {
            const { id } = req.params
            // Si el ID es 'undefined' o nulo, devolver vacio o error controlado
            if (!id || id === 'undefined') {
                return res.json([])
            }
            const data = await TransferenciaModel.getByOrigen(id)
            res.json(data)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    static async create(req, res) {
        try {
            const { origen_id, destino_id, equipo_id, usuario_id, asunto, observaciones } = req.body

            // Validaciones básicas
            if (!origen_id || !destino_id || !equipo_id || !asunto) {
                return res.status(400).json({ message: 'Todos los campos obligatorios deben ser completados.' })
            }

            const result = await TransferenciaModel.create({
                origen_id,
                destino_id,
                equipo_id,
                usuario_id,
                asunto,
                observaciones
            })

            res.status(201).json({
                message: 'Transferencia registrada con éxito.',
                data: result
            })
        } catch (error) {
            if (error.message === 'El equipo ya tiene una transferencia en curso.') {
                return res.status(409).json({ message: error.message })
            }
            res.status(500).json({ message: error.message })
        }
    }

    static async updateStatus(req, res) {
        try {
            const { id } = req.params
            const { status, usuario_tecnico_id, fecha_recepcion, prioridad, diagnostico_tecnico, solucion_tecnica, fecha_entrega } = req.body

            const success = await TransferenciaModel.updateStatus(id, {
                status,
                usuario_tecnico_id,
                fecha_recepcion,
                prioridad,
                diagnostico_tecnico,
                solucion_tecnica,
                fecha_entrega
            })

            if (!success) {
                return res.status(404).json({ message: 'Transferencia no encontrada o sin cambios.' })
            }

            res.json({ message: 'Estatus y datos actualizados correctamente.' })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}
