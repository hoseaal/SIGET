import { AntiguedadRegistroModel } from '../models/antiguedadRegistro.model.js'

export class AntiguedadRegistroService {
  
  static async obtenerPorFuncionario (empleado_id) {
    if (!empleado_id) throw new Error('ID del funcionario requerido')
    
    // Obtenemos los registros con el cálculo individual
    const historial = await AntiguedadRegistroModel.getByFuncionarioId(empleado_id)
    
    // Calculamos el total sumando la columna 'anios' que viene del SQL
    // Nota: Number() asegura que sumemos números
    const totalAnios = historial.reduce((acc, curr) => acc + Number(curr.anios), 0)

    return {
      funcionario_id: empleado_id,
      total_anios_acumulados: totalAnios,
      historial
    }
  }

  static async obtenerPorId (id) {
    const registro = await AntiguedadRegistroModel.getById(id)
    if (!registro) throw new Error('Registro no encontrado')
    return registro
  }

  static async crear (datos) {
    if (!datos.empleado_id) throw new Error('El ID del funcionario es requerido')
    if (!datos.fecha_inicio) throw new Error('La fecha de inicio (fecha_inicio) es requerida')

    return await AntiguedadRegistroModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await AntiguedadRegistroModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    return await AntiguedadRegistroModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await AntiguedadRegistroModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    return await AntiguedadRegistroModel.delete(id)
  }
}