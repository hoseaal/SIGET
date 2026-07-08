import { CondicionLaboralModel } from '../models/condicionLaboral.model.js'

export class CondicionLaboralService {
  static async obtenerTodas () {
    return await CondicionLaboralModel.getAll()
  }

  static async obtenerPorId (id) {
    const condicion = await CondicionLaboralModel.getById(id)
    if (!condicion) throw new Error('Condición laboral no encontrada')
    return condicion
  }

  static async crear (datos) {
    if (!datos.nombre) throw new Error('El nombre de la condición laboral es requerido')
    return await CondicionLaboralModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await CondicionLaboralModel.getById(id)
    if (!existe) throw new Error('Condición laboral no existe')
    
    if (!datos.nombre) throw new Error('El nombre es requerido para actualizar')

    return await CondicionLaboralModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await CondicionLaboralModel.getById(id)
    if (!existe) throw new Error('Condición laboral no existe')
    
    return await CondicionLaboralModel.delete(id)
  }
}