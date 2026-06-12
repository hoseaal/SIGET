import ExcelJS from 'exceljs'
import { VacacionesService } from '../services/vacaciones.service.js'

export const obtenerAlertas = async (req, res) => {
  try {
    const alertas = await VacacionesService.obtenerAlertas()
    res.json(alertas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerConsolidado = async (req, res) => {
  try {
    const data = await VacacionesService.obtenerConsolidado(req.query.tipo)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const buscarEmpleados = async (req, res) => {
  try {
    const data = await VacacionesService.buscarEmpleados(req.query.q, req.query.tipo)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const calcularSaldo = async (req, res) => {
  try {
    const { empleado_id, dias_solicitados, fecha_inicio } = req.body
    if (!empleado_id) {
      return res.status(400).json({ message: 'empleado_id es requerido' })
    }
    const data = await VacacionesService.calcularSaldo(
      empleado_id,
      Number(dias_solicitados) || 0,
      fecha_inicio || null
    )
    res.json(data)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const registrarSolicitud = async (req, res) => {
  try {
    const data = await VacacionesService.registrarSolicitud(req.body)
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const pagarVacaciones = async (req, res) => {
  try {
    const { empleado_id, vacaciones_id } = req.body
    if (!empleado_id) {
      return res.status(400).json({ message: 'empleado_id es requerido' })
    }
    const data = await VacacionesService.pagarBonoVacacional(empleado_id, vacaciones_id)
    res.json(data)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const reintegrarVacaciones = async (req, res) => {
  try {
    const { empleado_id, fecha_reintegro, observaciones } = req.body
    if (!empleado_id) {
      return res.status(400).json({ message: 'empleado_id es requerido' })
    }
    const data = await VacacionesService.procesarReintegro(empleado_id, fecha_reintegro, observaciones)
    res.json(data)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const terminarVacaciones = async (req, res) => {
  try {
    const { empleado_id } = req.body
    if (!empleado_id) {
      return res.status(400).json({ message: 'empleado_id es requerido' })
    }
    const data = await VacacionesService.procesarTermino(empleado_id)
    res.json(data)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const obtenerPerfil = async (req, res) => {
  try {
    const data = await VacacionesService.obtenerPerfil(req.params.empleadoId)
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const obtenerRecibo = async (req, res) => {
  try {
    const data = await VacacionesService.getRecibo(req.params.empleadoId)
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const obtenerDetalleNomina = async (req, res) => {
  try {
    const data = await VacacionesService.getDetalleNomina(req.params.empleadoId)
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * POST /api/vacaciones/calcular
 * Body: { empleado_id, fecha_inicio }
 *
 * Orquesta los tres módulos en el servidor:
 *   1. Antigüedad (FLOOR estricto, +1 inclusivo)
 *   2. Días de disfrute (bifurcación FUNCIONARIO / OBRERO)
 *   3. Proyección de fechas (calendario dinámico con festivos)
 *
 * Retorna: tipo_personal, antiguedad_anios, dias_base,
 *          dias_adicionales, total_dias_disfrute,
 *          fecha_inicio, fecha_fin, fecha_reincorporacion
 */
export const calcularVacaciones = async (req, res) => {
  try {
    const { empleado_id, fecha_inicio } = req.body

    if (!empleado_id || !fecha_inicio) {
      return res.status(400).json({
        message: 'Los campos empleado_id y fecha_inicio son obligatorios'
      })
    }

    const resultado = await VacacionesService.calcularVacaciones(
      Number(empleado_id),
      fecha_inicio
    )

    res.json(resultado)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const posponerVacacionesController = async (req, res) => {
  try {
    const { empleado_id } = req.body
    if (!empleado_id) {
      return res.status(400).json({ message: 'empleado_id es requerido' })
    }
    const data = await VacacionesService.posponerVacaciones(empleado_id)
    res.json(data)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const exportarExcel = async (req, res) => {
  try {
    const { estado, tipo } = req.query
    const consolidado = await VacacionesService.obtenerConsolidado(tipo)
    let datos = consolidado
    if (estado) {
      datos = consolidado.filter(emp => emp.estado_vacaciones === estado)
    }
    const formatDate = (value) => {
      if (!value) return 'N/A'
      const date = new Date(value)
      if (isNaN(date.getTime())) return 'N/A'
      return date.toLocaleDateString('es-VE')
    }

    const estadoLabel = {
      programado: 'Programado',
      de_disfrute: 'De disfrute',
      finalizado: 'Finalizado',
      reintegro: 'Reintegro',
      en_espera: 'En espera'
    }[estado] || 'General'

    const datosConRecibo = await Promise.all(
      datos.map(async (emp) => {
        try {
          const recibo = await VacacionesService.getRecibo(emp.empleado_id)
          return { emp, recibo }
        } catch (_) {
          return { emp, recibo: null }
        }
      })
    )

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(`Vacaciones ${estadoLabel}`.substring(0, 31))

    worksheet.columns = [
      { header: 'Cédula', key: 'cedula', width: 15 },
      { header: 'Nombres', key: 'nombres', width: 25 },
      { header: 'Apellidos', key: 'apellidos', width: 25 },
      { header: 'Cargo', key: 'cargo', width: 30 },
      { header: 'Dependencia', key: 'dependencia', width: 30 },
      { header: 'Fecha Ingreso', key: 'fecha_ingreso', width: 15 },
      { header: 'Fecha Inicio Vacaciones', key: 'fecha_inicio_vacaciones', width: 18 },
      { header: 'Fecha Fin Vacaciones', key: 'fecha_fin_vacaciones', width: 18 },
      { header: 'Estado Vacaciones', key: 'estado_vacaciones', width: 18 },
      { header: 'Días Pendientes', key: 'dias_pendientes', width: 15 },
      { header: 'Cuenta Bancaria', key: 'cuenta_bancaria', width: 24 },
      { header: 'Salario Base', key: 'salario_base', width: 16 },
      { header: 'Años Antigüedad', key: 'anios_antiguedad', width: 16 },
      { header: '% Profesionalización', key: 'porcentaje_profesionalizacion', width: 18 },
      { header: 'Sueldo Básico', key: 'sueldo_basico', width: 16 },
      { header: 'Prima Antigüedad', key: 'prima_antiguedad', width: 18 },
      { header: 'Prima Profesionalización', key: 'prima_profesionalizacion', width: 22 },
      { header: 'Prima Jerarquía', key: 'prima_jerarquia', width: 17 },
      { header: 'Prima Transporte', key: 'prima_transporte', width: 18 },
      { header: 'Prima Reconocimiento', key: 'prima_reconocimiento', width: 21 },
      { header: 'Prima Hogares', key: 'prima_hogares', width: 16 },
      { header: 'Prima Comp. Alimentación', key: 'prima_complemento_alimentacion', width: 24 },
      { header: 'Prima Hijos', key: 'prima_hijos', width: 14 },
      { header: 'Diferencia Sueldo Básico', key: 'diferencia_sueldo_basico', width: 24 },
      { header: 'Diferencia Antigüedad', key: 'diferencia_antiguedad', width: 21 },
      { header: 'Diferencia Profesionalización', key: 'diferencia_profesionalizacion', width: 27 },
      { header: 'Diferencia Jerarquía', key: 'diferencia_jerarquia', width: 20 },
      { header: 'Total Sueldo Mensual', key: 'total_sueldo_mensual', width: 20 },
      { header: 'Sueldo Diario', key: 'sueldo_diario', width: 14 },
      { header: 'Días Bono Vacacional', key: 'dias_bono_vacacional', width: 20 },
      { header: 'Bono Vacacional', key: 'bono_vacacional', width: 16 },
      { header: 'Fecha Última Nómina', key: 'fecha_ultima_nomina', width: 18 },
      { header: 'Bruto Última Nómina', key: 'monto_bruto_ultima_nomina', width: 20 },
      { header: 'Neto Última Nómina', key: 'monto_neto_ultima_nomina', width: 20 }
    ]

    worksheet.getRow(1).font = { bold: true }

    datosConRecibo.forEach(({ emp, recibo }) => {
      const empleadoRecibo = recibo?.empleado || {}
      const lineasRecibo = recibo?.lineas_recibo || {}
      const ultimaNomina = recibo?.ultima_nomina || {}
      worksheet.addRow({
        cedula: emp.cedula || 'N/A',
        nombres: emp.nombres || 'N/A',
        apellidos: emp.apellidos || 'N/A',
        cargo: emp.cargo_cet_nombre || emp.cargo_onapre_nombre || 'N/A',
        dependencia: emp.direccion_nombre || emp.division_nombre || emp.unidad_nombre || 'N/A',
        fecha_ingreso: formatDate(empleadoRecibo.fecha_ingreso || emp.fecha_ingreso),
        fecha_inicio_vacaciones: formatDate(emp.fecha_inicio),
        fecha_fin_vacaciones: formatDate(emp.fecha_fin),
        estado_vacaciones: emp.status_vacaciones_nombre || emp.estado_vacaciones || 'N/A',
        dias_pendientes: Number(emp.dias_pendientes || 0),
        cuenta_bancaria: empleadoRecibo.nro_cuenta_bancaria || 'N/A',
        salario_base: Number(empleadoRecibo.salario_base || 0),
        anios_antiguedad: Number(empleadoRecibo.anios_antiguedad || 0),
        porcentaje_profesionalizacion: Number(empleadoRecibo.porcentaje_profesionalizacion || 0),
        sueldo_basico: Number(lineasRecibo.sueldo_basico || 0),
        prima_antiguedad: Number(lineasRecibo.prima_antiguedad || 0),
        prima_profesionalizacion: Number(lineasRecibo.prima_profesionalizacion || 0),
        prima_jerarquia: Number(lineasRecibo.prima_jerarquia || 0),
        prima_transporte: Number(lineasRecibo.prima_transporte || 0),
        prima_reconocimiento: Number(lineasRecibo.prima_reconocimiento || 0),
        prima_hogares: Number(lineasRecibo.prima_hogares || 0),
        prima_complemento_alimentacion: Number(lineasRecibo.prima_complemento_alimentacion || 0),
        prima_hijos: Number(lineasRecibo.prima_hijos || 0),
        diferencia_sueldo_basico: Number(lineasRecibo.diferencia_sueldo_basico || 0),
        diferencia_antiguedad: Number(lineasRecibo.diferencia_antiguedad || 0),
        diferencia_profesionalizacion: Number(lineasRecibo.diferencia_profesionalizacion || 0),
        diferencia_jerarquia: Number(lineasRecibo.diferencia_jerarquia || 0),
        total_sueldo_mensual: Number(lineasRecibo.total_sueldo_mensual || 0),
        sueldo_diario: Number(lineasRecibo.sueldo_diario || 0),
        dias_bono_vacacional: Number(lineasRecibo.dias_bono_vacacional || 0),
        bono_vacacional: Number(lineasRecibo.bono_vacacional || 0),
        fecha_ultima_nomina: formatDate(ultimaNomina.fecha_pago),
        monto_bruto_ultima_nomina: Number(ultimaNomina.monto_bruto || 0),
        monto_neto_ultima_nomina: Number(ultimaNomina.monto_neto || 0)
      })
    })

    ;[
      'salario_base',
      'sueldo_basico',
      'prima_antiguedad',
      'prima_profesionalizacion',
      'prima_jerarquia',
      'prima_transporte',
      'prima_reconocimiento',
      'prima_hogares',
      'prima_complemento_alimentacion',
      'prima_hijos',
      'diferencia_sueldo_basico',
      'diferencia_antiguedad',
      'diferencia_profesionalizacion',
      'diferencia_jerarquia',
      'total_sueldo_mensual',
      'sueldo_diario',
      'bono_vacacional',
      'monto_bruto_ultima_nomina',
      'monto_neto_ultima_nomina'
    ].forEach(key => {
      worksheet.getColumn(key).numFmt = '#,##0.00'
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=\"Vacaciones_${estado || 'general'}_recibos.xlsx\"`)

    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
