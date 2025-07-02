import { UserService } from '../services/user.service.js'

export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await UserService.obtenerTodos()
    res.json(usuarios)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = await UserService.obtenerPorId(id)
    res.json(usuario)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await UserService.actualizar(id, req.body)
    res.json({ success: actualizado, message: 'Usuario actualizado correctamente.' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarClaveUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await UserService.actualizarClave(id, req.body)
    res.json({ success: actualizado, message: 'Contraseña actualizada correctamente.' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await UserService.eliminar(id)
    res.json({ success: eliminado, message: 'Usuario eliminado correctamente.' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
