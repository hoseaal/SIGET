import { PorcentajeJerarquiaModel } from '../models/porcentajeJerarquia.model.js'

export class PorcentajeJerarquiaService {
  static async obtenerTodas () {
    return await PorcentajeJerarquiaModel.getAll()
  }

  static async obtenerPorId (id) {
    const jerarquia = await PorcentajeJerarquiaModel.getById(id)
    if (!jerarquia) throw new Error('Jerarquía no encontrada')
    return jerarquia
  }

  static async crear (datos) {
    if (!datos.cargo) throw new Error('El cargo es requerido')
    if (datos.porcentaje === undefined || datos.porcentaje === null) {
      throw new Error('El porcentaje es requerido')
    }

    return await PorcentajeJerarquiaModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await PorcentajeJerarquiaModel.getById(id)
    if (!existe) throw new Error('Jerarquía no existe')
    
    if (!datos.cargo || datos.porcentaje === undefined) {
      throw new Error('Cargo y Porcentaje son requeridos para actualizar')
    }

    return await PorcentajeJerarquiaModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await PorcentajeJerarquiaModel.getById(id)
    if (!existe) throw new Error('Jerarquía no existe')
    
    return await PorcentajeJerarquiaModel.delete(id)
  }
}
