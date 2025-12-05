import { CargoOnapreModel } from '../models/cargoOnapre.model.js'

export class CargoOnapreService {
  static async obtenerTodos () {
    return await CargoOnapreModel.getAll()
  }

  static async obtenerPorId (id) {
    const cargo = await CargoOnapreModel.getById(id)
    if (!cargo) throw new Error('Cargo ONAPRE no encontrado')
    return cargo
  }

  static async crear (datos) {
    if (!datos.ona_nom) throw new Error('El nombre del cargo ONAPRE es requerido')
    return await CargoOnapreModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await CargoOnapreModel.getById(id)
    if (!existe) throw new Error('Cargo ONAPRE no existe')
    
    if (!datos.ona_nom) throw new Error('El nombre es requerido para actualizar')

    return await CargoOnapreModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await CargoOnapreModel.getById(id)
    if (!existe) throw new Error('Cargo ONAPRE no existe')
    
    return await CargoOnapreModel.delete(id)
  }
}