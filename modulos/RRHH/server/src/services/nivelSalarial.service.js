import { NivelSalarialModel } from '../models/nivelSalarial.model.js'

export class NivelSalarialService {
  static async obtenerTodos (query = {}) {
    return await NivelSalarialModel.getAll(query.cargo_onapre_id)
  }

  static async obtenerPorId (id) {
    const nivel = await NivelSalarialModel.getById(id)
    if (!nivel) throw new Error('Nivel salarial no encontrado')
    return nivel
  }

  static async crear (datos) {
    // Validaciones de campos obligatorios
    if (!datos.nombre) throw new Error('El nombre del nivel es requerido')
    if (!datos.salario_base) throw new Error('El salario base es requerido')
    if (!datos.cargo_onapre_id) throw new Error('El ID del cargo ONAPRE es requerido')

    return await NivelSalarialModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await NivelSalarialModel.getById(id)
    if (!existe) throw new Error('Nivel salarial no existe')
    
    // Auto-completar campos desde el registro existente si no vienen en el payload
    const nombre = datos.nombre !== undefined ? datos.nombre : existe.nombre
    const salario_base = datos.salario_base !== undefined ? datos.salario_base : existe.salario_base
    const cargo_onapre_id = datos.cargo_onapre_id !== undefined ? datos.cargo_onapre_id : existe.cargo_onapre_id

    if (nombre === undefined || salario_base === undefined || cargo_onapre_id === undefined) {
      throw new Error('Nombre, Salario y Cargo ONAPRE son requeridos para actualizar')
    }

    const datosCompletos = { nombre, salario_base, cargo_onapre_id }

    return await NivelSalarialModel.update(id, datosCompletos)
  }

  static async eliminar (id) {
    const existe = await NivelSalarialModel.getById(id)
    if (!existe) throw new Error('Nivel salarial no existe')
    
    return await NivelSalarialModel.delete(id)
  }
}