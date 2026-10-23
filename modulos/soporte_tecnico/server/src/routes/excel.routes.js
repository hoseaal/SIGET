import express from 'express'
import {
  exportarSemanal,
  exportarMensual,
  obtenerConsolidadoMensual
} from '../controllers/excel.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = express.Router()

router.use(authenticate)

router.get('/actividades/semanal', exportarSemanal)
router.get('/actividades/mensual', exportarMensual)
router.get('/actividades/consolidado', obtenerConsolidadoMensual)

export default router
