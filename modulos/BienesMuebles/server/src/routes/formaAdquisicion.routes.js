import express from 'express'
import {
  obtenerFormasAdquisicion,
  obtenerFormaAdquisicion
} from '../controllers/formaAdquisicion.controller.js'

const router = express.Router()

router.get('/', obtenerFormasAdquisicion)
router.get('/:id', obtenerFormaAdquisicion)

export default router
