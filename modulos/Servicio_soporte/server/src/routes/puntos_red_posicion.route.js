import { Router } from 'express'
import { PuntosRedPosicionModel } from '../models/puntos_red_posicion.model.js'

const router = Router()

// Obtener puntos posicionados por croquis_id
router.get('/croquis/:croquisId', async (req, res) => {
    try {
        const { croquisId } = req.params
        const puntos = await PuntosRedPosicionModel.getByCroquisId(croquisId)
        res.json(puntos)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})

// Obtener puertos disponibles por piso
router.get('/disponibles/piso/:pisoId', async (req, res) => {
    try {
        const { pisoId } = req.params
        const currentPuertoId = req.query.currentPuertoId ? parseInt(req.query.currentPuertoId) : null
        const puertos = await PuntosRedPosicionModel.getAvailablePuertosByPiso(pisoId, currentPuertoId)
        res.json(puertos)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})

// Crear un nuevo punto posicionado
router.post('/', async (req, res) => {
    try {
        const { croquis_id, puerto_id, x_pct, y_pct } = req.body
        if (!croquis_id || !puerto_id || x_pct == null || y_pct == null) {
            return res.status(400).json({ error: 'Faltan campos requeridos (croquis_id, puerto_id, x_pct, y_pct)' })
        }

        const punto = await PuntosRedPosicionModel.create({
            croquis_id: parseInt(croquis_id),
            puerto_id: parseInt(puerto_id),
            x_pct: parseFloat(x_pct),
            y_pct: parseFloat(y_pct)
        })

        res.status(201).json({ success: true, data: punto })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message || 'Error al posicionar puerto en el croquis' })
    }
})

// Actualizar posición o asignación de puerto
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { puerto_id, x_pct, y_pct } = req.body

        if (!puerto_id || x_pct == null || y_pct == null) {
            return res.status(400).json({ error: 'Faltan campos requeridos (puerto_id, x_pct, y_pct)' })
        }

        const punto = await PuntosRedPosicionModel.update(id, {
            puerto_id: parseInt(puerto_id),
            x_pct: parseFloat(x_pct),
            y_pct: parseFloat(y_pct)
        })

        res.json({ success: true, data: punto })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})

// Eliminar un punto posicionado
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const success = await PuntosRedPosicionModel.delete(id)
        if (!success) {
            return res.status(404).json({ error: 'Punto no encontrado' })
        }
        res.json({ success: true, message: 'Punto eliminado' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})

export default router
