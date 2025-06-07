import { CondicionFisicaModel } from '../models/condicionFisica.model.js'

export class CondicionFisicaService {
  static async obtenerTodas () {
    return await CondicionFisicaModel.getAll()
  }

  static async obtenerPorId (id) {
    const condicion = await CondicionFisicaModel.getById(id)
    if (!condicion) throw new Error('Condición física no encontrada')
    return condicion
  }
}
