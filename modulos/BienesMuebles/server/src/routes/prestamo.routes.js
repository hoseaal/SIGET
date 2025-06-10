// src/routes/prestamo.routes.js
import express from 'express'
import {
  crearPrestamo,
  obtenerPrestamos,
  obtenerPrestamoPorId,
  actualizarPrestamo,
  cambiarEstatusPrestamo,
  obtenerBienesPrestadosPorDepartamento,
  checkBienPrestado
} from '../controllers/prestamo.controller.js'
import { authenticate } from '../auth/auth.middleware.js' // Asegúrate de que la ruta sea correcta

const router = express.Router()

// Rutas para préstamos
router.get('/', authenticate, obtenerPrestamos)
router.get('/:id', authenticate, obtenerPrestamoPorId)
router.post('/', authenticate, crearPrestamo)
router.put('/:id', authenticate, actualizarPrestamo) // Para actualizar oficio, fecha, o departamento de destino
router.patch('/:id/estatus', authenticate, cambiarEstatusPrestamo) // Para activar/desactivar un préstamo
router.get('/check-bien/:bim_ide', authenticate, checkBienPrestado)
// Ruta para el reporte de bienes prestados por departamento
router.get('/reporte/por-departamento', authenticate, obtenerBienesPrestadosPorDepartamento)

export default router
