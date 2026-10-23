import { UsuarioService } from '../services/usuario.service.js'

export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await UsuarioService.obtenerTodos()
    res.json(usuarios)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerUsuario = async (req, res) => {
  try {
    const usuario = await UsuarioService.obtenerPorId(req.params.id)
    res.json(usuario)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crearUsuario = async (req, res) => {
  try {
    const usuario = await UsuarioService.crear(req.body)
    res.status(201).json(usuario)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarUsuario = async (req, res) => {
  try {
    const actualizado = await UsuarioService.actualizar(req.params.id, req.body)
    res.json({ success: actualizado, message: 'Usuario actualizado correctamente.' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarClaveUsuario = async (req, res) => {
  try {
    const actualizado = await UsuarioService.actualizarClave(req.params.id, req.body)
    res.json({ success: actualizado, message: 'Contrasena actualizada correctamente.' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarUsuario = async (req, res) => {
  try {
    const eliminado = await UsuarioService.eliminar(req.params.id)
    res.json({ success: eliminado, message: 'Usuario eliminado correctamente.' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
