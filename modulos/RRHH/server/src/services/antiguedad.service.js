import { AntiguedadModel } from '../models/antiguedad.model.js'

export class AntiguedadService {
  static async obtenerTodas () {
    return await AntiguedadModel.getAll()
  }

  static async obtenerPorId (id) {
    const registro = await AntiguedadModel.getById(id)
    if (!registro) throw new Error('Registro de antigüedad no encontrado')
    return registro
  }

  static async crear (datos) {
    // Validaciones
    if (datos.anios_cumplidos === undefined || datos.anios_cumplidos === null) {
      throw new Error('La cantidad de años (anios_cumplidos) es requerida')
    }
    if (datos.ant_act === undefined || datos.ant_act === null) {
      throw new Error('El porcentaje actual (ant_act) es requerido')
    }

    return await AntiguedadModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await AntiguedadModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    
    // Al actualizar, también validamos que no manden nulls si intentan actualizar esos campos
    if (datos.anios_cumplidos === null || datos.ant_act === null) {
      throw new Error('Años y Porcentaje no pueden ser vacíos')
    }

    return await AntiguedadModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await AntiguedadModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    
    return await AntiguedadModel.delete(id)
  }
}