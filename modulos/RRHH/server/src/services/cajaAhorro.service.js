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

  static async obtenerReporte({ mes, anio, quincena_no, tipo_personal }) {
    if (!mes || !anio) throw new Error('Mes y año son requeridos');
    return await CajaAhorroModel.getReporte({
      mes: Number(mes),
      anio: Number(anio),
      quincena_no: quincena_no ? Number(quincena_no) : null,
      tipo_personal: tipo_personal || null,
    });
  }

  static async eliminar(id_caja) {
    const eliminado = await CajaAhorroModel.delete(id_caja);
    if (!eliminado) throw new Error('Registro de caja de ahorro no encontrado');
    return true;
  }
}
