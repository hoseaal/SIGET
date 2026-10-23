import { ClasificacionModel } from '../models/clasificacion.model.js'

export class ClasificacionService {
  static async obtenerTodas () {
    return await ClasificacionModel.getAll()
  }

  static async obtenerActivas () {
    return await ClasificacionModel.getActivas()
  }

  static async obtenerPorId (id) {
    const clasificacion = await ClasificacionModel.getById(id)
    if (!clasificacion) throw new Error('Clasificacion no encontrada')
    return clasificacion
  }

  static async crear (datos) {
    if (!datos.nombre) throw new Error('El nombre es obligatorio')
    return await ClasificacionModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await ClasificacionModel.getById(id)
    if (!existe) throw new Error('Clasificacion no encontrada')
    if (!datos.nombre) throw new Error('El nombre es obligatorio')
    return await ClasificacionModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await ClasificacionModel.getById(id)
    if (!existe) throw new Error('Clasificacion no encontrada')
    return await ClasificacionModel.delete(id)
  }
}
