import { Router } from 'express'
import {
  obtenerSueldoActual,
  guardarSueldo,
  actualizarSueldo,
  eliminarSueldo
} from '../controllers/sueldoSobreviviente.controller.js'

const router = Router()

router.get('/', obtenerSueldoActual)
router.post('/', guardarSueldo)
router.put('/:id', actualizarSueldo)
router.delete('/:id', eliminarSueldo)

export default router
