import { EstadoUsoModel } from '../models/estadoUso.model.js'

export class EstadoUsoService {
  static async obtenerTodos () {
    return await EstadoUsoModel.getAll()
  }

  static async obtenerPorId (id) {
    const estado = await EstadoUsoModel.getById(id)
    if (!estado) throw new Error('Estado de uso no encontrado')
    return estado
  }
}
