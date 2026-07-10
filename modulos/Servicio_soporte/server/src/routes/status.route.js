import express from 'express'
import {
    obtenerStatus,
    getbyId,
    crearStatus,
    updateStatus,
    deleteStatus
} from '../controllers/status.controller.js'

const router = express.Router()

router.get('/', obtenerStatus)
router.get('/:id', getbyId)
router.post('/', crearStatus)
router.patch('/:id', updateStatus)
router.delete('/:id', deleteStatus)

export default router