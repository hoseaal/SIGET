import { PermisoModel } from '../models/permiso.model.js'

export class PermisoService {
  
  static async obtenerPorFuncionario (empleado_id, estado) {
    if (!empleado_id) throw new Error('ID de funcionario requerido')
    return await PermisoModel.getByFuncionarioId(empleado_id, estado)
  }
  
  static async obtenerPorId (id) {
    const permiso = await PermisoModel.getById(id)
    if (!permiso) throw new Error('Permiso no encontrado')
    return permiso
  }

  static async crear (datos) {
    if (!datos.empleado_id) throw new Error('ID de funcionario requerido')
    if (!datos.motivo) throw new Error('El motivo es requerido')
    if (!datos.fecha_inicio) throw new Error('Fecha de inicio requerida')
    if (!datos.fecha_solicitud) throw new Error('Fecha de solicitud requerida')

    if (datos.fecha_fin) {
      const inicio = new Date(datos.fecha_inicio)
      const fin = new Date(datos.fecha_fin)
      if (fin < inicio) throw new Error('Fecha fin no puede ser anterior a fecha inicio')
    }

    return await PermisoModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await PermisoModel.getById(id)
    if (!existe) throw new Error('Permiso no existe')

    if (datos.fecha_inicio && datos.fecha_fin) {
      const inicio = new Date(datos.fecha_inicio)
      const fin = new Date(datos.fecha_fin)
      if (fin < inicio) throw new Error('Fechas incoherentes')
    }

    return await PermisoModel.update(id, datos)
  }

  static async cambiarEstado (id, estado) {
    if (estado === undefined || (estado !== 0 && estado !== 1)) {
      throw new Error('Estado inválido')
    }
    const existe = await PermisoModel.getById(id)
    if (!existe) throw new Error('Permiso no existe')
    return await PermisoModel.update(id, { esta_aprobado: estado })
  }

  static async eliminar (id) {
    const existe = await PermisoModel.getById(id)
    if (!existe) throw new Error('Permiso no existe')
    return await PermisoModel.delete(id)
  }
}