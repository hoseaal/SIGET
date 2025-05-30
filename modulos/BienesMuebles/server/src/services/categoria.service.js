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
}
