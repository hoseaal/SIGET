import express from 'express'
import {
  obtenerCargosCet,
  obtenerCargoCet,
  crearCargoCet,
  actualizarCargoCet,
  eliminarCargoCet
} from '../controllers/cargoCet.controller.js'

const router = express.Router()

// CRUD Completo para Cargos CET
router.get('/', obtenerCargosCet)
router.get('/:id', obtenerCargoCet)
router.post('/', crearCargoCet)
router.put('/:id', actualizarCargoCet)
router.delete('/:id', eliminarCargoCet)

export default router