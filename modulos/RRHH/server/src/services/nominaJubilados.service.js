/* eslint-disable camelcase */
import { NominaJubiladosModel } from '../models/nominaJubilados.model.js'
import { NominaPersistenceService } from './nominaPersistence.service.js'

export class NominaJubiladosService {
  static tipoPersonal = 'Jubilado'
  static async generarNomina(mes, anio, quincena) {
    const [jubilados, escalasAntiguedad] = await Promise.all([
      NominaJubiladosModel.getJubiladosData(),
      NominaJubiladosModel.getEscalasAntiguedad()
    ]);
    
    // Antigüedad máxima de la tabla configuracion_antiguedad (ordenada ASC, el último es el máximo)
    const maxAniosAntiguedad = escalasAntiguedad.length > 0
      ? Number(escalasAntiguedad[escalasAntiguedad.length - 1].anios_cumplidos)
      : 0
    const pct_ant_global = this.getPorcentajeAntiguedad(maxAniosAntiguedad, escalasAntiguedad)

    const results = jubilados.map(jub => {
      const sueldo_base = parseFloat(jub.salario_base) || 0
      const pct_jub = parseFloat(jub.porcentaje_jubilacion) || 0
      
      // Todos los jubilados usan la antigüedad máxima configurada
      const anios_antiguedad = maxAniosAntiguedad
      const pct_ant = pct_ant_global

      // 1. Pensión Jubilación (Anual/Referencia 2022)
      const pension_anual = sueldo_base * (pct_jub / 100)
      
      // 2. Pensión Quincenal
      const pension_quincenal = pension_anual / 2
      
      // 3. Antigüedad Quincenal (Pensión Quincenal * % Antigüedad)
      const antiguedad_quincenal = pension_quincenal * pct_ant
      
      // 4. Prima Profesionalización (25% de la pensión quincenal)
      const prima_profesionalizacion = pension_quincenal * 0.25
      
      // 5. Total Asignaciones
      const total_asignaciones = pension_quincenal + antiguedad_quincenal + prima_profesionalizacion
      
      // 6. Deducciones (Caja de Ahorro - 10%)
      const caja_ahorro_empleado = pension_quincenal * 0.10
      const caja_ahorro_patrono = pension_quincenal * 0.10
      const total_deducciones = caja_ahorro_empleado
      
      // 7. Sueldo Neto
      const sueldo_neto = total_asignaciones - total_deducciones

      return {
        empleado_id: jub.empleado_id,
        cedula: jub.cedula,
        nombre_completo: `${jub.nombres} ${jub.apellidos}`,
        cargo: jub.cargo_cet_nombre || jub.cargo_onapre_nombre || 'N/A',
        ubicacion: jub.direccion_nombre || 'N/A',
        sueldo_base,
        pct_jub,
        pct_ant: (pct_ant * 100).toFixed(0),
        anios_antiguedad,           // Máximo de configuracion_antiguedad
        pension_quincenal: this.round(pension_quincenal),
        antiguedad_quincenal: this.round(antiguedad_quincenal),
        prima_profesionalizacion: this.round(prima_profesionalizacion),
        total_asignaciones: this.round(total_asignaciones),
        caja_ahorro_empleado: this.round(caja_ahorro_empleado),
        caja_ahorro_patrono: this.round(caja_ahorro_patrono),
        total_deducciones: this.round(total_deducciones),
        sueldo_neto: this.round(sueldo_neto),
        cuenta_bancaria: jub.cuenta_bancaria
      }
    })

    return results
  }

  static getPorcentajeAntiguedad(anosAntiguedad, escalaAntiguedad) {
    let porcentaje = 0;
    for (const esc of escalaAntiguedad) {
      if (anosAntiguedad >= esc.anios_cumplidos) {
        porcentaje = Number(esc.porcentaje_actual);
      }
    }
    return porcentaje / 100;
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
      monto_caja: Number((item.caja_ahorro_empleado || 0) + (item.caja_ahorro_patrono || 0)),
      aporte_empleado: item.caja_ahorro_empleado || 0,
      aporte_patrono: item.caja_ahorro_patrono || 0
    }
  }

  static async persistirNomina(nominaResult, mes, anio, quincena) {
    const registros = nominaResult.map(item => this.normalizarRegistro(item))

    return NominaPersistenceService.persistir({
      registros,
      mes,
      anio,
      quincena_no: quincena,
      tipo_personal: 'Jubilado'
    })
  }
}
