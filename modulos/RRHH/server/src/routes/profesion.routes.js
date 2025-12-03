import express from 'express'
import {
  obtenerProfesiones,
  obtenerProfesion,
  crearProfesion,
  actualizarProfesion,
  eliminarProfesion
} from '../controllers/profesion.controller.js'

const router = express.Router()

// CRUD Completo para Profesiones
router.get('/', obtenerProfesiones)
router.get('/:id', obtenerProfesion)
router.post('/', crearProfesion)
router.put('/:id', actualizarProfesion)
router.delete('/:id', eliminarProfesion)

export default router