import express from 'express'
import {
  obtenerCategoriasEspecificas,
  obtenerCategoriaEspecifica,
  obtenerPorSubcategoria,
  crearCategoriaEspecifica,
  actualizarCategoriaEspecifica,
  eliminarCategoriaEspecifica,
  obtenerCategoriasPagina,
  buscarCategorias
} from '../controllers/categoriaEspecifica.controller.js'

const router = express.Router()

router.get('/', obtenerCategoriasEspecificas)
router.get('/pagina', obtenerCategoriasPagina)
router.get('/buscar', buscarCategorias)
router.get('/:id', obtenerCategoriaEspecifica)
router.get('/por-subcategoria/:scaId', obtenerPorSubcategoria)
router.post('/', crearCategoriaEspecifica)
router.put('/:id', actualizarCategoriaEspecifica)
router.delete('/:id', eliminarCategoriaEspecifica)
export default router
