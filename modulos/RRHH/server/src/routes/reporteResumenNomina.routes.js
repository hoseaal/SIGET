import { Router } from 'express'
import { ReporteResumenNominaController } from '../controllers/reporteResumenNomina.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = Router()

router.get('/generar', authenticate, ReporteResumenNominaController.generar)

export default router
