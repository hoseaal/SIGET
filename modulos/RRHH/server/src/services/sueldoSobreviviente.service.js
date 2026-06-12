import { SueldoSobrevivienteModel } from '../models/sueldoSobreviviente.model.js'

export class SueldoSobrevivienteService {
  static async obtenerActual () {
    const sueldo = await SueldoSobrevivienteModel.getOne()
    if (!sueldo) return { message: 'No se ha configurado el sueldo de los sobrevivientes' }
    return sueldo
  }

  static async guardar (data) {
    // Si ya existe uno, teóricamente la UI debería manejar la edición
    // Pero por seguridad podemos validar o simplemente crear
    return await SueldoSobrevivienteModel.create(data)
  }

  static async actualizar (id, data) {
    return await SueldoSobrevivienteModel.update(id, data)
  }

  static async eliminar (id) {
    return await SueldoSobrevivienteModel.delete(id)
  }
}
