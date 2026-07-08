import { JubiladoModel } from '../models/jubilado.model.js'

export class JubiladoService {
  
  static async obtenerTodos () {
    return await JubiladoModel.getAll()
  }

  static async obtenerPorId (id) {
    const registro = await JubiladoModel.getById(id)
    if (!registro) throw new Error('Registro de jubilado no encontrado')
    return registro
  }

  static async crear (datos) {
    // Validaciones
    if (!datos.empleado_id) throw new Error('El ID del funcionario es requerido')
    if (!datos.porcentaje_jubilacion) throw new Error('El porcentaje de jubilación es requerido')
    if (!datos.fecha_efectiva) throw new Error('La fecha de jubilación es requerida')

    // Validar rango lógico del porcentaje
    if (datos.porcentaje_jubilacion < 1 || datos.porcentaje_jubilacion > 100) {
      throw new Error('El porcentaje debe estar entre 1 y 100')
    }

    // Llamamos al método transaccional del modelo
    return await JubiladoModel.createTransactional(datos)
  }

  static async actualizar (id, datos) {
    const existe = await JubiladoModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    return await JubiladoModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await JubiladoModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    return await JubiladoModel.delete(id)
  }
}