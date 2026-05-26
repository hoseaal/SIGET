import { Router } from 'express'
import { MantenimientoController } from '../controllers/mantenimiento.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = Router()

// Todas las rutas de mantenimiento requieren autenticación
router.use(authenticate)

router.get('/', authenticate, MantenimientoController.getAll)
router.get('/depto/:id', authenticate, MantenimientoController.getByDepto)
router.get('/checkToner/:equipoId', authenticate, MantenimientoController.checkToner)
router.post('/', authenticate, MantenimientoController.create)
router.put('/:id/status', authenticate, MantenimientoController.updateStatus)

export default router
