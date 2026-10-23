import express from 'express'
import {
  obtenerBienes,
  obtenerResumenBienes,
  obtenerCatalogosBienes,
  obtenerLookupBienes,
  obtenerBien,
  exportarBienes,
  obtenerMapeoDepartamentos
} from '../controllers/bienes.controller.js'
import {
  obtenerFichaComputo,
  guardarFichaComputo,
  eliminarFichaComputo
} from '../controllers/fichaComputo.controller.js'
import { authenticate, checkRole } from '../auth/auth.middleware.js'

const router = express.Router()

router.use(authenticate)

router.get('/', obtenerBienes)
router.get('/resumen', obtenerResumenBienes)
router.get('/catalogos', obtenerCatalogosBienes)
router.get('/lookup', obtenerLookupBienes)
router.get('/export', exportarBienes)
router.get('/mapeo', obtenerMapeoDepartamentos)

// Ficha tecnica ampliada para computadores
router.get('/:id/ficha', obtenerFichaComputo)
router.put('/:id/ficha', checkRole(['Administrador', 'Tecnico']), guardarFichaComputo)
router.delete('/:id/ficha', checkRole(['Administrador', 'Tecnico']), eliminarFichaComputo)

router.get('/:id', obtenerBien)

export default router
