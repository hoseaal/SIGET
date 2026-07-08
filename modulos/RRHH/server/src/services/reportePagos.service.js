import { NominaActivosService } from './nominaActivos.service.js'
import { NominaObreroService } from './nominaObrero.services.js'
import { NominaJubiladosService } from './nominaJubilados.service.js'
import { NominaPensionadosService } from './nominaPensionados.service.js'
import { NominaSobrevivientesService } from './nominaSobrevivientes.service.js'

export class ReportePagosService {

  static normalizarRow(row, tipoPersonal) {
    const tiposNested = ['Funcionario', 'Obrero Fijo']
    if (tiposNested.includes(tipoPersonal)) {
      return {
        tipo_personal: tipoPersonal,
        cedula: row.empleado?.cedula || '',
        nombre_completo: `${row.empleado?.nombres || ''} ${row.empleado?.apellidos || ''}`.trim(),
        cargo: row.empleado?.cargo_cet || '',
        departamento: row.empleado?.departamento || '',
        total_asignaciones: Number(row.asignaciones?.total_asignaciones) || 0,
        total_deducciones: Number(row.deducciones?.total_deducciones) || 0,
        neto: Number(row.salario_neto) || 0,
      }
    }
    if (tipoPersonal === 'Jubilado') {
      return {
        tipo_personal: 'Jubilado',
        cedula: row.cedula || '',
        nombre_completo: row.nombre_completo || '',
        cargo: row.cargo || '',
        departamento: row.ubicacion || '',
        total_asignaciones: Number(row.total_asignaciones) || 0,
        total_deducciones: Number(row.total_deducciones) || 0,
        neto: Number(row.sueldo_neto) || 0,
      }
    }
    if (tipoPersonal === 'Pensionado') {
      return {
        tipo_personal: 'Pensionado',
        cedula: row.cedula || '',
        nombre_completo: row.nombre_completo || '',
        cargo: row.cargo || '',
        departamento: '',
        total_asignaciones: Number(row.total_asignaciones) || 0,
        total_deducciones: Number(row.total_deducciones) || 0,
        neto: Number(row.sueldo_neto) || 0,
      }
    }
    if (tipoPersonal === 'Sobreviviente') {
      return {
        tipo_personal: 'Sobreviviente',
        cedula: row.familiar_cedula || '',
        nombre_completo: row.familiar_nombre_completo || '',
        cargo: `Beneficiario de: ${row.empleado_nombre || ''}`,
        departamento: '',
        total_asignaciones: Number(row.total_asignaciones) || 0,
        total_deducciones: Number(row.total_deducciones) || 0,
        neto: Number(row.neto_a_cobrar) || 0,
      }
    }
    return null
  }

  static extraerDatos(resultado) {
    if (!resultado) return []
    if (Array.isArray(resultado)) return resultado
    if (resultado.isUnificada) {
      return [...(resultado.q1 || []), ...(resultado.q2 || [])]
    }
    return []
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

    const tiposList = ['Funcionario', 'Obrero Fijo', 'Jubilado', 'Pensionado', 'Sobreviviente']
    const porTipo = tiposList.map(tipo => {
      const rows = normalizados.filter(r => r.tipo_personal === tipo)
      return {
        tipo_personal: tipo,
        cantidad: rows.length,
        total_asignaciones: rows.reduce((s, r) => s + r.total_asignaciones, 0),
        total_deducciones: rows.reduce((s, r) => s + r.total_deducciones, 0),
        total_neto: rows.reduce((s, r) => s + r.neto, 0),
      }
    })

    const resumen = {
      total_empleados: normalizados.length,
      total_asignaciones: normalizados.reduce((s, r) => s + r.total_asignaciones, 0),
      total_deducciones: normalizados.reduce((s, r) => s + r.total_deducciones, 0),
      total_neto: normalizados.reduce((s, r) => s + r.neto, 0),
      porTipo,
    }

    normalizados.sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo, 'es'))

    return { data: normalizados, resumen }
  }
}
