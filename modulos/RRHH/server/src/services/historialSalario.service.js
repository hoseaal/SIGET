import { HistorialSalarioModel } from '../models/historialSalario.model.js'

export class HistorialSalarioService {

  static async obtenerHistorial(empleado_id, query = {}) {
    if (!empleado_id) throw new Error('ID de funcionario requerido')

    const rows = await HistorialSalarioModel.findByEmpleado(empleado_id)
    return rows
  }

  static async obtenerPorId(id) {
    const registro = await HistorialSalarioModel.getById(id)
    if (!registro) throw new Error('Registro de salario no encontrado')
    return registro
  }

  static async crear(datos) {
    if (!datos.empleado_id) throw new Error('ID del empleado requerido')
    if (!datos.quincena_no || ![1, 2].includes(Number(datos.quincena_no))) {
      throw new Error('quincena_no debe ser 1 o 2')
    }
    if (!datos.mes || datos.mes < 1 || datos.mes > 12) throw new Error('mes debe estar entre 1 y 12')
    if (!datos.anio) throw new Error('anio requerido')

    const result = await HistorialSalarioModel.upsert({
      empleado_id: datos.empleado_id,
      quincena_no: Number(datos.quincena_no),
      mes: Number(datos.mes),
      anio: Number(datos.anio),
      total_asignaciones: Number(datos.total_asignaciones) || 0,
      total_deducciones: Number(datos.total_deducciones) || 0,
      salario_neto: Number(datos.salario_neto) || 0
    })
    return result
  }

  static async actualizar(id, datos) {
    const existe = await HistorialSalarioModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    return await HistorialSalarioModel.update(id, datos)
  }

  static async eliminar(id) {
    const existe = await HistorialSalarioModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    return await HistorialSalarioModel.delete(id)
  }
}
