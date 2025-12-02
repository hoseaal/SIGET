import express from 'express'
import {
  obtenerDivisiones,
  obtenerDivision,
  crearDivision,
  actualizarDivision,
  eliminarDivision
} from '../controllers/division.controller.js'

const router = express.Router()

// CRUD Completo para Divisiones
router.get('/', obtenerDivisiones)
router.get('/:id', obtenerDivision)
router.post('/', crearDivision)
router.put('/:id', actualizarDivision)
router.delete('/:id', eliminarDivision)

export default router