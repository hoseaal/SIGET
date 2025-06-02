import { ConceptoMovimientoModel } from '../models/conceptoMovimiento.model.js'

export class ConceptoMovimientoService {
  static async obtenerTodos () {
    return await ConceptoMovimientoModel.getAll()
  }

  static async obtenerPorId (id) {
    const concepto = await ConceptoMovimientoModel.getById(id)
    if (!concepto) throw new Error('Concepto de movimiento no encontrado')
    return concepto
  }
}
