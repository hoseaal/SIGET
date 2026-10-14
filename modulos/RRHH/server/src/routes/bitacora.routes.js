import { Router } from 'express'
import { obtenerBitacora, registrarBitacora } from '../controllers/bitacora.controller.js'

const router = Router()

router.get('/', obtenerBitacora)
router.post('/', registrarBitacora)

export default router
