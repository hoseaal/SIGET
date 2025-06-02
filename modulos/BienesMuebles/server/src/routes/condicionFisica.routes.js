import express from 'express'
import {
  obtenerCondicionesFisicas,
  obtenerCondicionFisica
} from '../controllers/condicionFisica.controller.js'

const router = express.Router()

router.get('/', obtenerCondicionesFisicas)
router.get('/:id', obtenerCondicionFisica)

export default router
