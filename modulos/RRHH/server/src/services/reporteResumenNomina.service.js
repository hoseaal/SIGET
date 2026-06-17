import { NominaActivosService } from './nominaActivos.service.js'
import { NominaObreroService } from './nominaObrero.services.js'
import { NominaJubiladosService } from './nominaJubilados.service.js'
import { NominaPensionadosService } from './nominaPensionados.service.js'
import { NominaSobrevivientesService } from './nominaSobrevivientes.service.js'

export class ReporteResumenNominaService {

  static extraerDatos(resultado) {
    if (!resultado) return []
    if (Array.isArray(resultado)) return resultado
    if (resultado.isUnificada) {
      return [...(resultado.q1 || []), ...(resultado.q2 || [])]
    }
    return []
  }

  static normalizarRow(row, tipoPersonal) {
    if (tipoPersonal === 'Funcionario') {
      const a = row.asignaciones || {}
      const d = row.deducciones || {}
      return {
        tipo_personal: 'Funcionario',
        cedula: row.empleado?.cedula || '',
        nombre_completo: `${row.empleado?.nombres || ''} ${row.empleado?.apellidos || ''}`.trim(),
        cargo: row.empleado?.cargo_cet || '',
        departamento: row.empleado?.departamento || '',
        sueldo_antiguedad: Number(a.sueldo_quincenal || 0) + Number(a.antiguedad_quincenal || 0),
        primas: Number(a.profesionalizacion || 0) + Number(a.prima_jerarquia || 0) + Number(a.prima_transporte || 0) + Number(a.prima_reconocimiento || 0) + Number(a.prima_hogares || 0) + Number(a.complemento_alimentacion || 0) + Number(a.prima_hijos || 0),
        otros: (Number(a.diferencias_suplencia?.sueldo || 0) + Number(a.diferencias_suplencia?.antiguedad || 0) + Number(a.diferencias_suplencia?.profesionalizacion || 0) + Number(a.diferencias_suplencia?.jerarquia || 0)) + Number(a.retroactivo || 0),
        seguro_social: Number(d.seguro_empleado || 0),
        rpe: Number(d.rpe_empleado || 0),
        faov: Number(d.faov_empleado || 0),
        fejp: Number(d.fejp || 0),
        caja_ahorro: Number(d.caja_ahorro || 0),
        aporte_patronal: Number(d.seguro_patronal || 0) + Number(d.rpe_patronal || 0) + Number(d.faov_patronal || 0) + Number(d.fejp_patronal || 0) + Number(d.caja_ahorro_patronal || 0),
        total_asignaciones: Number(a.total_asignaciones || 0),
        total_deducciones: Number(d.total_deducciones || 0),
        neto: Number(row.salario_neto || 0),
      }
    }
    if (tipoPersonal === 'Obrero Fijo') {
      const a = row.asignaciones || {}
      const d = row.deducciones || {}
      return {
        tipo_personal: 'Obrero Fijo',
        cedula: row.empleado?.cedula || '',
        nombre_completo: `${row.empleado?.nombres || ''} ${row.empleado?.apellidos || ''}`.trim(),
        cargo: row.empleado?.cargo_cet || '',
        departamento: row.empleado?.departamento || '',
        sueldo_antiguedad: Number(a.sueldo_quincenal || 0) + Number(a.antiguedad_quincenal || 0),
        primas: Number(a.prima_transporte || 0) + Number(a.prima_reconocimiento || 0) + Number(a.prima_hogares || 0) + Number(a.complemento_alimentacion || 0) + Number(a.prima_hijos || 0),
        otros: 0,
        seguro_social: Number(d.seguro_empleado || 0),
        rpe: Number(d.rpe_empleado || 0),
        faov: Number(d.faov_empleado || 0),
        fejp: 0,
        caja_ahorro: Number(d.caja_ahorro || 0),
        aporte_patronal: Number(d.seguro_patronal || 0) + Number(d.rpe_patronal || 0) + Number(d.faov_patronal || 0) + Number(d.caja_ahorro_patronal || 0) + Number(d.fondo_jubilacion || 0),
        total_asignaciones: Number(a.total_asignaciones || 0),
        total_deducciones: Number(d.total_deducciones || 0),
        neto: Number(row.salario_neto || 0),
      }
    }
    if (tipoPersonal === 'Jubilado') {
      return {
        tipo_personal: 'Jubilado',
        cedula: row.cedula || '',
        nombre_completo: row.nombre_completo || '',
        cargo: row.cargo || '',
        departamento: row.ubicacion || '',
        sueldo_antiguedad: Number(row.pension_quincenal || 0) + Number(row.antiguedad_quincenal || 0),
        primas: Number(row.prima_profesionalizacion || 0),
        otros: 0,
        seguro_social: 0,
        rpe: 0,
        faov: 0,
        fejp: 0,
        caja_ahorro: Number(row.caja_ahorro_empleado || 0),
        aporte_patronal: Number(row.caja_ahorro_patrono || 0),
        total_asignaciones: Number(row.total_asignaciones || 0),
        total_deducciones: Number(row.total_deducciones || 0),
        neto: Number(row.sueldo_neto || 0),
      }
    }
    if (tipoPersonal === 'Pensionado') {
      return {
        tipo_personal: 'Pensionado',
        cedula: row.cedula || '',
        nombre_completo: row.nombre_completo || '',
        cargo: row.cargo || '',
        departamento: '',
        sueldo_antiguedad: Number(row.pension_incapacidad || 0),
        primas: 0,
        otros: 0,
        seguro_social: 0,
        rpe: 0,
        faov: 0,
        fejp: 0,
        caja_ahorro: Number(row.caja_aporte_empleado_patrono || 0),
        aporte_patronal: 0,
        total_asignaciones: Number(row.total_asignaciones || 0),
        total_deducciones: Number(row.total_deducciones || 0),
        neto: Number(row.sueldo_neto || 0),
      }
    }
    if (tipoPersonal === 'Sobreviviente') {
      return {
        tipo_personal: 'Sobreviviente',
        cedula: row.familiar_cedula || '',
        nombre_completo: row.familiar_nombre_completo || '',
        cargo: 'Beneficiario',
        departamento: '',
        sueldo_antiguedad: Number(row.pension_sobreviviente || 0),
        primas: Number(row.prima_mejoramiento_economico || 0),
        otros: 0,
        seguro_social: 0,
        rpe: 0,
        faov: 0,
        fejp: 0,
        caja_ahorro: 0,
        aporte_patronal: 0,
        total_asignaciones: Number(row.total_asignaciones || 0),
        total_deducciones: Number(row.total_deducciones || 0),
        neto: Number(row.neto_a_cobrar || 0),
      }
    }
    return null
  }

  static async generarReporte(mes, anio, quincena) {
    const q = Number(quincena) || 1

    const [
      activos,
      obreros,
      jubilados,
      pensionados,
      sobrevivientes,
    ] = await Promise.all([
      NominaActivosService.generarNomina(mes, anio, q).catch(() => []),
      NominaObreroService.generarNomina(mes, anio, q).catch(() => []),
      NominaJubiladosService.generarNomina(mes, anio, q).catch(() => []),
      NominaPensionadosService.generarNomina(mes, anio, q).catch(() => []),
      NominaSobrevivientesService.generarNomina(mes, anio, q).catch(() => []),
    ])

    const [datosActivos, datosObreros, datosJubilados, datosPensionados, datosSobrevivientes] = [
      this.extraerDatos(activos),
      this.extraerDatos(obreros),
      this.extraerDatos(jubilados),
      this.extraerDatos(pensionados),
      this.extraerDatos(sobrevivientes),
    ]

    const normalizados = [
      ...datosActivos.map(r => this.normalizarRow(r, 'Funcionario')),
      ...datosObreros.map(r => this.normalizarRow(r, 'Obrero Fijo')),
      ...datosJubilados.map(r => this.normalizarRow(r, 'Jubilado')),
      ...datosPensionados.map(r => this.normalizarRow(r, 'Pensionado')),
      ...datosSobrevivientes.map(r => this.normalizarRow(r, 'Sobreviviente')),
    ].filter(Boolean)

    const tipos = ['Funcionario', 'Obrero Fijo', 'Jubilado', 'Pensionado', 'Sobreviviente']
    const porTipo = tipos.map(tipo => {
      const rows = normalizados.filter(r => r.tipo_personal === tipo)
      return {
        tipo_personal: tipo,
        cantidad: rows.length,
        total_asignaciones: rows.reduce((s, r) => s + r.total_asignaciones, 0),
        total_deducciones: rows.reduce((s, r) => s + r.total_deducciones, 0),
        total_neto: rows.reduce((s, r) => s + r.neto, 0),
        sueldo_antiguedad: rows.reduce((s, r) => s + r.sueldo_antiguedad, 0),
        primas: rows.reduce((s, r) => s + r.primas, 0),
        otros: rows.reduce((s, r) => s + r.otros, 0),
        seguro_social: rows.reduce((s, r) => s + r.seguro_social, 0),
        rpe: rows.reduce((s, r) => s + r.rpe, 0),
        faov: rows.reduce((s, r) => s + r.faov, 0),
        fejp: rows.reduce((s, r) => s + r.fejp, 0),
        caja_ahorro: rows.reduce((s, r) => s + r.caja_ahorro, 0),
        aporte_patronal: rows.reduce((s, r) => s + r.aporte_patronal, 0),
      }
    })

    const resumen = {
      total_empleados: normalizados.length,
      total_asignaciones: porTipo.reduce((s, t) => s + t.total_asignaciones, 0),
      total_deducciones: porTipo.reduce((s, t) => s + t.total_deducciones, 0),
      total_neto: porTipo.reduce((s, t) => s + t.total_neto, 0),
      total_sueldo_antiguedad: porTipo.reduce((s, t) => s + t.sueldo_antiguedad, 0),
      total_primas: porTipo.reduce((s, t) => s + t.primas, 0),
      total_otros: porTipo.reduce((s, t) => s + t.otros, 0),
      total_seguro_social: porTipo.reduce((s, t) => s + t.seguro_social, 0),
      total_rpe: porTipo.reduce((s, t) => s + t.rpe, 0),
      total_faov: porTipo.reduce((s, t) => s + t.faov, 0),
      total_fejp: porTipo.reduce((s, t) => s + t.fejp, 0),
      total_caja_ahorro: porTipo.reduce((s, t) => s + t.caja_ahorro, 0),
      total_aporte_patronal: porTipo.reduce((s, t) => s + t.aporte_patronal, 0),
    }

    normalizados.sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo, 'es'))

    return { data: normalizados, porTipo, resumen }
  }
}
