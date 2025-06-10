import express from 'express'
import {
  obtenerBien,
  crearBien,
  actualizarBien,
  desincorporarBien,
  buscarAvanzado,
  obtenerBienesPagina,
  buscarBienes,
  contarBienesPorDepartamento
} from '../controllers/bienMueble.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = express.Router()

router.get('/', authenticate, obtenerBienesPagina)
router.get('/des', authenticate, buscarBienes)
router.get('/count-dep/:id', authenticate, contarBienesPorDepartamento)
router.get('/:id', authenticate, obtenerBien)
router.post('/', authenticate, crearBien)
router.put('/:id', authenticate, actualizarBien)
router.post('/:id/desincorporar', authenticate, desincorporarBien)
router.post('/buscar', authenticate, buscarAvanzado)

export default router
