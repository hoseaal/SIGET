import express from 'express'
import {
  obtenerJubilados,
  obtenerJubilado,
  crearJubilado,
  actualizarJubilado,
  eliminarJubilado
} from '../controllers/jubilado.controller.js'

const router = express.Router()

// GET: Lista de jubilados (con datos personales)
router.get('/', obtenerJubilados)

// GET: Jubilado por ID (jubilado_id)
router.get('/:id', obtenerJubilado)

// POST: Registrar jubilación y cambiar estatus a 3
router.post('/', crearJubilado)

// PUT: Editar porcentaje o fecha
router.put('/:id', actualizarJubilado)

// DELETE: Eliminar registro de jubilación
router.delete('/:id', eliminarJubilado)

export default router