import { Router } from 'express'
import { ReportePrimasController } from '../controllers/reportePrimas.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = Router()

router.get('/generar', authenticate, ReportePrimasController.generar)

export default router
