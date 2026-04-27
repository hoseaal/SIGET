import { UnidadModel } from '../models/unidad.model.js'

export class UnidadService {
  static async obtenerTodas () {
    return await UnidadModel.getAll()
  }

  static async obtenerPorId (id) {
    const unidad = await UnidadModel.getById(id)
    if (!unidad) throw new Error('Unidad no encontrada')
    return unidad
  }

  static async crear (datos) {
    if (!datos.nombre) throw new Error('El nombre de la unidad es requerido')
    // Eliminamos validación obligatoria de division_id

    return await UnidadModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await UnidadModel.getById(id)
    if (!existe) throw new Error('Unidad no existe')

    if (!datos.nombre) {
      throw new Error('El nombre es requerido para actualizar')
    }

    return await UnidadModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await UnidadModel.getById(id)
    if (!existe) throw new Error('Unidad no existe')
    
    return await UnidadModel.delete(id)
  }
}