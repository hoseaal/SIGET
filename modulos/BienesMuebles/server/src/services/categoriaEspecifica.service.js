import { CategoriaEspecificaModel } from '../models/categoriaEspecifica.model.js'

export class CategoriaEspecificaService {
  static async obtenerTodas () {
    return await CategoriaEspecificaModel.getAll()
  }

  static async obtenerPorId (id) {
    const categoria = await CategoriaEspecificaModel.getById(id)
    if (!categoria) throw new Error('Categoría específica no encontrada')
    return categoria
  }

  static async obtenerPorSubcategoria (scaId) {
    return await CategoriaEspecificaModel.getBySubcategoria(scaId)
  }

  static async crear (datos) {
    if (!datos.cae_cae || !datos.sca_ide) {
      throw new Error('Nombre y subcategoría son requeridos')
    }
    return await CategoriaEspecificaModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await CategoriaEspecificaModel.getById(id)
    if (!existe) throw new Error('Categoría específica no existe')
    return await CategoriaEspecificaModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await CategoriaEspecificaModel.getById(id)
    if (!existe) throw new Error('Categoría específica no existe')
    return await CategoriaEspecificaModel.delete(id)
  }

  static async obtenerPagina ({ page, limit }) {
    if (page < 1 || limit < 1) throw new Error('Parámetros de paginación inválidos')

    const result = await CategoriaEspecificaModel.getAllPaginated({ page, limit })

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

  static async buscarPorNombre (searchTerm, { page, limit }) {
    if (!searchTerm || !searchTerm.trim()) {
      return await this.obtenerPagina({ page, limit })
    }
    const result = await CategoriaEspecificaModel.searchByNombre(searchTerm, { page, limit })
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
