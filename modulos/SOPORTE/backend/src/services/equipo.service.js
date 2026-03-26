/* eslint-disable camelcase */
import { EquipoModel } from '../models/equipo.model.js'

export class EquipoService {
  static async obtenerTodos () {
    return await EquipoModel.getAll()
  }

  static async obtenerPorId (id) {
    const equipo = await EquipoModel.getById(id)
    if (!equipo) throw new Error('Equipo de cómputo no encontrado')
    return equipo
  }

  static async crear (data) {
    if (!data.nro_bien) throw new Error('El nro_bien es requerido')
    return await EquipoModel.create(data)
  }

  static async actualizar (id, data) {
    const existe = await EquipoModel.getById(id)
    if (!existe) throw new Error('Equipo de cómputo no existe')
    return await EquipoModel.update(id, data)
  }

  static async eliminar (id) {
    const existe = await EquipoModel.getById(id)
    if (!existe) throw new Error('Equipo de cómputo no existe')
    return await EquipoModel.delete(id)
  }
}
