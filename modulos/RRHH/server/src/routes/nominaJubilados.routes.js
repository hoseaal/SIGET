import { Router } from 'express'
import { NominaJubiladosController } from '../controllers/nominaJubilados.controller.js'

const router = Router()

router.get('/periodo-objetivo', NominaJubiladosController.obtenerPeriodoObjetivo)
router.get('/procesar', NominaJubiladosController.procesar)

export default router
