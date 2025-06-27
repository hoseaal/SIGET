import express from 'express'
import {
  obtenerBienes,
  obtenerBien,
  crearBien,
  actualizarBien,
  desincorporarBien,
  buscarAvanzado,
  obtenerBienesPagina,
  buscarBienes,
  contarBienes
} from '../controllers/bienMueble.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = express.Router()

router.get('/', authenticate, obtenerBienesPagina)
router.get('/all', authenticate, obtenerBienes)
router.get('/des', authenticate, buscarBienes)
router.get('/count', authenticate, contarBienes)
router.get('/:id', authenticate, obtenerBien)
router.post('/', authenticate, crearBien)
router.put('/:id', authenticate, actualizarBien)
router.put('/:id/desincorporar', authenticate, desincorporarBien)
router.post('/buscar', authenticate, buscarAvanzado)

export default router
