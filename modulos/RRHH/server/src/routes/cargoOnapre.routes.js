import express from 'express'
import {
  obtenerCargosOnapre,
  obtenerCargoOnapre,
  crearCargoOnapre,
  actualizarCargoOnapre,
  eliminarCargoOnapre
} from '../controllers/cargoOnapre.controller.js'

const router = express.Router()

// CRUD Completo para Cargos ONAPRE
router.get('/', obtenerCargosOnapre)
router.get('/:id', obtenerCargoOnapre)
router.post('/', crearCargoOnapre)
router.put('/:id', actualizarCargoOnapre)
router.delete('/:id', eliminarCargoOnapre)

export default router