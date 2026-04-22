import { Router } from 'express'
import {
  obtenerUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  actualizarClaveUsuario,
  eliminarUsuario,
  obtenerRoles
} from '../controllers/user.controller.js'
// Aquí podrías agregar middlewares de autenticación o autorización si lo necesitas
// import { authRequired } from '../middlewares/auth.middleware.js'

const router = Router()

// Obtener todos los usuarios
router.get('/', obtenerUsuarios)

// Obtener todos los roles
router.get('/roles', obtenerRoles)

// Obtener un solo usuario por ID
router.get('/:id', obtenerUsuario)

// Actualizar datos de un usuario (sin contraseña)
router.put('/:id', actualizarUsuario)

// Actualizar la contraseña de un usuario
router.put('/:id/password', actualizarClaveUsuario)

// Eliminar un usuario
router.delete('/:id', eliminarUsuario)

export default router
