import express from 'express'
import BienController from '../controllers/excel.controller.js'
import { authenticate } from '../auth/auth.middleware.js'

const router = express.Router()

router.get('/BM1-sudebim', authenticate, BienController.generateExcel)
router.get('/BM1', authenticate, BienController.generateBM1Report)
router.get('/acta-verificacion', authenticate, BienController.generateActaVerificacionExcel)

export default router
