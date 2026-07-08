import { NivelSalarialAntiguoModel } from '../models/nivelSalarialAntiguo.model.js'

export class NivelSalarialAntiguoService {
  static async obtenerTodas () {
    return await NivelSalarialAntiguoModel.getAll()
  }

  static async obtenerPorId (id) {
    const nivel = await NivelSalarialAntiguoModel.getById(id)
    if (!nivel) throw new Error('Nivel salarial antiguo no encontrado')
    return nivel
  }

  static async crear (datos) {
    // Validaciones de campos obligatorios
    if (!datos.nombre) throw new Error('El nombre del nivel antiguo es requerido')
    if (!datos.salario_antiguo) throw new Error('El salario base antiguo es requerido')
    if (!datos.cargo_onapre_id) throw new Error('El ID del cargo ONAPRE es requerido')

    return await NivelSalarialAntiguoModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await NivelSalarialAntiguoModel.getById(id)
    if (!existe) throw new Error('Nivel salarial antiguo no existe')
    
    // Auto-completar campos desde el registro existente si no vienen en el payload
    const nombre = datos.nombre !== undefined ? datos.nombre : existe.nombre
    const salario_antiguo = datos.salario_antiguo !== undefined ? datos.salario_antiguo : existe.salario_antiguo
    const cargo_onapre_id = datos.cargo_onapre_id !== undefined ? datos.cargo_onapre_id : existe.cargo_onapre_id

    if (nombre === undefined || salario_antiguo === undefined || cargo_onapre_id === undefined) {
      throw new Error('Nombre, Salario y Cargo ONAPRE son requeridos para actualizar')
    }

    const datosCompletos = { nombre, salario_antiguo, cargo_onapre_id }

    return await NivelSalarialAntiguoModel.update(id, datosCompletos)
  }

  static async eliminar (id) {
    const existe = await NivelSalarialAntiguoModel.getById(id)
    if (!existe) throw new Error('Nivel salarial antiguo no existe')
    
    return await NivelSalarialAntiguoModel.delete(id)
  }
}