import express from 'express'
import {
  obtenerSueldoActual,
  guardarSueldo,
  actualizarSueldo,
  eliminarSueldo
} from '../controllers/sueldoPensionado.controller.js'

const router = express.Router()

// GET: Obtiene el único sueldo configurado
router.get('/', obtenerSueldoActual)

// POST: Define el sueldo (Borra el anterior si existe)
router.post('/', guardarSueldo)

// PUT: Edita el sueldo existente por su ID
router.put('/:id', actualizarSueldo)

// DELETE: Elimina el sueldo existente por su ID
router.delete('/:id', eliminarSueldo)

export default router