import { PrimaProfesionalizacionModel } from '../models/primaProfesionalizacion.model.js'

export class PrimaProfesionalizacionService {
  static async obtenerTodas () {
    return await PrimaProfesionalizacionModel.getAll()
  }

  static async obtenerPorId (id) {
    const prima = await PrimaProfesionalizacionModel.getById(id)
    if (!prima) throw new Error('Prima de profesionalización no encontrada')
    return prima
  }

  static async crear (datos) {
    // Validaciones
    if (!datos.descripcion) throw new Error('La descripción de la prima es requerida')
    
    // Validar que porcentaje_actual venga definido y sea número
    if (datos.porcentaje_actual === undefined || datos.porcentaje_actual === null) {
      throw new Error('El porcentaje actual es requerido')
    }

    return await PrimaProfesionalizacionModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await PrimaProfesionalizacionModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    
    if (!datos.descripcion || datos.porcentaje_actual === undefined) {
      throw new Error('Descripción y Porcentaje Actual son requeridos para actualizar')
    }

    return await PrimaProfesionalizacionModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await PrimaProfesionalizacionModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    
    return await PrimaProfesionalizacionModel.delete(id)
  }
}