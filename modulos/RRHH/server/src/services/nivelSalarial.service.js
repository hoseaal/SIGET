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
    // (el modal de update solo expone salario_base para edición)
    const datosCompletos = {
      nombre: datos.nombre || existe.nombre,
      salario_base: datos.salario_base || existe.salario_base,
      cargo_onapre_id: datos.cargo_onapre_id || existe.cargo_onapre_id
    }

    if (!datosCompletos.nombre || !datosCompletos.salario_base || !datosCompletos.cargo_onapre_id) {
      throw new Error('Nombre, Salario y Cargo ONAPRE son requeridos para actualizar')
    }

    return await NivelSalarialModel.update(id, datosCompletos)
  }

  static async eliminar (id) {
    const existe = await NivelSalarialModel.getById(id)
    if (!existe) throw new Error('Nivel salarial no existe')
    
    return await NivelSalarialModel.delete(id)
  }
}