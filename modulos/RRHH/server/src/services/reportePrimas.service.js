import { NominaActivosService } from './nominaActivos.service.js'
import { NominaObreroService } from './nominaObrero.services.js'
import { NominaJubiladosService } from './nominaJubilados.service.js'
import { NominaPensionadosService } from './nominaPensionados.service.js'
import { NominaSobrevivientesService } from './nominaSobrevivientes.service.js'

export class ReportePrimasService {

  static normalizarRow(row, tipoPersonal) {
    const base = {
      tipo_personal: tipoPersonal,
      prima_transporte: 0,
      prima_hogares: 0,
      prima_hijos: 0,
      complemento_alimentacion: 0,
      prima_reconocimiento: 0,
      prima_jerarquia: 0,
      profesionalizacion: 0,
      prima_profesionalizacion: 0,
      prima_mejoramiento_economico: 0,
    }
    if (tipoPersonal === 'Funcionario') {
      const a = row.asignaciones || {}
      return {
        ...base,
        cedula: row.empleado?.cedula || '',
        nombre_completo: `${row.empleado?.nombres || ''} ${row.empleado?.apellidos || ''}`.trim(),
        cargo: row.empleado?.cargo_cet || '',
        departamento: row.empleado?.departamento || '',
        prima_transporte: Number(a.prima_transporte) || 0,
        prima_hogares: Number(a.prima_hogares) || 0,
        prima_hijos: Number(a.prima_hijos) || 0,
        complemento_alimentacion: Number(a.complemento_alimentacion) || 0,
        prima_reconocimiento: Number(a.prima_reconocimiento) || 0,
        prima_jerarquia: Number(a.prima_jerarquia) || 0,
        profesionalizacion: Number(a.profesionalizacion) || 0,
      }
    }
    if (tipoPersonal === 'Obrero Fijo') {
      const a = row.asignaciones || {}
      return {
        ...base,
        cedula: row.empleado?.cedula || '',
        nombre_completo: `${row.empleado?.nombres || ''} ${row.empleado?.apellidos || ''}`.trim(),
        cargo: row.empleado?.cargo_cet || '',
        departamento: row.empleado?.departamento || '',
        prima_transporte: Number(a.prima_transporte) || 0,
        prima_hogares: Number(a.prima_hogares) || 0,
        prima_hijos: Number(a.prima_hijos) || 0,
        complemento_alimentacion: Number(a.complemento_alimentacion) || 0,
        prima_reconocimiento: Number(a.prima_reconocimiento) || 0,
      }
    }
    if (tipoPersonal === 'Jubilado') {
      return {
        ...base,
        cedula: row.cedula || '',
        nombre_completo: row.nombre_completo || '',
        cargo: row.cargo || '',
        departamento: row.ubicacion || '',
        prima_profesionalizacion: Number(row.prima_profesionalizacion) || 0,
      }
    }
    if (tipoPersonal === 'Pensionado') {
      return {
        ...base,
        cedula: row.cedula || '',
        nombre_completo: row.nombre_completo || '',
        cargo: row.cargo || '',
        departamento: '',
        prima_transporte: 0,
        prima_hogares: 0,
        prima_hijos: 0,
        complemento_alimentacion: 0,
        prima_reconocimiento: 0,
        prima_jerarquia: 0,
        profesionalizacion: 0,
        prima_profesionalizacion: 0,
        prima_mejoramiento_economico: 0,
      }
    }
    if (tipoPersonal === 'Sobreviviente') {
      return {
        ...base,
        cedula: row.familiar_cedula || '',
        nombre_completo: row.familiar_nombre_completo || '',
        cargo: `Beneficiario de: ${row.empleado_nombre || ''}`,
        departamento: '',
        prima_mejoramiento_economico: Number(row.prima_mejoramiento_economico) || 0,
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

  static calcularTotalPrimas(row) {
    return (
      (row.prima_transporte || 0) +
      (row.prima_hogares || 0) +
      (row.prima_hijos || 0) +
      (row.complemento_alimentacion || 0) +
      (row.prima_reconocimiento || 0) +
      (row.prima_jerarquia || 0) +
      (row.profesionalizacion || 0) +
      (row.prima_profesionalizacion || 0) +
      (row.prima_mejoramiento_economico || 0)
    )
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

    for (const row of normalizados) {
      row.total_primas = this.calcularTotalPrimas(row)
    }

    const tiposList = ['Funcionario', 'Obrero Fijo', 'Jubilado', 'Pensionado', 'Sobreviviente']
    const porTipo = tiposList.map(tipo => {
      const rows = normalizados.filter(r => r.tipo_personal === tipo)
      return {
        tipo_personal: tipo,
        cantidad: rows.length,
        total_primas: rows.reduce((s, r) => s + (r.total_primas || 0), 0),
      }
    })

    const resumen = {
      total_empleados: normalizados.length,
      total_primas: normalizados.reduce((s, r) => s + r.total_primas, 0),
      total_transporte: normalizados.reduce((s, r) => s + (r.prima_transporte || 0), 0),
      total_hogares: normalizados.reduce((s, r) => s + (r.prima_hogares || 0), 0),
      total_hijos: normalizados.reduce((s, r) => s + (r.prima_hijos || 0), 0),
      total_alimentacion: normalizados.reduce((s, r) => s + (r.complemento_alimentacion || 0), 0),
      total_reconocimiento: normalizados.reduce((s, r) => s + (r.prima_reconocimiento || 0), 0),
      total_jerarquia: normalizados.reduce((s, r) => s + (r.prima_jerarquia || 0), 0),
      total_profesionalizacion: normalizados.reduce((s, r) => s + (r.profesionalizacion || 0) + (r.prima_profesionalizacion || 0), 0),
      total_mejoramiento: normalizados.reduce((s, r) => s + (r.prima_mejoramiento_economico || 0), 0),
      porTipo,
    }

    normalizados.sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo, 'es'))

    return { data: normalizados, resumen }
  }
}
