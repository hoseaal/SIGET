import { DepartamentoModel } from '../models/departamento.model.js'

export class DepartamentoService {
  static async obtenerTodo () {
    return await DepartamentoModel.getAll()
  }

  static async obtenerPorId (id) {
    const departamento = await DepartamentoModel.getById(id)
    if (!departamento) throw new Error('Departamento no encontrado')
    return departamento
  }
}
