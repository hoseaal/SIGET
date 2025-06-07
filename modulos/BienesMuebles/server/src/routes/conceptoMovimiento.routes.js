import express from 'express'
import {
  obtenerConceptosMovimiento,
  obtenerConceptoMovimiento
} from '../controllers/conceptoMovimiento.controller.js'

const router = express.Router()

router.get('/', obtenerConceptosMovimiento)
router.get('/:id', obtenerConceptoMovimiento)

export default router
