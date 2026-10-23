import express from 'express'
import {
  obtenerTipos,
  obtenerTipo,
  crearTipo,
  actualizarTipo,
  eliminarTipo
} from '../controllers/tipoActividad.controller.js'
import { authenticate, checkRole } from '../auth/auth.middleware.js'

const router = express.Router()

router.use(authenticate)

router.get('/', obtenerTipos)
router.get('/:id', obtenerTipo)
router.post('/', checkRole(['Administrador']), crearTipo)
router.put('/:id', checkRole(['Administrador']), actualizarTipo)
router.delete('/:id', checkRole(['Administrador']), eliminarTipo)

export default router
