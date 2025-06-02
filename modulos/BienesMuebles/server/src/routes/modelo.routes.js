import express from 'express'
import {
  obtenerModelos,
  obtenerModelo,
  obtenerModelosPorMarca,
  crearModelo,
  actualizarModelo,
  eliminarModelo
} from '../controllers/modelo.controller.js'

const router = express.Router()

router.get('/', obtenerModelos)
router.get('/:id', obtenerModelo)
router.get('/por-marca/:marId', obtenerModelosPorMarca)
router.post('/', crearModelo)
router.put('/:id', actualizarModelo)
router.delete('/:id', eliminarModelo)

export default router
