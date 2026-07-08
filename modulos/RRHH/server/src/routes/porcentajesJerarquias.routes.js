import { Router } from 'express'
import {
  obtenerJerarquias,
  obtenerJerarquia,
  crearJerarquia,
  actualizarJerarquia,
  eliminarJerarquia
} from '../controllers/porcentajeJerarquia.controller.js'

const router = Router()

router.get('/', obtenerJerarquias)
router.get('/:id', obtenerJerarquia)
router.post('/', crearJerarquia)
router.put('/:id', actualizarJerarquia)
router.delete('/:id', eliminarJerarquia)

export default router
