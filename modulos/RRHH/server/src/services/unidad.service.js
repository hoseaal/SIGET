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
    if (!datos.uni_nom) throw new Error('El nombre de la unidad es requerido')
    if (!datos.div_ide) throw new Error('El ID de la división es requerido')

    return await UnidadModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await UnidadModel.getById(id)
    if (!existe) throw new Error('Unidad no existe')

    if (!datos.uni_nom || !datos.div_ide) {
      throw new Error('Nombre y División son requeridos para actualizar')
    }

    return await UnidadModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await UnidadModel.getById(id)
    if (!existe) throw new Error('Unidad no existe')
    
    return await UnidadModel.delete(id)
  }
}