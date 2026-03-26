import { NivelSalarialModel } from '../models/nivelSalarial.model.js'

export class NivelSalarialService {
  static async obtenerTodos () {
    return await NivelSalarialModel.getAll()
  }

  static async obtenerPorId (id) {
    const nivel = await NivelSalarialModel.getById(id)
    if (!nivel) throw new Error('Nivel salarial no encontrado')
    return nivel
  }

  static async crear (datos) {
    // Validaciones de campos obligatorios
    if (!datos.niv_nom) throw new Error('El nombre del nivel es requerido')
    if (!datos.salario_base) throw new Error('El salario base es requerido')
    if (!datos.cargo_onapre_id) throw new Error('El ID del cargo ONAPRE es requerido')

    return await NivelSalarialModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await NivelSalarialModel.getById(id)
    if (!existe) throw new Error('Nivel salarial no existe')
    
    if (!datos.niv_nom || !datos.salario_base || !datos.cargo_onapre_id) {
      throw new Error('Nombre, Salario y Cargo ONAPRE son requeridos para actualizar')
    }

    return await NivelSalarialModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await NivelSalarialModel.getById(id)
    if (!existe) throw new Error('Nivel salarial no existe')
    
    return await NivelSalarialModel.delete(id)
  }
}