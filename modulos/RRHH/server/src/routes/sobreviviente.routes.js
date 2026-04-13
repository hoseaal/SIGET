import express from 'express'
import { SobrevivienteController } from '../controllers/sobreviviente.controller.js'

const router = express.Router()

// Rutas principales
router.get('/', SobrevivienteController.getSobrevivientes)
router.get('/:id', SobrevivienteController.getSobrevivienteById)
router.get('/:id/familiares', SobrevivienteController.getFamiliares)
router.post('/', SobrevivienteController.createSobreviviente)
router.post('/:id/familiares', SobrevivienteController.addFamiliar)
router.put('/:id', SobrevivienteController.updateSobreviviente)
router.put('/familiares/:familiarId', SobrevivienteController.updateFamiliar)
router.delete('/familiares/:familiarId', SobrevivienteController.deleteFamiliar)
router.delete('/:id', SobrevivienteController.deleteSobreviviente)

export default router
