import express from 'express'
import { getTableMetadata, getTiposUsuario, getModulosAcceso } from '../controllers/meta.controller.js'

const router = express.Router()

router.get('/table-metadata', getTableMetadata)
// Catálogos para selects en formularios de administración
router.get('/tipos-usuario', getTiposUsuario)
router.get('/modulos-acceso', getModulosAcceso)

export default router
