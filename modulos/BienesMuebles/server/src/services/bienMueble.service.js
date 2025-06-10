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

  static async obtenerPagina ({ page = 1, limit = 20, filters = {} }) {
    if (page < 1 || limit < 1) {
      throw new Error('Parámetros de paginación inválidos')
    }

    const result = await BienMuebleModel.getAllPaginated({
      page,
      limit,
      filters
    })

    return {
      data: result.data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: Number(result.total),
        totalPages: Math.ceil(result.total / limit),
        filtersApplied: Object.keys(filters).length > 0 ? filters : null
      }
    }
  }

  static async buscarAvanzado (filters) {
    return await BienMuebleModel.getAll(filters)
  }

  static async buscarPorNombre (searchTerm, { page, limit }) {
    if (!searchTerm.trim()) throw new Error('Término de búsqueda requerido')
    return await BienMuebleModel.searchByNombre(searchTerm, { page, limit })
  }

  static async contarPorDepartamento (departamentoId) {
    return await BienMuebleModel.countByDepartamento(departamentoId)
  }
}
