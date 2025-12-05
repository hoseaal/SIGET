import express from 'express'
import {
  obtenerDeducciones,
  obtenerDeduccion,
  crearDeduccion,
  actualizarDeduccion,
  eliminarDeduccion
} from '../controllers/deduccion.controller.js'

const router = express.Router()

// CRUD Completo para Deducciones
router.get('/', obtenerDeducciones)
router.get('/:id', obtenerDeduccion)
router.post('/', crearDeduccion)
router.put('/:id', actualizarDeduccion)
router.delete('/:id', eliminarDeduccion)

export default router