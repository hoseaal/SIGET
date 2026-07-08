import { Router } from 'express'
import { NominaPensionadosController } from '../controllers/nominaPensionados.controller.js'

const router = Router()

router.get('/periodo-objetivo', NominaPensionadosController.obtenerPeriodoObjetivo)
router.get('/procesar', NominaPensionadosController.procesar)

export default router
