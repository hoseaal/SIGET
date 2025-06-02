import express from 'express'
import { generarDocumento } from '../controllers/pdf.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = express.Router()

router.post('/:tipo', authenticate, generarDocumento)

export default router
