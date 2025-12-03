import express from 'express'
import {
  obtenerFuncionarios,
  obtenerFuncionario,
  crearFuncionario,
  actualizarFuncionario,
  eliminarFuncionario
} from '../controllers/funcionario.controller.js'

const router = express.Router()

// GET /?page=1&limit=20&search=juan&pro_ide=2 ...
router.get('/', obtenerFuncionarios) 
router.get('/:id', obtenerFuncionario)
router.post('/', crearFuncionario)
router.put('/:id', actualizarFuncionario)
router.delete('/:id', eliminarFuncionario)

export default router