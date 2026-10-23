import express from 'express'
import { obtenerDepartamentos, obtenerDepartamento } from '../controllers/departamento.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = express.Router()

router.use(authenticate)

router.get('/', obtenerDepartamentos)
router.get('/:id', obtenerDepartamento)

export default router
