import express from 'express'
import {
  obtenerClasificaciones,
  obtenerClasificacionesActivas,
  obtenerClasificacion,
  crearClasificacion,
  actualizarClasificacion,
  eliminarClasificacion
} from '../controllers/clasificacion.controller.js'
import { authenticate, checkRole } from '../auth/auth.middleware.js'

const router = express.Router()

router.use(authenticate)

router.get('/', obtenerClasificaciones)
router.get('/activas', obtenerClasificacionesActivas)
router.get('/:id', obtenerClasificacion)
router.post('/', checkRole(['Administrador']), crearClasificacion)
router.put('/:id', checkRole(['Administrador']), actualizarClasificacion)
router.delete('/:id', checkRole(['Administrador']), eliminarClasificacion)

export default router
