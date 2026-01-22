import { PermisoModel } from '../models/permiso.model.js'

export class PermisoService {
  
  static async obtenerPorFuncionario (fun_ide, estado) {
    if (!fun_ide) throw new Error('ID de funcionario requerido')
    return await PermisoModel.getByFuncionarioId(fun_ide, estado)
  }
  
  static async obtenerPorId (id) {
    const permiso = await PermisoModel.getById(id)
    if (!permiso) throw new Error('Permiso no encontrado')
    return permiso
  }

  static async crear (datos) {
    if (!datos.fun_ide) throw new Error('ID de funcionario requerido')
    if (!datos.per_mot) throw new Error('El motivo es requerido')
    if (!datos.per_fin) throw new Error('Fecha de inicio requerida')
    if (!datos.per_fsol) throw new Error('Fecha de solicitud requerida')

    if (datos.per_ffe) {
      const inicio = new Date(datos.per_fin)
      const fin = new Date(datos.per_ffe)
      if (fin < inicio) throw new Error('Fecha fin no puede ser anterior a fecha inicio')
    }

    return await PermisoModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await PermisoModel.getById(id)
    if (!existe) throw new Error('Permiso no existe')

    if (datos.per_fin && datos.per_ffe) {
      const inicio = new Date(datos.per_fin)
      const fin = new Date(datos.per_ffe)
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
    return await PermisoModel.update(id, { per_apr: estado })
  }

  static async eliminar (id) {
    const existe = await PermisoModel.getById(id)
    if (!existe) throw new Error('Permiso no existe')
    return await PermisoModel.delete(id)
  }
}