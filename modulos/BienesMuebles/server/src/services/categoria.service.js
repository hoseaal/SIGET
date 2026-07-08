import { CategoriaModel } from '../models/categoria.model.js'

export class CategoriaService {
  static async obtenerTodas () {
    return await CategoriaModel.getAll()
  }

  static async obtenerPorId (id) {
    const categoria = await CategoriaModel.getById(id)
    if (!categoria) throw new Error('Categoría no encontrada')
    return categoria
  }

  static async crear (datos) {
    if (!datos.cat_cat) throw new Error('El nombre es requerido')
    return await CategoriaModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await CategoriaModel.getById(id)
    if (!existe) throw new Error('Categoría no existe')
    return await CategoriaModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await CategoriaModel.getById(id)
    if (!existe) throw new Error('Categoría no existe')
    return await CategoriaModel.delete(id)
  }

  static async obtenerPagina ({ page = 1, limit = 10, search = '' }) {
    if (page < 1 || limit < 1) throw new Error('Parámetros de paginación inválidos')
    const result = await CategoriaModel.getPage({ page, limit, search })
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
