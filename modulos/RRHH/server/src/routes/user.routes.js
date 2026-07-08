import { Router } from 'express'
import {
  obtenerUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  actualizarClaveUsuario,
  eliminarUsuario,
  registrarConEmpleado
} from '../controllers/user.controller.js'
// Aquí podrías agregar middlewares de autenticación o autorización si lo necesitas
// import { authRequired } from '../middlewares/auth.middleware.js'

const router = Router()

// Obtener todos los usuarios
router.get('/', obtenerUsuarios)

// Registrar nuevo usuario vinculado a empleado
router.post('/registrar-con-empleado', registrarConEmpleado)

// Obtener un solo usuario por ID
router.get('/:id', obtenerUsuario)

// Actualizar datos de un usuario (sin contraseña)
router.put('/:id', actualizarUsuario)

// Actualizar la contraseña de un usuario
router.put('/:id/password', actualizarClaveUsuario)

// Eliminar un usuario
router.delete('/:id', eliminarUsuario)

export default router
