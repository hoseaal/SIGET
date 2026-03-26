import express from 'express'
import {
  obtenerEquipos,
  obtenerEquipo,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo
} from '../controllers/equipo.controller.js'

const router = express.Router()

router.get('/', obtenerEquipos)
router.get('/:id', obtenerEquipo)
router.post('/', crearEquipo)
router.put('/:id', actualizarEquipo)
router.delete('/:id', eliminarEquipo)

export default router
