import { DeduccionModel } from '../models/deduccion.model.js'

export class DeduccionService {
  static async obtenerTodas () {
    return await DeduccionModel.getAll()
  }

  static async obtenerPorId (id) {
    const deduccion = await DeduccionModel.getById(id)
    if (!deduccion) throw new Error('Deducción no encontrada')
    return deduccion
  }

  static async crear (datos) {
    // Validamos campos obligatorios
    if (!datos.nombre) throw new Error('El nombre de la deducción es requerido')
    if (datos.porcentaje === undefined || datos.porcentaje === null) {
      throw new Error('El porcentaje de la deducción es requerido')
    }
    
    return await DeduccionModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await DeduccionModel.getById(id)
    if (!existe) throw new Error('Deducción no existe')
    
    if (!datos.nombre || datos.porcentaje === undefined) {
      throw new Error('Nombre y Porcentaje son requeridos para actualizar')
    }

    return await DeduccionModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await DeduccionModel.getById(id)
    if (!existe) throw new Error('Deducción no existe')
    
    return await DeduccionModel.delete(id)
  }
}