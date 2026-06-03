import { SubcategoriaModel } from '../models/subcategoria.model.js'

export class SubcategoriaService {
  static async obtenerTodas () {
    return await SubcategoriaModel.getAll()
  }

  static async obtenerPorId (id) {
    const subcategoria = await SubcategoriaModel.getById(id)
    if (!subcategoria) throw new Error('Subcategoría no encontrada')
    return subcategoria
  }

  static async obtenerPorCategoria (catId) {
    return await SubcategoriaModel.getByCategoria(catId)
  }

  static async crear (datos) {
    if (!datos.sca_sca || !datos.cat_ide) {
      throw new Error('Nombre y categoría son requeridos')
    }
    return await SubcategoriaModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await SubcategoriaModel.getById(id)
    if (!existe) throw new Error('Subcategoría no existe')
    return await SubcategoriaModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await SubcategoriaModel.getById(id)
    if (!existe) throw new Error('Subcategoría no existe')
    return await SubcategoriaModel.delete(id)
  }

  static async obtenerPagina ({ page = 1, limit = 10, search = '' }) {
    if (page < 1 || limit < 1) throw new Error('Parámetros de paginación inválidos')
    const result = await SubcategoriaModel.getPage({ page, limit, search })
    return {
      data: result.data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: Number(result.total),
        totalPages: Math.ceil(result.total / limit)
      }
    }
  }
}
