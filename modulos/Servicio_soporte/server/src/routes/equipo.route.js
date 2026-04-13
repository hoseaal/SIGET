import express from 'express'
import { getAll, createFullEquipo, deleteEquipo } from '../controllers/equipo.controller.js'

const router = express.Router()

router.get('/', getAll)
router.post('/', createFullEquipo)
router.delete('/:id', deleteEquipo)

export default router