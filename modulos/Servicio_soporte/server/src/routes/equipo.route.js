import express from 'express'
import { getAll, createFullEquipo, deleteEquipo, updateFullEquipo } from '../controllers/equipo.controller.js'
import { validateSchema } from '../middlewares/validateSchema.js'
import { createEquipoSchema } from '../utils/schemas/equipoSchema.js'

const router = express.Router()

router.get('/', getAll)
router.post('/', validateSchema(createEquipoSchema), createFullEquipo)
router.patch('/:id', validateSchema(createEquipoSchema), updateFullEquipo)
router.delete('/:id', deleteEquipo)

export default router