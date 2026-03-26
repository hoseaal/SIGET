import express from 'express'
import {
  obtenerPermisosPorFuncionario, // Renombrado
  obtenerPermiso,
  crearPermiso,
  actualizarPermiso,
  eliminarPermiso,
  cambiarEstadoAprobacion
} from '../controllers/permiso.controller.js'

const router = express.Router()

// GET: Permisos de un funcionario específico
// Acepta query param ?estado=0 (opcional para filtrar pendientes)
router.get('/funcionario/:empleado_id', obtenerPermisosPorFuncionario)

// GET: Permiso individual (Detalle)
router.get('/:id', obtenerPermiso)

// POST: Solicitar permiso
router.post('/', crearPermiso)

// PUT: Actualizar datos
router.put('/:id', actualizarPermiso)

// PATCH: Aprobar/Rechazar (Solo RRHH)
router.patch('/:id/estado', cambiarEstadoAprobacion)

// DELETE: Eliminar solicitud
router.delete('/:id', eliminarPermiso)

export default router