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
    if (!datos.prf_nom) throw new Error('La descripción de la prima es requerida')
    
    // Validar que prf_act venga definido y sea número
    if (datos.prf_act === undefined || datos.prf_act === null) {
      throw new Error('El porcentaje actual es requerido')
    }

    return await PrimaProfesionalizacionModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await PrimaProfesionalizacionModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    
    if (!datos.prf_nom || datos.prf_act === undefined) {
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