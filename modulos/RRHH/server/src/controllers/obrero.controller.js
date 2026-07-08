import { ObreroService } from '../services/obrero.service.js'

export const obtenerObreros = async (req, res) => {
  try {
    const filtros = req.query
    const resultados = await ObreroService.obtenerConFiltros(filtros)
    res.json(resultados)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerObrero = async (req, res) => {
  try {
    const { id } = req.params
    const obrero = await ObreroService.obtenerPorId(id)
    res.json(obrero)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const crearObreroCompleto = async (req, res) => {
  try {
    const nuevo = await ObreroService.crearCompleto(req.body)
    res.status(201).json(nuevo)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'La Cédula o el RIF ya existen en el sistema.' })
    }
    res.status(400).json({ error: error.message })
  }
}

export const actualizarObreroCompleto = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await ObreroService.actualizarCompleto(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarObrero = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await ObreroService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}