import { TipoActividadModel } from '../models/tipoActividad.model.js'
import { Validaciones } from '../utils/validations.js'

export class TipoActividadService {
  static async obtenerTodos () {
    return await TipoActividadModel.getAll()
  }

  static async obtenerPorClasificacion (clasificacion_id) {
    if (!clasificacion_id) throw new Error('clasificacion_id es obligatorio')
    return await TipoActividadModel.getByClasificacion(clasificacion_id)
  }

  static async obtenerPorId (id) {
    const tipo = await TipoActividadModel.getById(id)
    if (!tipo) throw new Error('Tipo de actividad no encontrado')
    return tipo
  }

  static async crear (datos) {
    Validaciones.requerido(datos.nombre, 'nombre')
    Validaciones.requerido(datos.clasificacion_id, 'clasificacion_id')
    return await TipoActividadModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await TipoActividadModel.getById(id)
    if (!existe) throw new Error('Tipo de actividad no encontrado')

    Validaciones.requerido(datos.nombre, 'nombre')
    Validaciones.requerido(datos.clasificacion_id, 'clasificacion_id')
    return await TipoActividadModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await TipoActividadModel.getById(id)
    if (!existe) throw new Error('Tipo de actividad no encontrado')
    return await TipoActividadModel.delete(id)
  }
}
