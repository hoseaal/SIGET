import { Router } from 'express'
import { TransferenciaController } from '../controllers/transferencia.controller.js'

const router = Router()

router.get('/', TransferenciaController.getAll)
router.get('/origen/:id', TransferenciaController.getByOrigen)
router.post('/', TransferenciaController.create)
router.put('/:id/status', TransferenciaController.updateStatus)

export default router
