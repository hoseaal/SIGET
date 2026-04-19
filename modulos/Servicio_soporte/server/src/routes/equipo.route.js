import express from 'express'
import { getAll, createFullEquipo, deleteEquipo, updateFullEquipo } from '../controllers/equipo.controller.js'

const router = express.Router()

router.get('/', getAll)
router.post('/', createFullEquipo)
router.patch('/:id', updateFullEquipo)
router.delete('/:id', deleteEquipo)

export default router