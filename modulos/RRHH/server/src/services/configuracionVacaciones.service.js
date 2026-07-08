import { ConfiguracionVacacionesModel } from '../models/configuracionVacaciones.model.js'

export class ConfiguracionVacacionesService {
  static async obtenerTodas() {
    return await ConfiguracionVacacionesModel.getAll()
  }

  static async obtenerPorId(id) {
    const registro = await ConfiguracionVacacionesModel.getById(id)
    if (!registro) throw new Error('Registro de vacaciones no encontrado')
    return registro
  }

  static async crear(datos) {
    if (datos.rango_minimo === undefined || datos.rango_minimo === null || datos.rango_minimo === '') {
      throw new Error('El año de antigüedad (desde) es requerido')
    }
    if (datos.dias_disfrute === undefined || datos.dias_disfrute === null || datos.dias_disfrute === '') {
      throw new Error('Los días de disfrute son requeridos')
    }

    // Asignar pago por defecto de 220 si está vacío o no se proporciona
    const pago = (datos.pago !== undefined && datos.pago !== null && datos.pago !== '') ? datos.pago : '220'

    return await ConfiguracionVacacionesModel.create({
      rango_minimo: datos.rango_minimo,
      rango_maximo: datos.rango_maximo || null,
      dias_disfrute: datos.dias_disfrute,
      pago
    })
  }

  static async actualizar(id, datos) {
    const existe = await ConfiguracionVacacionesModel.getById(id)
    if (!existe) throw new Error('Registro no existe')

    return await ConfiguracionVacacionesModel.update(id, datos)
  }

  static async eliminar(id) {
    const existe = await ConfiguracionVacacionesModel.getById(id)
    if (!existe) throw new Error('Registro no existe')

    return await ConfiguracionVacacionesModel.delete(id)
  }
}
