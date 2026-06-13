import { InstitucionService } from '../services/institucion.service.js'

export const getAll = async (req, res) => {
  try {
    const { search } = req.query;
    if (search !== undefined) {
      const resultados = await InstitucionService.buscar(search)
      return res.json(resultados)
    }
    const instituciones = await InstitucionService.getAll()
    res.json(instituciones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const create = async (req, res) => {
  try {
    const nueva = await InstitucionService.create(req.body)
    res.status(201).json(nueva)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const update = async (req, res) => {
  try {
    const { id } = req.params
    const success = await InstitucionService.update(id, req.body)
    if (success) {
      res.json({ message: 'Institución actualizada correctamente' })
    } else {
      res.status(404).json({ error: 'Institución no encontrada' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const remove = async (req, res) => {
  try {
    const { id } = req.params
    const success = await InstitucionService.delete(id)
    if (success) {
      res.json({ message: 'Institución eliminada correctamente' })
    } else {
      res.status(404).json({ error: 'Institución no encontrada' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
