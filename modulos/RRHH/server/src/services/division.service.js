import { DivisionModel } from '../models/division.model.js'

export class DivisionService {
  static async obtenerTodas () {
    return await DivisionModel.getAll()
  }

  static async obtenerPorId (id) {
    const division = await DivisionModel.getById(id)
    if (!division) throw new Error('División no encontrada')
    return division
  }

  static async crear (datos) {
    // Validar campos obligatorios según la tabla SQL
    if (!datos.nombre) throw new Error('El nombre de la división es requerido')
    if (!datos.direccion_id) throw new Error('El ID de la dirección es requerido')

    return await DivisionModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await DivisionModel.getById(id)
    if (!existe) throw new Error('División no existe')
    
    // Validamos que se envíen datos para actualizar
    if (!datos.nombre || !datos.direccion_id) {
      throw new Error('Nombre y Dirección son requeridos para actualizar')
    }

    return await DivisionModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await DivisionModel.getById(id)
    if (!existe) throw new Error('División no existe')
    
    return await DivisionModel.delete(id)
  }
}