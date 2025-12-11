import express from 'express'
import {
  obtenerPrimas,
  obtenerPrima,
  crearPrima,
  actualizarPrima,
  eliminarPrima
} from '../controllers/prima.controller.js'

const router = express.Router()

// CRUD Completo para Primas
router.get('/', obtenerPrimas)
router.get('/:id', obtenerPrima)
router.post('/', crearPrima)
router.put('/:id', actualizarPrima)
router.delete('/:id', eliminarPrima)

export default router