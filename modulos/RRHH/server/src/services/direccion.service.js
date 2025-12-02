import { DireccionModel } from '../models/direccion.model.js'

export class DireccionService {
  static async obtenerTodas () {
    return await DireccionModel.getAll()
  }

  static async obtenerPorId (id) {
    const direccion = await DireccionModel.getById(id)
    if (!direccion) throw new Error('Dirección no encontrada')
    return direccion
  }

  static async crear (datos) {
    // Validación básica
    if (!datos.dir_nom) throw new Error('El nombre de la dirección es requerido')
    
    return await DireccionModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await DireccionModel.getById(id)
    if (!existe) throw new Error('Dirección no existe')
    
    // Validación opcional: asegurar que envíen el nombre si es el único campo
    if (!datos.dir_nom) throw new Error('El nombre de la dirección es requerido para actualizar')

    return await DireccionModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await DireccionModel.getById(id)
    if (!existe) throw new Error('Dirección no existe')
    
    return await DireccionModel.delete(id)
  }
}