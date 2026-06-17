import { Router } from 'express'
import { ReportePagosController } from '../controllers/reportePagos.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = Router()

router.get('/generar', authenticate, ReportePagosController.generar)

export default router
