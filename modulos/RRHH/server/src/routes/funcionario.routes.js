import express from 'express'
import {
  obtenerFuncionarios,
  obtenerFuncionario,
  crearFuncionarioCompleto,
  actualizarFuncionarioCompleto,
  eliminarFuncionario,
  asignarEncargo,
  finalizarEncargo
} from '../controllers/funcionario.controller.js'

const router = express.Router()

// GET /?page=1&limit=20&type=full (full trae datos contractuales)
router.get('/', obtenerFuncionarios)
router.get('/:id', obtenerFuncionario)

// POST y PUT ahora manejan payloads combinados
router.post('/', crearFuncionarioCompleto)
router.put('/:id', actualizarFuncionarioCompleto)

router.delete('/:id', eliminarFuncionario)

// --- SUB-RECURSO: ENCARGOS ---
// POST: Asignar un encargo al funcionario :id
router.post('/:id/encargo', asignarEncargo)

// PUT: Finalizar el encargo activo del funcionario :id
router.put('/:id/encargo/finalizar', finalizarEncargo)

export default router