import { ModeloService } from '../services/modelo.service.js'

export const obtenerModelos = async (req, res) => {
  try {
    const modelos = await ModeloService.obtenerTodos()
    res.json(modelos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerModelo = async (req, res) => {
  try {
    const { id } = req.params
    const modelo = await ModeloService.obtenerPorId(id)
    res.json(modelo)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const obtenerModelosPorMarca = async (req, res) => {
  try {
    const { marId } = req.params
    const modelos = await ModeloService.obtenerPorMarca(marId)
    res.json(modelos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const crearModelo = async (req, res) => {
  try {
    const nuevoModelo = await ModeloService.crear(req.body)
    res.status(201).json(nuevoModelo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarModelo = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await ModeloService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarModelo = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await ModeloService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
