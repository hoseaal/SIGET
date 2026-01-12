import express from 'express'
import {
  obtenerHijosPorFuncionario,
  obtenerHijo,
  crearHijo,
  actualizarHijo,
  eliminarHijo
} from '../controllers/hijo.controller.js'

const router = express.Router()

// GET: Traer todos los hijos de un funcionario especifico
router.get('/funcionario/:fun_ide', obtenerHijosPorFuncionario)

// CRUD Individual (Por ID del hijo)
router.get('/:id', obtenerHijo)
router.post('/', crearHijo)
router.put('/:id', actualizarHijo)
router.delete('/:id', eliminarHijo)

export default router