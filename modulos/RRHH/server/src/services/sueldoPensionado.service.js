import { SueldoPensionadoModel } from '../models/sueldoPensionado.model.js'

export class SueldoPensionadoService {
  
  static async obtenerActual () {
    const sueldo = await SueldoPensionadoModel.getOne()
    if (!sueldo) return { mensaje: 'No se ha configurado el sueldo de pensionados', salario_base: 0 }
    return sueldo
  }

  static async guardar (datos) {
    if (!datos.salario_base) throw new Error('El monto del salario es requerido')
    
    // REGLA DE NEGOCIO: Eliminar el anterior antes de crear
    await SueldoPensionadoModel.deleteAll()

    return await SueldoPensionadoModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await SueldoPensionadoModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    
    if (!datos.salario_base) throw new Error('El monto es requerido')

    return await SueldoPensionadoModel.update(id, datos)
  }
}