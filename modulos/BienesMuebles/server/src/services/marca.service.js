/* eslint-disable camelcase */
import { MarcaModel } from '../models/marca.model.js'

export class MarcaService {
  static async obtenerTodas () {
    return await MarcaModel.getAll()
  }

  static async obtenerTodasAlfabeticamente () {
    return await MarcaModel.getAllAlphabetically()
  }

  static async obtenerPorId (id) {
    const marca = await MarcaModel.getById(id)
    if (!marca) throw new Error('Marca no encontrada')
    return marca
  }

  static async crear ({ mar_ide, mar_mar }) {
    if (!mar_mar) throw new Error('El nombre de la marca es requerido')
    return await MarcaModel.create({ mar_ide, mar_mar })
  }

  static async actualizar (id, { mar_mar }) {
    const existe = await MarcaModel.getById(id)
    if (!existe) throw new Error('Marca no existe')
    return await MarcaModel.update(id, { mar_mar })
  }

  static async eliminar (id) {
    const existe = await MarcaModel.getById(id)
    if (!existe) throw new Error('Marca no existe')
    return await MarcaModel.delete(id)
  }
}
