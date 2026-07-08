/* eslint-disable camelcase */
import { NominaPensionadosModel } from '../models/nominaPensionados.model.js'
import { NominaPersistenceService } from './nominaPersistence.service.js'

export class NominaPensionadosService {
  static tipoPersonal = 'Pensionado'
  static async generarNomina(mes, anio, quincena) {
    const pensionados = await NominaPensionadosModel.getPensionadosData()

    const results = pensionados.map(pen => {
      // La pensión viene de la tabla sueldos_pensionados
      const pension = parseFloat(pen.pension_base) || 0

      // Pensión por incapacidad = pension / 2
      const pension_incapacidad = pension / 2

      // Total asignaciones = pension por incapacidad (Según requerimiento literal)
      // Nota: Si se requiere sumar la pensión base, se debería ajustar aquí.
      const total_asignaciones = pension_incapacidad

      // Caja de aporte empleado y patrono = pension por incapacidad* 10%
      const caja_aporte_empleado_patrono = pension_incapacidad * 0.10


      // Total deducciones = caja de aporte empleado y patrono (se asume el del empleado)
      const total_deducciones = caja_aporte_empleado_patrono

      // Sueldo Neto
      const sueldo_neto = total_asignaciones - total_deducciones

      return {
        empleado_id: pen.empleado_id,
        cedula: pen.cedula,
        nombre_completo: `${pen.nombres} ${pen.apellidos}`,
        cargo: pen.cargo_cet_nombre || pen.cargo_onapre_nombre || 'N/A',
        pension: this.round(pension),
        pension_incapacidad: this.round(pension_incapacidad),
        total_asignaciones: this.round(total_asignaciones),
        caja_aporte_empleado_patrono: this.round(caja_aporte_empleado_patrono),
        total_deducciones: this.round(total_deducciones),
        sueldo_neto: this.round(sueldo_neto),
        cuenta_bancaria: pen.cuenta_bancaria
      }
    })

    return results
  }

  static round(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100
  }

  static normalizarRegistro(item) {
    return {
      empleado_id: item.empleado_id,
      total_asignaciones: item.total_asignaciones,
      total_deducciones: item.total_deducciones,
      salario_neto: item.sueldo_neto,
      monto_caja: Number(item.caja_aporte_empleado_patrono || 0),
      aporte_empleado: item.caja_aporte_empleado_patrono || 0,
      aporte_patrono: item.caja_aporte_empleado_patrono || 0
    }
  }

  static async persistirNomina(nominaResult, mes, anio, quincena) {
    const registros = nominaResult.map(item => this.normalizarRegistro(item))

    return NominaPersistenceService.persistir({
      registros,
      mes,
      anio,
      quincena_no: quincena,
      tipo_personal: 'Pensionado'
    })
  }
}
