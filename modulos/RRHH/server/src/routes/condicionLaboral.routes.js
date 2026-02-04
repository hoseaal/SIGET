import express from 'express'
import {
  obtenerCondiciones,
  obtenerCondicion,
  crearCondicion,
  actualizarCondicion,
  eliminarCondicion
} from '../controllers/condicionLaboral.controller.js'

const router = express.Router()

// CRUD Completo para Condición Laboral
router.get('/', obtenerCondiciones)
router.get('/:id', obtenerCondicion)
router.post('/', crearCondicion)
router.put('/:id', actualizarCondicion)
router.delete('/:id', eliminarCondicion)

export default router