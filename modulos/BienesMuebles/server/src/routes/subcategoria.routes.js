import express from 'express'
import {
  obtenerSubcategorias,
  obtenerSubcategoria,
  obtenerSubcategoriasPorCategoria,
  crearSubcategoria,
  actualizarSubcategoria,
  eliminarSubcategoria
} from '../controllers/subcategoria.controller.js'

const router = express.Router()

// CRUD Completo
router.get('/', obtenerSubcategorias)
router.get('/:id', obtenerSubcategoria)
router.get('/por-categoria/:catId', obtenerSubcategoriasPorCategoria)
router.post('/', crearSubcategoria)
router.put('/:id', actualizarSubcategoria)
router.delete('/:id', eliminarSubcategoria)

export default router
