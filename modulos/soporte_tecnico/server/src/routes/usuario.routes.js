import express from 'express'
import {
  obtenerUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  actualizarClaveUsuario,
  eliminarUsuario
} from '../controllers/usuario.controller.js'
import { authenticate, checkRole } from '../auth/auth.middleware.js'

const router = express.Router()

router.use(authenticate)
router.use(checkRole(['Administrador']))

router.get('/', obtenerUsuarios)
router.get('/:id', obtenerUsuario)
router.post('/', crearUsuario)
router.put('/:id', actualizarUsuario)
router.put('/:id/password', actualizarClaveUsuario)
router.delete('/:id', eliminarUsuario)

export default router
