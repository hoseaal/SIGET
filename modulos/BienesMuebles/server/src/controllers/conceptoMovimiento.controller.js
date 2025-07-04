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

export const crearConceptoMovimiento = async (req, res) => {
  try {
    const nuevoConcepto = await ConceptoMovimientoService.crear(req.body)
    res.status(201).json(nuevoConcepto)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const actualizarConceptoMovimiento = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await ConceptoMovimientoService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarConceptoMovimiento = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await ConceptoMovimientoService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
