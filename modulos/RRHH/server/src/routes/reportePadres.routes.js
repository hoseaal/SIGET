import { Router } from 'express'
import { ReportePadresController } from '../controllers/reportePadres.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = Router()

router.get('/generar', authenticate, ReportePadresController.generar)

export default router
