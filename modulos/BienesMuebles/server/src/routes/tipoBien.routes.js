import express from 'express'
import {
  obtenerTipos,
  obtenerTipo,
  crearTipo,
  actualizarTipo,
  eliminarTipo
} from '../controllers/tipoBien.controller.js'

const router = express.Router()

router.get('/', obtenerTipos)
router.get('/:id', obtenerTipo)
router.post('/', crearTipo)
router.put('/:id', actualizarTipo)
router.delete('/:id', eliminarTipo)

export default router
