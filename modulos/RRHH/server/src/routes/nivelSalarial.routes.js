import express from 'express'
import {
  obtenerNiveles,
  obtenerNivel,
  crearNivel,
  actualizarNivel,
  eliminarNivel
} from '../controllers/nivelSalarial.controller.js'

const router = express.Router()

// CRUD Completo para Niveles Salariales
router.get('/', obtenerNiveles)
router.get('/:id', obtenerNivel)
router.post('/', crearNivel)
router.put('/:id', actualizarNivel)
router.delete('/:id', eliminarNivel)

export default router