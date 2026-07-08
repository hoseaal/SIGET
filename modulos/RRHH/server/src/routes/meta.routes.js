import express from 'express'
import { getTableMetadata, getRoles, getModulos } from '../controllers/meta.controller.js'

const router = express.Router()

router.get('/table-metadata', getTableMetadata)
// Catálogos para selects en formularios de administración
router.get('/roles', getRoles)
router.get('/modulos', getModulos)

export default router
