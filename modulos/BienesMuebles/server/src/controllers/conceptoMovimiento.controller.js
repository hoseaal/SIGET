import { ConceptoMovimientoService } from '../services/conceptoMovimiento.service.js'

export const obtenerConceptosMovimiento = async (req, res) => {
  try {
    const conceptos = await ConceptoMovimientoService.obtenerTodos()
    res.json(conceptos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerConceptoMovimiento = async (req, res) => {
  try {
    const concepto = await ConceptoMovimientoService.obtenerPorId(req.params.id)
    res.json(concepto)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}
