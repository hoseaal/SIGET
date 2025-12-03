import express from 'express'
import {
  obtenerListaEstatus,
  obtenerEstatus,
  crearEstatus,
  actualizarEstatus,
  eliminarEstatus
} from '../controllers/estatus.controller.js'

const router = express.Router()

// CRUD Completo para Estatus
router.get('/', obtenerListaEstatus)
router.get('/:id', obtenerEstatus)
router.post('/', crearEstatus)
router.put('/:id', actualizarEstatus)
router.delete('/:id', eliminarEstatus)

export default router