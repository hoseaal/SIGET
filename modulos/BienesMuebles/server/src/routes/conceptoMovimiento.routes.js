import express from 'express'
import {
  obtenerConceptosMovimiento,
  obtenerConceptoMovimiento,
  crearConceptoMovimiento,
  actualizarConceptoMovimiento,
  eliminarConceptoMovimiento
} from '../controllers/conceptoMovimiento.controller.js'

const router = express.Router()

router.get('/', obtenerConceptosMovimiento)
router.get('/:id', obtenerConceptoMovimiento)
router.post('/', crearConceptoMovimiento)
router.put('/:id', actualizarConceptoMovimiento)
router.delete('/:id', eliminarConceptoMovimiento)

export default router
