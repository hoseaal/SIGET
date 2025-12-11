import express from 'express'
import {
  obtenerFuncionarios,
  obtenerFuncionario,
  crearFuncionarioCompleto,
  actualizarFuncionarioCompleto,
  eliminarFuncionario
} from '../controllers/funcionario.controller.js'

const router = express.Router()

// GET /?page=1&limit=20&type=full (full trae datos contractuales)
router.get('/', obtenerFuncionarios)
router.get('/:id', obtenerFuncionario)

// POST y PUT ahora manejan payloads combinados
router.post('/', crearFuncionarioCompleto)
router.put('/:id', actualizarFuncionarioCompleto)

router.delete('/:id', eliminarFuncionario)

export default router