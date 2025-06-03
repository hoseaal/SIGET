/* eslint-disable camelcase */
import { BienMuebleModel } from '../models/bienMueble.model.js'
import { Validaciones } from '../utils/validations.js'

export class BienMuebleService {
  static async obtenerTodos (filters = {}) {
    return await BienMuebleModel.getAll(filters)
  }

  static async obtenerPorId (id) {
    const bien = await BienMuebleModel.getById(id)
    if (!bien) throw new Error('Bien mueble no encontrado')
    return bien
  }

  static async crear (datos) {
    Validaciones.validarBienMueble(datos)
    const existe = await BienMuebleModel.getById(datos.bim_ide)
    if (existe) throw new Error('El ID ya está en uso')
    const existe1 = await BienMuebleModel.getByCode(datos.bim_cod)
    if (existe1) throw new Error('El código SUDEBIM ya existe')
    return await BienMuebleModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await BienMuebleModel.getById(id)
    if (!existe) throw new Error('Bien mueble no existe')
    return await BienMuebleModel.update(id, datos)
  }

  static async desincorporar (id, { com_ide, bim_fed }) {
    return await BienMuebleModel.update(id, {
      bim_inc: 0,
      com_ide,
      bim_fed
    })
  }

  static async buscarAvanzado (filters) {
    return await BienMuebleModel.getAll(filters)
  }
}
