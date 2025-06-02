import { TipoBienService } from '../services/tipoBien.service.js'

export const obtenerTipos = async (req, res) => {
  try {
    const tipos = await TipoBienService.obtenerTodos()
    res.json(tipos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerTipo = async (req, res) => {
  try {
    const tipo = await TipoBienService.obtenerPorId(req.params.id)
    res.json(tipo)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crearTipo = async (req, res) => {
  try {
    const nuevoTipo = await TipoBienService.crear(req.body)
    res.status(201).json(nuevoTipo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarTipo = async (req, res) => {
  try {
    await TipoBienService.actualizar(req.params.id, req.body)
    res.status(204).end()
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarTipo = async (req, res) => {
  try {
    await TipoBienService.eliminar(req.params.id)
    res.status(204).end()
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
