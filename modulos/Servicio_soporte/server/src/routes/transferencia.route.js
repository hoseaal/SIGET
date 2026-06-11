import { Router } from 'express'
import { TransferenciaController } from '../controllers/transferencia.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = Router()

router.get('/', authenticate, TransferenciaController.getAll)
router.get('/origen/:id', authenticate, TransferenciaController.getByOrigen)
router.delete('/:id', authenticate, TransferenciaController.delete)
router.post('/', authenticate, TransferenciaController.create)
router.put('/:id/status', authenticate, TransferenciaController.updateStatus)

export default router
