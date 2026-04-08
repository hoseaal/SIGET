import express from 'express'
import {
  createLoan,
  getNormalLoans,
  getWarehouseItems,
  getLoanById,
  updateLoanStatus,
  updateStatusBien,
  checkBienActivelyInvolved,
  getNormalLoansPaginated,
  getWarehouseItemsPaginated,
  addBienToPrestamo,
  getActiveBienesForLoan
} from '../controllers/prestamo.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = express.Router()

// ── Rutas estáticas primero (antes de /:id) ────────────────────────────────

// Paginación – listado de préstamos normales paginado (no toca la ruta /normales usada por reportes)
router.get('/normales/pagina', authenticate, getNormalLoansPaginated)

// Paginación – listado de almacén paginado (no toca la ruta /almacen usada por reportes)
router.get('/almacen/pagina', authenticate, getWarehouseItemsPaginated)

// 1. Endpoint para obtener préstamos normales (activos, excluyendo mal estado en almacén)
router.get('/normales', authenticate, getNormalLoans)

// 2. Endpoint para obtener bienes en almacén (activos, exclusivamente mal estado en almacén)
router.get('/almacen', authenticate, getWarehouseItems)

// Verificar si un bien está activamente involucrado en un préstamo/movimiento
router.get('/estado-bien/:bim_ide', authenticate, checkBienActivelyInvolved)

// ── Rutas dinámicas (con parámetro :id) ───────────────────────────────────

// 3. Endpoint para obtener un préstamo/movimiento por ID (detalles)
router.get('/:id', authenticate, getLoanById)

// 4. Endpoint para crear un préstamo/movimiento
router.post('/', authenticate, createLoan)

// 5. Endpoint para actualizar el estado de un préstamo (ej. a inactivo/devuelto)
router.patch('/:id/estado', authenticate, updateLoanStatus)

// 6. Endpoint para actualizar el estado de un solo bien en el detalle de préstamo (dpr_est)
router.patch('/bien/:id/estado', authenticate, updateStatusBien)

// 7. Agregar un bien a un préstamo existente
router.post('/:id/bienes', authenticate, addBienToPrestamo)

// 8. Obtener solo los bienes activos (dpr_est=1) de un préstamo (para el PDF)
router.get('/:id/bienes-activos', authenticate, getActiveBienesForLoan)

export default router
