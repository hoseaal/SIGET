import { Router } from 'express'
import { ReporteIngresosController } from '../controllers/reporteIngresos.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = Router()

router.get('/generar', authenticate, ReporteIngresosController.generar)

export default router
