/* eslint-disable camelcase */
import { ModeloModel } from '../models/modelo.model.js'

export class ModeloService {
  static async obtenerTodos () {
    return await ModeloModel.getAll()
  }

  static async obtenerPorId (id) {
    const modelo = await ModeloModel.getById(id)
    if (!modelo) throw new Error('Modelo no encontrado')
    return modelo
  }

  static async obtenerPorMarca (marId) {
    return await ModeloModel.getByMarca(marId)
  }

  static async crear ({ mod_ide, mod_mod, mar_ide }) {
    if (!mod_mod || !mar_ide) {
      throw new Error('Nombre y marca son requeridos')
    }
    return await ModeloModel.create({ mod_ide, mod_mod, mar_ide })
  }

  static async actualizar (id, datos) {
    const existe = await ModeloModel.getById(id)
    if (!existe) throw new Error('Modelo no existe')
    return await ModeloModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await ModeloModel.getById(id)
    if (!existe) throw new Error('Modelo no existe')
    return await ModeloModel.delete(id)
  }
}
