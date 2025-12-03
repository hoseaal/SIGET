
import express from 'express'
import {
  obtenerUnidades,
  obtenerUnidad,
  crearUnidad,
  actualizarUnidad,
  eliminarUnidad
} from '../controllers/unidad.controller.js'

const router = express.Router()

// CRUD Completo para Unidades
router.get('/', obtenerUnidades)
router.get('/:id', obtenerUnidad)
router.post('/', crearUnidad)
router.put('/:id', actualizarUnidad)
router.delete('/:id', eliminarUnidad)

export default router