import express from 'express'
import {
  obtenerSueldoActual,
  guardarSueldo,
  actualizarSueldo
} from '../controllers/sueldoPensionado.controller.js'

const router = express.Router()

// GET: Obtiene el único sueldo configurado
router.get('/', obtenerSueldoActual)

// POST: Define el sueldo (Borra el anterior si existe)
router.post('/', guardarSueldo)

// PUT: Edita el sueldo existente por su ID
router.put('/:id', actualizarSueldo)

export default router