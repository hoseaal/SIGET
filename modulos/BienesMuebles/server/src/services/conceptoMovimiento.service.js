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

  static async crear (datos) {
    if (!datos.com_com) throw new Error('El nombre es requerido')
    return await ConceptoMovimientoModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await ConceptoMovimientoModel.getById(id)
    if (!existe) throw new Error('Concepto de movimiento no existe')
    return await ConceptoMovimientoModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await ConceptoMovimientoModel.getById(id)
    if (!existe) throw new Error('Concepto de movimiento no existe')
    return await ConceptoMovimientoModel.delete(id)
  }
}
