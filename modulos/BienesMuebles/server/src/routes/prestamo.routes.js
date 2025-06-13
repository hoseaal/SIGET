import express from 'express'
import {
  createLoan,
  getNormalLoans,
  getWarehouseItems,
  getLoanById,
  updateLoanStatus,
  checkBienActivelyInvolved
} from '../controllers/prestamo.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = express.Router()

// 1. Endpoint para obtener préstamos normales (activos, excluyendo mal estado en almacén)
router.get('/normales', authenticate, getNormalLoans)

// 2. Endpoint para obtener bienes en almacén (activos, exclusivamente mal estado en almacén)
router.get('/almacen', authenticate, getWarehouseItems)

// 3. Endpoint para obtener un préstamo/movimiento por ID (detalles)
router.get('/:id', authenticate, getLoanById)

// 4. Endpoint para crear un préstamo/movimiento
router.post('/', authenticate, createLoan)

// 5. Endpoint para actualizar el estado de un préstamo (ej. a inactivo/devuelto)
router.patch('/:id/estado', authenticate, updateLoanStatus)

// 6. Endpoint para verificar si un bien está activamente involucrado en un préstamo/movimiento
router.get('/estado-bien/:bim_ide', authenticate, checkBienActivelyInvolved)

export default router
