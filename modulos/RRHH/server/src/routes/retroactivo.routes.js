import { Router } from 'express'
import { RetroactivoController } from '../controllers/retroactivo.controller.js'

const router = Router()

router.get('/empleado/:empleadoId', RetroactivoController.listar)
router.post('/empleado/:empleadoId', RetroactivoController.crear)
router.put('/empleado/:empleadoId/:id', RetroactivoController.actualizar)
router.delete('/:id', RetroactivoController.eliminar)
router.patch('/:id/pagar', RetroactivoController.pagar)

export default router
