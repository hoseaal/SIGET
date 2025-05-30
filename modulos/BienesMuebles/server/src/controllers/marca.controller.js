import { MarcaService } from '../services/marca.service.js'

export const obtenerMarcas = async (req, res) => {
  try {
    const marcas = await MarcaService.obtenerTodas()
    res.json(marcas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerMarca = async (req, res) => {
  try {
    const { id } = req.params
    const marca = await MarcaService.obtenerPorId(id)
    res.json(marca)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crearMarca = async (req, res) => {
  try {
    const nuevaMarca = await MarcaService.crear(req.body)
    res.status(201).json(nuevaMarca)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarMarca = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await MarcaService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarMarca = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await MarcaService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
