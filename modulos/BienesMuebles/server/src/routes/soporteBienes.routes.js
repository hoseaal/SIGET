import express from 'express'
import {
  obtenerBienesSoporte,
  obtenerResumenSoporte,
  obtenerCatalogosSoporte,
  obtenerLookupSoporte,
  obtenerBienSoporte,
  exportarBienesSoporte
} from '../controllers/soporteBienes.controller.js'
import { requireApiKey } from '../middleware/apiKey.middleware.js'

const router = express.Router()

router.use(requireApiKey)

router.get('/', obtenerBienesSoporte)
router.get('/resumen', obtenerResumenSoporte)
router.get('/catalogos', obtenerCatalogosSoporte)
router.get('/lookup', obtenerLookupSoporte)
router.get('/export', exportarBienesSoporte)
router.get('/:id', obtenerBienSoporte)

export default router
