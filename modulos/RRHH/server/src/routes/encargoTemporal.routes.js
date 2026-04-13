import express from 'express'
import {
  obtenerPorFuncionario,
  obtenerActivo,
  obtenerPorId,
  crearEncargo,
  finalizarEncargo,
  actualizarEncargo,
  eliminarEncargo
} from '../controllers/encargoTemporal.controller.js'

const router = express.Router()

// GET: Historial completo de un funcionario (activos + históricos)
router.get('/funcionario/:empleado_id', obtenerPorFuncionario)

// GET: Solo el encargo activo del funcionario
router.get('/activo/:empleado_id', obtenerActivo)

// CRUD individual
router.get('/:id', obtenerPorId)
router.post('/', crearEncargo)
router.patch('/:id/finalizar', finalizarEncargo)
router.put('/:id', actualizarEncargo)
router.delete('/:id', eliminarEncargo)

export default router
