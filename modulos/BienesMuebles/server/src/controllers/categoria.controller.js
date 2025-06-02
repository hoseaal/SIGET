import { CategoriaService } from '../services/categoria.service.js'

export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await CategoriaService.obtenerTodas()
    res.json(categorias)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerCategoria = async (req, res) => {
  try {
    const { id } = req.params
    const categoria = await CategoriaService.obtenerPorId(id)
    res.json(categoria)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crearCategoria = async (req, res) => {
  try {
    const nuevaCategoria = await CategoriaService.crear(req.body)
    res.status(201).json(nuevaCategoria)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await CategoriaService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await CategoriaService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
