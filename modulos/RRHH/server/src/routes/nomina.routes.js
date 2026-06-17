import { Router } from 'express'
import { NominaController } from '../controllers/nomina.controller.js'
import { authenticate, checkRole } from '../auth/auth.middleware.js'

const router = Router()

router.post('/calcular-en-caliente', authenticate, NominaController.calcularEnCaliente)
router.post('/guardar-cierre', authenticate, checkRole([5, 6, 7]), NominaController.guardarCierre)
router.get('/periodo-objetivo', authenticate, NominaController.obtenerPeriodoObjetivo)
router.get('/verificar-cierre', authenticate, NominaController.verificarCierre)
router.get('/resumen-quincenal', authenticate, NominaController.obtenerResumenQuincenal)

export default router
