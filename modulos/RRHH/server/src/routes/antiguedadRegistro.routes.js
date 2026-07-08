import express from 'express'
import {
  obtenerPorFuncionario,
  obtenerRegistro,
  crearRegistro,
  actualizarRegistro,
  eliminarRegistro
} from '../controllers/antiguedadRegistro.controller.js'

const router = express.Router()

// GET: Historial de antigüedad de un funcionario (Calculado)
router.get('/funcionario/:empleado_id', obtenerPorFuncionario)

// CRUD Individual
router.get('/:id', obtenerRegistro)
router.post('/', crearRegistro)
router.put('/:id', actualizarRegistro)
router.delete('/:id', eliminarRegistro)

export default router