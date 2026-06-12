import { Router } from 'express'
import { NominaSobrevivientesController } from '../controllers/nominaSobrevivientes.controller.js'

const router = Router()

router.get('/periodo-objetivo', NominaSobrevivientesController.obtenerPeriodoObjetivo)
router.get('/procesar', NominaSobrevivientesController.procesar)

export default router
