import express from 'express'
import {
  obtenerDirecciones,
  obtenerDireccion,
  crearDireccion,
  actualizarDireccion,
  eliminarDireccion
} from '../controllers/direccion.controller.js'

const router = express.Router()

// CRUD Completo para Direcciones
router.get('/', obtenerDirecciones)
router.get('/:id', obtenerDireccion)
router.post('/', crearDireccion)
router.put('/:id', actualizarDireccion)
router.delete('/:id', eliminarDireccion)

export default router