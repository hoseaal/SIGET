import express from 'express'
import {
  obtenerEstadosUso,
  obtenerEstadoUso
} from '../controllers/estadoUso.controller.js'

const router = express.Router()

router.get('/', obtenerEstadosUso)
router.get('/:id', obtenerEstadoUso)

export default router
