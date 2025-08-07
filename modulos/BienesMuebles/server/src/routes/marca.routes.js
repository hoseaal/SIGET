import express from 'express'
import {
  obtenerMarcas,
  obtenerMarcasAlfabeticamente,
  obtenerMarca,
  crearMarca,
  actualizarMarca,
  eliminarMarca
} from '../controllers/marca.controller.js'

const router = express.Router()

router.get('/', obtenerMarcas)
router.get('/alfabeticamente', obtenerMarcasAlfabeticamente)
router.get('/:id', obtenerMarca)
router.post('/', crearMarca)
router.put('/:id', actualizarMarca)
router.delete('/:id', eliminarMarca)

export default router
