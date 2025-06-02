import { SubcategoriaService } from '../services/subcategoria.service.js'

export const obtenerSubcategorias = async (req, res) => {
  try {
    const subcategorias = await SubcategoriaService.obtenerTodas()
    res.json(subcategorias)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerSubcategoria = async (req, res) => {
  try {
    const { id } = req.params
    const subcategoria = await SubcategoriaService.obtenerPorId(id)
    res.json(subcategoria)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const obtenerSubcategoriasPorCategoria = async (req, res) => {
  try {
    const { catId } = req.params
    const subcategorias = await SubcategoriaService.obtenerPorCategoria(catId)
    res.json(subcategorias)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const crearSubcategoria = async (req, res) => {
  try {
    const nuevaSubcategoria = await SubcategoriaService.crear(req.body)
    res.status(201).json(nuevaSubcategoria)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarSubcategoria = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await SubcategoriaService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarSubcategoria = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await SubcategoriaService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
