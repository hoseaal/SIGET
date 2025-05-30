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
}
