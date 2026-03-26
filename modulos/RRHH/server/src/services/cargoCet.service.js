import { CargoCetModel } from '../models/cargoCet.model.js'

export class CargoCetService {
  static async obtenerTodos () {
    return await CargoCetModel.getAll()
  }

  static async obtenerPorId (id) {
    const cargo = await CargoCetModel.getById(id)
    if (!cargo) throw new Error('Cargo CET no encontrado')
    return cargo
  }

  static async crear (datos) {
    if (!datos.nombre) throw new Error('El nombre del cargo CET es requerido')
    return await CargoCetModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await CargoCetModel.getById(id)
    if (!existe) throw new Error('Cargo CET no existe')
    
    if (!datos.nombre) throw new Error('El nombre es requerido para actualizar')

    return await CargoCetModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await CargoCetModel.getById(id)
    if (!existe) throw new Error('Cargo CET no existe')
    
    return await CargoCetModel.delete(id)
  }
}