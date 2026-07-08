import { Router } from 'express'
import { buscarRegistro } from '../controllers/empleado.controller.js'

const router = Router()

// Buscar empleados que coincidan y no tengan usuario
router.get('/buscar-registro', buscarRegistro)

export default router
