/* eslint-disable camelcase */
import { NominaSobrevivientesModel } from '../models/nominaSobrevivientes.model.js'

export class NominaSobrevivientesService {
  static async generarNomina(mes, anio, quincena) {
    const sobrevivientes = await NominaSobrevivientesModel.getSobrevivientesData()

    const results = sobrevivientes.map(sob => {
      // Pensión base (tabla sueldo_sobreviente)
      const pension_base = parseFloat(sob.pension_base_sobreviviente) || 0

      // Pensión por sobreviviente = pension / 2
      const pension_sobreviviente = pension_base / 2

      // Prima mejoramiento económico = sueldo_base_anterior * prima (porcentaje de primas_generales)
      const sueldo_base_anterior = parseFloat(sob.sueldo_base_anterior_empleado) || 0
      const prima_porcentaje = parseFloat(sob.prima_mejoramiento_porcentaje) || 0
      const prima_mejoramiento_economico = sueldo_base_anterior * (prima_porcentaje / 100)

      // Total asignaciones
      const total_asignaciones = pension_sobreviviente + prima_mejoramiento_economico

      // Deducciones (deducciones para sobrevivientes, 0 por ahora)
      const total_deducciones = 0

      // Neto a Cobrar
      const neto_a_cobrar = total_asignaciones - total_deducciones

      return {
        id_sobreviviente: sob.id_sobreviviente,
        familiar_cedula: sob.familiar_cedula,
        familiar_nombre_completo: `${sob.familiar_nombres} ${sob.familiar_apellidos}`,
        empleado_cedula: sob.empleado_cedula,
        empleado_nombre: sob.empleado_nombre,
        fecha_inicio_beneficio: sob.fecha_inicio_beneficio,
        pension_base: this.round(pension_base),
        pension_sobreviviente: this.round(pension_sobreviviente),
        prima_mejoramiento_economico: this.round(prima_mejoramiento_economico),
        total_asignaciones: this.round(total_asignaciones),
        total_deducciones: this.round(total_deducciones),
        neto_a_cobrar: this.round(neto_a_cobrar),
        cuenta_bancaria: sob.familiar_cuenta_bancaria
      }
    })

    return results
  }

  static round(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100
  }
}
