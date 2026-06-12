import { ConfiguracionVacacionesObrerosModel } from '../models/configuracionVacacionesObreros.model.js'

export class ConfiguracionVacacionesObrerosService {
  static async obtenerTodas() {
    return await ConfiguracionVacacionesObrerosModel.getAll()
  }

  static async obtenerPorId(id) {
    const registro = await ConfiguracionVacacionesObrerosModel.getById(id)
    if (!registro) throw new Error('Registro de vacaciones de obreros no encontrado')
    return registro
  }

  static async crear(datos) {
    if (datos.anio === undefined || datos.anio === null || datos.anio === '') {
      throw new Error('El año es requerido')
    }
    if (datos.dias_disfrute === undefined || datos.dias_disfrute === null || datos.dias_disfrute === '') {
      throw new Error('Los días de disfrute son requeridos')
    }
    if (datos.pago === undefined || datos.pago === null || datos.pago === '') {
      throw new Error('El pago es requerido')
    }

    return await ConfiguracionVacacionesObrerosModel.create({
      anio: datos.anio,
      dias_disfrute: datos.dias_disfrute,
      pago: datos.pago
    })
  }

  static async actualizar(id, datos) {
    const existe = await ConfiguracionVacacionesObrerosModel.getById(id)
    if (!existe) throw new Error('Registro no existe')

    return await ConfiguracionVacacionesObrerosModel.update(id, datos)
  }

  static async eliminar(id) {
    const existe = await ConfiguracionVacacionesObrerosModel.getById(id)
    if (!existe) throw new Error('Registro no existe')

    return await ConfiguracionVacacionesObrerosModel.delete(id)
  }
}
