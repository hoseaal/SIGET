import { ProfesionModel } from '../models/profesion.model.js'

export class ProfesionService {
  static async obtenerTodas () {
    return await ProfesionModel.getAll()
  }

  static async obtenerPorId (id) {
    const profesion = await ProfesionModel.getById(id)
    if (!profesion) throw new Error('Profesión no encontrada')
    return profesion
  }

  static async crear (datos) {
    if (!datos.pro_nom) throw new Error('El nombre de la profesión es requerido')
    return await ProfesionModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await ProfesionModel.getById(id)
    if (!existe) throw new Error('Profesión no existe')
    
    if (!datos.pro_nom) throw new Error('El nombre es requerido para actualizar')

    return await ProfesionModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await ProfesionModel.getById(id)
    if (!existe) throw new Error('Profesión no existe')
    
    return await ProfesionModel.delete(id)
  }
}