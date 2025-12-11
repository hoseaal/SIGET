import express from 'express'
import {
  obtenerNivelesAntiguos,
  obtenerNivelAntiguo,
  crearNivelAntiguo,
  actualizarNivelAntiguo,
  eliminarNivelAntiguo
} from '../controllers/nivelSalarialAntiguo.controller.js'

const router = express.Router()

// CRUD Completo para Niveles Salariales Antiguos
router.get('/', obtenerNivelesAntiguos)
router.get('/:id', obtenerNivelAntiguo)
router.post('/', crearNivelAntiguo)
router.put('/:id', actualizarNivelAntiguo)
router.delete('/:id', eliminarNivelAntiguo)

export default router