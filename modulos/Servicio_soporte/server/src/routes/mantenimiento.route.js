import { Router } from 'express'
import { MantenimientoController } from '../controllers/mantenimiento.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = Router()

// Todas las rutas de mantenimiento requieren autenticación
router.use(authenticate)

router.get('/', MantenimientoController.getAll)
router.get('/depto/:id', MantenimientoController.getByDepto)
router.post('/', MantenimientoController.create)
router.put('/:id/status', MantenimientoController.updateStatus)

export default router
