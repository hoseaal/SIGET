import express from 'express'
import {
  obtenerObreros,
  obtenerObrero,
  crearObreroCompleto,
  actualizarObreroCompleto,
  eliminarObrero
} from '../controllers/obrero.controller.js'

const router = express.Router()

router.get('/', obtenerObreros)
router.get('/:id', obtenerObrero)
router.post('/', crearObreroCompleto)
router.put('/:id', actualizarObreroCompleto)
router.delete('/:id', eliminarObrero)

export default router