import { AntiguedadRegistroModel } from '../models/antiguedadRegistro.model.js'

export class AntiguedadRegistroService {
  
  static async obtenerPorFuncionario (fun_ide) {
    if (!fun_ide) throw new Error('ID del funcionario requerido')
    
    // Obtenemos los registros con el cálculo individual
    const historial = await AntiguedadRegistroModel.getByFuncionarioId(fun_ide)
    
    // Calculamos el total sumando la columna 'anios' que viene del SQL
    // Nota: Number() asegura que sumemos números
    const totalAnios = historial.reduce((acc, curr) => acc + Number(curr.anios), 0)

    return {
      funcionario_id: fun_ide,
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
    if (!datos.fun_ide) throw new Error('El ID del funcionario es requerido')
    if (!datos.ant_fin) throw new Error('La fecha de inicio (ant_fin) es requerida')

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