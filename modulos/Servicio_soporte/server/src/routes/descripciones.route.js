import express from 'express'
import {
    obtenerDescripciones,
    getbyId,
    crearDescripcion,
    updateDescripcion,
    deleteDescripcion
} from '../controllers/descripciones.controller.js'

const router = express.Router()

router.get('/', obtenerDescripciones)
router.get('/:id', getbyId)
router.post('/', crearDescripcion)
router.patch('/:id', updateDescripcion)
router.delete('/:id', deleteDescripcion)

export default router