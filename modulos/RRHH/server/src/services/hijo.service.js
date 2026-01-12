import { HijoModel } from '../models/hijo.model.js'

export class HijoService {
  
  static async obtenerPorFuncionario (fun_ide) {
    if (!fun_ide) throw new Error('ID del funcionario es requerido')
    return await HijoModel.getByFuncionarioId(fun_ide)
  }

  static async obtenerPorId (id) {
    const hijo = await HijoModel.getById(id)
    if (!hijo) throw new Error('Registro de hijo no encontrado')
    return hijo
  }

  static async crear (datos) {
    // Validaciones de campos obligatorios
    if (!datos.fun_ide) throw new Error('El ID del funcionario es requerido')
    if (!datos.hij_nom || !datos.hij_ape) throw new Error('Nombre y Apellido son requeridos')
    if (!datos.hij_fna) throw new Error('Fecha de nacimiento es requerida')

    return await HijoModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await HijoModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    
    // Validaciones parciales (si envían el campo, no puede estar vacío)
    if ((datos.hij_nom === '') || (datos.hij_ape === '')) {
      throw new Error('Nombre y Apellido no pueden estar vacíos')
    }

    return await HijoModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await HijoModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    
    return await HijoModel.delete(id)
  }
}