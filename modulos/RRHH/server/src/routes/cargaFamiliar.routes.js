import express from 'express'
import {
  obtenerCargaFamiliar,
  crearCargaFamiliar,
  actualizarCargaFamiliar,
  eliminarCargaFamiliar
} from '../controllers/cargaFamiliar.controller.js'

const router = express.Router()

router.get('/empleado/:empleado_id', obtenerCargaFamiliar)
router.post('/', crearCargaFamiliar)
router.put('/:id', actualizarCargaFamiliar)
router.delete('/:id', eliminarCargaFamiliar)

export default router