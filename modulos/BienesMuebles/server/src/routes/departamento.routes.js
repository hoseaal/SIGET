import express from 'express'
import {
  obtenerDepartamentos,
  obtenerDepartamento
} from '../controllers/departamento.controller.js'

const router = express.Router()

router.get('/', obtenerDepartamentos)
router.get('/:id', obtenerDepartamento)

export default router
