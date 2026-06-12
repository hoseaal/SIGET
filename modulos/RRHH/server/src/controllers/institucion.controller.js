import { InstitucionService } from '../services/institucion.service.js'

/**
   * Endpoint GET /api/instituciones?search=...
   * Busca instituciones por coincidencia en nombre o siglas.
   */
export const buscarInstituciones = async (req, res) => {
  try {
    const { search } = req.query
    const resultados = await InstitucionService.buscar(search)
    res.json(resultados)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
