import express from 'express'
import { buscarInstituciones } from '../controllers/institucion.controller.js'

const router = express.Router()

router.get('/', buscarInstituciones)

export default router
