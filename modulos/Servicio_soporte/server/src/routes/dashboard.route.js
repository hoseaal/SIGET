import { Router } from 'express'
import { DashboardController } from '../controllers/dashboard.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = Router()

// Proteger ruta con autenticación
router.use(authenticate)

router.get('/', DashboardController.getSummaryStats)

export default router
