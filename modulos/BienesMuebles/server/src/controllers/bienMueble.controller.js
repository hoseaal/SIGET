import { BienMuebleService } from '../services/bienMueble.service.js'

export const obtenerBienes = async (req, res) => {
  try {
    const filters = req.query
    const bienes = await BienMuebleService.obtenerTodos(filters)
    res.json(bienes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerBien = async (req, res) => {
  try {
    const { id } = req.params
    const bien = await BienMuebleService.obtenerPorId(id)
    if (!bien) {
      return res.status(404).json({ error: 'Bien mueble no encontrado' })
    }
    res.json(bien)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const crearBien = async (req, res) => {
  try {
    const nuevoBien = await BienMuebleService.crear(req.body)
    res.status(201).json(nuevoBien)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarBien = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await BienMuebleService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const desincorporarBien = async (req, res) => {
  try {
    const { id } = req.params
    const result = await BienMuebleService.desincorporar(id, req.body)
    res.json({ success: result })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerBienesPagina = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    // Extraer filtros de los query parameters
    const filters = {
      estado: req.query.estado,
      inc: req.query.inc
      // Agregar más filtros según necesidad
    }
    // Eliminar parámetros de paginación de los filtros
    delete filters.page
    delete filters.limit

    const result = await BienMuebleService.obtenerPagina({
      page,
      limit,
      filters
    })

    res.json({
      data: result.data,
      meta: result.meta
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      details: error.details || null
    })
  }
}

export const buscarAvanzado = async (req, res) => {
  try {
    const bienes = await BienMuebleService.buscarAvanzado(req.body)
    res.json(bienes)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const buscarBienes = async (req, res) => {
  try {
    const { search } = req.query
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const categorias = await BienMuebleService.buscarPorNombre(search, { page, limit })
    res.json(categorias)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
