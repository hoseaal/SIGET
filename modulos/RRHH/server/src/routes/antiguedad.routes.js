import express from 'express'
import {
  obtenerAntiguedades,
  obtenerAntiguedad,
  crearAntiguedad,
  actualizarAntiguedad,
  eliminarAntiguedad
} from '../controllers/antiguedad.controller.js'

const router = express.Router()

// CRUD Completo para Tabla de Antigüedad
router.get('/', obtenerAntiguedades)
router.get('/:id', obtenerAntiguedad)
router.post('/', crearAntiguedad)
router.put('/:id', actualizarAntiguedad)
router.delete('/:id', eliminarAntiguedad)

export default router