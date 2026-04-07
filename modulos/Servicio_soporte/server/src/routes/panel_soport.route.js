import express from 'express'
import { getAll, getById, update, create, remove } from '../controllers/panel_soport.controller.js'

const router = express.Router()

router.get('/', getAll)
router.get('/:id', getById)
router.patch('/:id', update) // Usamos PATCH para actualizar, aunque el servicio lo maneja igual que crear
router.post('/', create)
router.delete('/:id', remove)

export default router