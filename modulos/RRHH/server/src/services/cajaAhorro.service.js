import { CajaAhorroModel } from '../models/cajaAhorro.model.js';

export class CajaAhorroService {

  static async listarPorEmpleado(empleado_id) {
    if (!empleado_id) throw new Error('ID del empleado requerido');
    return await CajaAhorroModel.findByEmpleado(empleado_id);
  }

  static async listarPorPeriodo(mes, anio, quincena_no) {
    return await CajaAhorroModel.findByPeriodo(mes, anio, quincena_no);
  }

  static async obtenerResumenPeriodo(mes, anio, quincena_no) {
    return await CajaAhorroModel.getTotalByPeriodo(mes, anio, quincena_no);
  }

  static async eliminar(id_caja) {
    const eliminado = await CajaAhorroModel.delete(id_caja);
    if (!eliminado) throw new Error('Registro de caja de ahorro no encontrado');
    return true;
  }
}
