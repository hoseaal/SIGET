import express from 'express'
import {
    obtenerTipo_act,
    getbyId,
    crearTipo_act,
    updateTipo_act,
    deleteTipo_act
} from '../controllers/tipo_act.controller.js'

const router = express.Router()

router.get('/', obtenerTipo_act)
router.get('/:id', getbyId)
router.post('/', crearTipo_act)
router.patch('/:id', updateTipo_act)
router.delete('/:id', deleteTipo_act)

export default router