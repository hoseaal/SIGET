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
}
