import express from 'express'
import { getTableMetadata } from '../controllers/meta.controller.js'

const router = express.Router()

router.get('/table-metadata', getTableMetadata)

export default router
