import express from 'express'
import {
  obtenerActividades,
  obtenerActividad,
  generarProximoNumero,
  crearActividad,
  actualizarActividad,
  eliminarActividad,
  obtenerEstadisticas
} from '../controllers/actividad.controller.js'
import { authenticate, checkRole } from '../auth/auth.middleware.js'

const router = express.Router()

router.use(authenticate)

// Lectura disponible para todos los roles autenticados (incluye Consulta)
router.get('/', obtenerActividades)
router.get('/estadisticas', obtenerEstadisticas)
router.get('/proximo-numero', generarProximoNumero)
router.get('/:id', obtenerActividad)

// Escritura restringida a Administrador y Tecnico
router.post('/', checkRole(['Administrador', 'Tecnico']), crearActividad)
router.put('/:id', checkRole(['Administrador', 'Tecnico']), actualizarActividad)
router.delete('/:id', checkRole(['Administrador']), eliminarActividad)

export default router
