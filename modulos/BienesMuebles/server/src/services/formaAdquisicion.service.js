import { FormaAdquisicionModel } from '../models/formaAdquisicion.model.js'

export class FormaAdquisicionService {
  static async obtenerTodas () {
    return await FormaAdquisicionModel.getAll()
  }

  static async obtenerPorId (id) {
    const forma = await FormaAdquisicionModel.getById(id)
    if (!forma) throw new Error('Forma de adquisición no encontrada')
    return forma
  }
}
