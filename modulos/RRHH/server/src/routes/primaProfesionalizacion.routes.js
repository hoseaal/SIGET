import express from 'express'
import {
  obtenerPrimasProf,
  obtenerPrimaProf,
  crearPrimaProf,
  actualizarPrimaProf,
  eliminarPrimaProf
} from '../controllers/primaProfesionalizacion.controller.js'

const router = express.Router()

// CRUD Completo para Primas de Profesionalización
router.get('/', obtenerPrimasProf)
router.get('/:id', obtenerPrimaProf)
router.post('/', crearPrimaProf)
router.put('/:id', actualizarPrimaProf)
router.delete('/:id', eliminarPrimaProf)

export default router