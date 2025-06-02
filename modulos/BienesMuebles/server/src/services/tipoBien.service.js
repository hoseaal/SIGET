import { TipoBienModel } from '../models/tipoBien.model.js'

export class TipoBienService {
  static async obtenerTodos () {
    return await TipoBienModel.getAll()
  }

  static async obtenerPorId (id) {
    const tipo = await TipoBienModel.getById(id)
    if (!tipo) throw new Error('Tipo de bien no encontrado')
    return tipo
  }

  static async crear (datos) {
    if (!datos.tip_tip) throw new Error('El nombre del tipo es requerido')
    return await TipoBienModel.create(datos)
  }

  static async actualizar (id, datos) {
    if (!datos.tip_tip) throw new Error('El nombre del tipo es requerido')
    await TipoBienModel.update(id, datos)
  }

  static async eliminar (id) {
    await TipoBienModel.delete(id)
  }
}
