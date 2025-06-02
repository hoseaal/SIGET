import express from 'express'
import {
  obtenerBienes,
  obtenerBien,
  crearBien,
  actualizarBien,
  desincorporarBien,
  buscarAvanzado
} from '../controllers/bienMueble.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = express.Router()

router.get('/', authenticate, obtenerBienes)
router.get('/:id', authenticate, obtenerBien)
router.post('/', authenticate, crearBien)
router.put('/:id', authenticate, actualizarBien)
router.post('/:id/desincorporar', authenticate, desincorporarBien)
router.post('/buscar', authenticate, buscarAvanzado)

export default router
