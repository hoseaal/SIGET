import express from 'express'
import {
  obtenerCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} from '../controllers/categoria.controller.js'

const router = express.Router()

// CRUD Completo
router.get('/', obtenerCategorias)
router.get('/:id', obtenerCategoria)
router.post('/', crearCategoria)
router.put('/:id', actualizarCategoria)
router.delete('/:id', eliminarCategoria)

export default router
