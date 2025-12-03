import { EstatusModel } from '../models/estatus.model.js'

export class EstatusService {
  static async obtenerTodos () {
    return await EstatusModel.getAll()
  }

  static async obtenerPorId (id) {
    const estatus = await EstatusModel.getById(id)
    if (!estatus) throw new Error('Estatus no encontrado')
    return estatus
  }

  static async crear (datos) {
    if (!datos.est_nom) throw new Error('El nombre del estatus es requerido')
    return await EstatusModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await EstatusModel.getById(id)
    if (!existe) throw new Error('Estatus no existe')
    
    if (!datos.est_nom) throw new Error('El nombre es requerido para actualizar')

    return await EstatusModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await EstatusModel.getById(id)
    if (!existe) throw new Error('Estatus no existe')
    
    return await EstatusModel.delete(id)
  }
}