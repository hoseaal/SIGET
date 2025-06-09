import express from 'express'
import BienController from '../controllers/excel.controller.js'

const router = express.Router()

router.get('/BM1-sudebim', BienController.generateExcel)

export default router
