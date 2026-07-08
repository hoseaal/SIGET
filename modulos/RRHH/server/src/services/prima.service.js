import { PrimaModel } from '../models/prima.model.js'

export class PrimaService {
  static async obtenerTodas () {
    return await PrimaModel.getAll()
  }

  static async obtenerPorId (id) {
    const prima = await PrimaModel.getById(id)
    if (!prima) throw new Error('Prima no encontrada')
    return prima
  }

  static async crear (datos) {
    // Validaciones
    if (!datos.nombre) throw new Error('El nombre de la prima es requerido')
    
    // Verificamos que no sea undefined o null (0 es un valor válido)
    if (datos.asignacion === undefined || datos.asignacion === null) {
      throw new Error('La asignación de la prima es requerida')
    }

    return await PrimaModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await PrimaModel.getById(id)
    if (!existe) throw new Error('Prima no existe')
    
    if (!datos.nombre || datos.asignacion === undefined) {
      throw new Error('Nombre y Asignación son requeridos para actualizar')
    }

    return await PrimaModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await PrimaModel.getById(id)
    if (!existe) throw new Error('Prima no existe')
    
    return await PrimaModel.delete(id)
  }
}