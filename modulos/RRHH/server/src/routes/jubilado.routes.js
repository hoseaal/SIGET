import express from 'express'
import {
  obtenerJubilados,
  obtenerJubilado,
  crearJubilado,
  actualizarJubilado,
  eliminarJubilado
} from '../controllers/jubilado.controller.js'

const router = express.Router()

// GET: Lista de jubilados con paginación y filtros
// Query params: page, limit, all, search, profesion_id, genero
router.get('/', obtenerJubilados)

// GET: Jubilado completo por jubilado_id (datos personales + laborales + jubilación)
router.get('/:id', obtenerJubilado)

// POST: Registrar jubilado con todos los datos personales, laborales y de jubilación
router.post('/', crearJubilado)

// PUT: Actualizar datos personales, laborales y/o de jubilación por jubilado_id
router.put('/:id', actualizarJubilado)

// DELETE: Eliminar jubilado y su empleado asociado
router.delete('/:id', eliminarJubilado)

export default router