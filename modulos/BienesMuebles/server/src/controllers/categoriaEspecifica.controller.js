import { CategoriaEspecificaService } from '../services/categoriaEspecifica.service.js'

export const obtenerCategoriasEspecificas = async (req, res) => {
  try {
    const categorias = await CategoriaEspecificaService.obtenerTodas()
    res.json(categorias)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerCategoriaEspecifica = async (req, res) => {
  try {
    const { id } = req.params
    const categoria = await CategoriaEspecificaService.obtenerPorId(id)
    res.json(categoria)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const obtenerPorSubcategoria = async (req, res) => {
  try {
    const { scaId } = req.params
    const categorias = await CategoriaEspecificaService.obtenerPorSubcategoria(scaId)
    res.json(categorias)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const crearCategoriaEspecifica = async (req, res) => {
  try {
    const nuevaCategoria = await CategoriaEspecificaService.crear(req.body)
    res.status(201).json(nuevaCategoria)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarCategoriaEspecifica = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await CategoriaEspecificaService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarCategoriaEspecifica = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await CategoriaEspecificaService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
