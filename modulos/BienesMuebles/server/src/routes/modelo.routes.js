import express from 'express'
import {
  obtenerModelos,
  obtenerModelosAlfabeticamente,
  obtenerModelo,
  obtenerModelosPorMarca,
  crearModelo,
  actualizarModelo,
  eliminarModelo
} from '../controllers/modelo.controller.js'

const router = express.Router()

router.get('/', obtenerModelos)
router.get('/alfabeticamente', obtenerModelosAlfabeticamente)
router.get('/:id', obtenerModelo)
router.get('/por-marca/:marId', obtenerModelosPorMarca)
router.post('/', crearModelo)
router.put('/:id', actualizarModelo)
router.delete('/:id', eliminarModelo)

export default router
