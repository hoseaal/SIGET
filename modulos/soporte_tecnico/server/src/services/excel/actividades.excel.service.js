import ExcelJS from 'exceljs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const BORDER = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
}

const HEADER_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE9ECEF' }
}

function aplicarBordes (row, size = 9) {
  row.eachCell(cell => {
    cell.border = BORDER
    cell.font = { size }
    cell.alignment = { vertical: 'middle', wrapText: true }
  })
}

function agregarLogo (workbook, worksheet) {
  const logoPath = path.join(__dirname, '../../../public/img/logo.png')
  if (!fs.existsSync(logoPath)) return
  try {
    const logoId = workbook.addImage({
      buffer: fs.readFileSync(logoPath),
      extension: 'png'
    })
    worksheet.addImage(logoId, {
      tl: { col: 0.1, row: 0.1 },
      ext: { width: 90, height: 75 }
    })
  } catch (error) {
    console.error('No se pudo agregar el logo al Excel:', error.message)
  }
}

function encabezadoInstitucional (worksheet, subtitulo, rangoColumnas = 'A1:L1') {
  worksheet.mergeCells(rangoColumnas)
  const titulo = worksheet.getCell('A1')
  titulo.value = 'CONTRALORIA DEL ESTADO TACHIRA'
  titulo.font = { bold: true, size: 14 }
  titulo.alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.getRow(1).height = 28

  worksheet.mergeCells('A2:L2')
  const sub = worksheet.getCell('A2')
  sub.value = 'DIRECCION GENERAL - DIVISION DE SOPORTE TECNICO'
  sub.font = { bold: true, size: 10 }
  sub.alignment = { horizontal: 'center', vertical: 'middle' }

  worksheet.mergeCells('A3:L3')
  const detalle = worksheet.getCell('A3')
  detalle.value = subtitulo
  detalle.font = { bold: true, size: 10 }
  detalle.alignment = { horizontal: 'center', vertical: 'middle' }
}

function formatoFecha (fecha) {
  if (!fecha) return ''
  const d = new Date(fecha)
  if (isNaN(d.getTime())) return String(fecha)
  return d.toLocaleDateString('es-VE')
}

/**
 * Reporte semanal (detalle de actividades).
 */
export async function generarExcelSemanal (actividades, { desde, hasta } = {}) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SIGET - Soporte Tecnico'
  const ws = workbook.addWorksheet('Actividades Semanales')

  ws.columns = [
    { width: 6 },   // A Nro
    { width: 12 },  // B Fecha
    { width: 30 },  // C Direccion
    { width: 35 },  // D Descripcion
    { width: 12 },  // E BM
    { width: 11 },  // F Prev SW
    { width: 11 },  // G Prev HW
    { width: 11 },  // H Corr SW
    { width: 11 },  // I Corr HW
    { width: 13 },  // J Plat Serv
    { width: 11 },  // K Plat Inf
    { width: 42 }   // L Observaciones
  ]

  const rango = desde && hasta ? `DEL ${formatoFecha(desde)} AL ${formatoFecha(hasta)}` : 'PERIODO SELECCIONADO'
  encabezadoInstitucional(ws, `REPORTE SEMANAL DE ACTIVIDADES - ${rango}`)
  agregarLogo(workbook, ws)

  // Encabezados de tabla (filas 4 y 5)
  ws.getRow(4).values = [
    'Nro', 'FECHA', 'DIRECCION SOLICITANTE', 'DESCRIPCION DEL REPORTE', 'BM',
    'MANT. PREVENTIVO', '', 'MANT. CORRECTIVO', '', 'PLAT. TECNOLOGICA', '', 'OBSERVACIONES'
  ]
  ws.getRow(5).values = [
    '', '', '', '', '',
    'SOFTWARE', 'HARDWARE', 'SOFTWARE', 'HARDWARE', 'SERVICIOS / REDES', 'INFORMES', ''
  ]

  ws.mergeCells('A4:A5')
  ws.mergeCells('B4:B5')
  ws.mergeCells('C4:C5')
  ws.mergeCells('D4:D5')
  ws.mergeCells('E4:E5')
  ws.mergeCells('F4:G4')
  ws.mergeCells('H4:I4')
  ws.mergeCells('J4:K4')
  ws.mergeCells('L4:L5')

  for (const rowNumber of [4, 5]) {
    const row = ws.getRow(rowNumber)
    row.eachCell(cell => {
      cell.font = { bold: true, size: 9 }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.border = BORDER
      cell.fill = HEADER_FILL
    })
  }

  const clasificacionColumna = {
    PREV_SW: 6,
    PREV_HW: 7,
    CORR_SW: 8,
    CORR_HW: 9,
    SERV_REDES: 10,
    INFORMES: 11,
    PLAT_SERV: 10,
    PLAT_INF: 11
  }

  const normalizarCodigo = codigo => {
    if (codigo === 'PLAT_SERV') return 'SERV_REDES'
    if (codigo === 'PLAT_INF') return 'INFORMES'
    return codigo
  }

  const conteos = { PREV_SW: 0, PREV_HW: 0, CORR_SW: 0, CORR_HW: 0, SERV_REDES: 0, INFORMES: 0 }

  // Las actividades se muestran de la mas antigua a la mas reciente.
  const ordenadas = [...actividades].sort((a, b) => {
    const fechaA = new Date(a.fecha).getTime()
    const fechaB = new Date(b.fecha).getTime()

    if (!isNaN(fechaA) && !isNaN(fechaB) && fechaA !== fechaB) {
      return fechaA - fechaB
    }

    return Number(a.id || 0) - Number(b.id || 0)
  })

  ordenadas.forEach((a, index) => {
    const row = ws.getRow(6 + index)
    const valores = [
      index + 1,
      formatoFecha(a.fecha),
      a.departamento_nombre || '',
      a.tipo_actividad_nombre || '',
      a.bim_ide || ''
    ]
    const columnas = [6, 7, 8, 9, 10, 11]
    columnas.forEach(col => { valores[col - 1] = '' })
    const codigo = normalizarCodigo(a.clasificacion_codigo)
    if (clasificacionColumna[a.clasificacion_codigo]) {
      valores[clasificacionColumna[a.clasificacion_codigo] - 1] = 1
      conteos[codigo]++
    }
    valores[11] = a.observaciones || ''

    row.values = valores
    aplicarBordes(row)

    row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
    row.getCell(4).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
    row.getCell(12).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
  })

  const ultimaFilaDatos = 6 + ordenadas.length
  const filaSubtotal = ws.getRow(ultimaFilaDatos)

  ws.mergeCells(`A${ultimaFilaDatos}:E${ultimaFilaDatos}`)
  filaSubtotal.getCell(1).value = 'SUB TOTALES'
  filaSubtotal.getCell(1).alignment = { horizontal: 'right' }
  filaSubtotal.getCell(6).value = conteos.PREV_SW
  filaSubtotal.getCell(7).value = conteos.PREV_HW
  filaSubtotal.getCell(8).value = conteos.CORR_SW
  filaSubtotal.getCell(9).value = conteos.CORR_HW
  filaSubtotal.getCell(10).value = conteos.SERV_REDES
  filaSubtotal.getCell(11).value = conteos.INFORMES
  filaSubtotal.eachCell(cell => {
    cell.font = { bold: true, size: 10 }
    cell.border = BORDER
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  })

  const filaTotal = ws.getRow(ultimaFilaDatos + 1)
  ws.mergeCells(`A${ultimaFilaDatos + 1}:E${ultimaFilaDatos + 1}`)
  filaTotal.getCell(1).value = 'TOTAL SEMANAL'
  filaTotal.getCell(1).alignment = { horizontal: 'right' }
  ws.mergeCells(`F${ultimaFilaDatos + 1}:K${ultimaFilaDatos + 1}`)
  filaTotal.getCell(6).value = ordenadas.length
  filaTotal.getCell(6).font = { bold: true, size: 11 }
  filaTotal.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' }
  filaTotal.eachCell(cell => { cell.border = BORDER })

  return workbook.xlsx.writeBuffer()
}

/**
 * Reporte mensual (consolidado por direccion y clasificacion).
 */
export async function generarExcelMensual (rows, { mes, anio } = {}) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SIGET - Soporte Tecnico'
  const ws = workbook.addWorksheet('Consolidado Mensual')

  ws.columns = [
    { width: 6 },   // A Nro
    { width: 42 },  // B Direccion
    { width: 13 },  // C Prev SW
    { width: 13 },  // D Prev HW
    { width: 13 },  // E Corr SW
    { width: 13 },  // F Corr HW
    { width: 16 },  // G Plat Serv
    { width: 13 }   // H Plat Inf
  ]

  const mesNombre = MESES[Number(mes) - 1] || ''
  encabezadoInstitucional(
    ws,
    `REPORTE MENSUAL DE ACTIVIDADES - ${mesNombre.toUpperCase()} ${anio}`
  )
  agregarLogo(workbook, ws)

  ws.getRow(4).values = [
    'Nro', 'DIRECCION SOLICITANTE',
    'MANT. PREVENTIVO', '', 'MANT. CORRECTIVO', '',
    'PLAT. TECNOLOGICA', ''
  ]
  ws.getRow(5).values = [
    '', '', 'SOFTWARE', 'HARDWARE', 'SOFTWARE', 'HARDWARE', 'SERVICIOS / REDES', 'INFORMES'
  ]

  ws.mergeCells('A4:A5')
  ws.mergeCells('B4:B5')
  ws.mergeCells('C4:D4')
  ws.mergeCells('E4:F4')
  ws.mergeCells('G4:H4')

  for (const rowNumber of [4, 5]) {
    const row = ws.getRow(rowNumber)
    row.eachCell(cell => {
      cell.font = { bold: true, size: 9 }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.border = BORDER
      cell.fill = HEADER_FILL
    })
  }

  const totales = { prev_sw: 0, prev_hw: 0, corr_sw: 0, corr_hw: 0, plat_serv: 0, plat_inf: 0 }

  rows.forEach((r, index) => {
    const row = ws.getRow(6 + index)
    row.values = [
      index + 1,
      r.nombre,
      Number(r.prev_sw),
      Number(r.prev_hw),
      Number(r.corr_sw),
      Number(r.corr_hw),
      Number(r.plat_serv),
      Number(r.plat_inf)
    ]
    aplicarBordes(row)
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }

    totales.prev_sw += Number(r.prev_sw)
    totales.prev_hw += Number(r.prev_hw)
    totales.corr_sw += Number(r.corr_sw)
    totales.corr_hw += Number(r.corr_hw)
    totales.plat_serv += Number(r.plat_serv)
    totales.plat_inf += Number(r.plat_inf)
  })

  const ultimaFila = 6 + rows.length
  const filaSubtotal = ws.getRow(ultimaFila)
  ws.mergeCells(`A${ultimaFila}:B${ultimaFila}`)
  filaSubtotal.getCell(1).value = 'SUB TOTALES'
  filaSubtotal.getCell(1).alignment = { horizontal: 'right' }
  filaSubtotal.getCell(3).value = totales.prev_sw
  filaSubtotal.getCell(4).value = totales.prev_hw
  filaSubtotal.getCell(5).value = totales.corr_sw
  filaSubtotal.getCell(6).value = totales.corr_hw
  filaSubtotal.getCell(7).value = totales.plat_serv
  filaSubtotal.getCell(8).value = totales.plat_inf
  filaSubtotal.eachCell(cell => {
    cell.font = { bold: true, size: 10 }
    cell.border = BORDER
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  })

  const totalGeneral = Object.values(totales).reduce((a, b) => a + b, 0)
  const totalHw = totales.prev_hw + totales.corr_hw
  const totalSw = totales.prev_sw + totales.corr_sw

  const resumenInicio = ultimaFila + 2
  const resumen = [
    ['MANTENIMIENTOS PREVENTIVOS Y CORRECTIVOS DE HARDWARE', totalHw],
    ['MANTENIMIENTOS PREVENTIVOS Y CORRECTIVOS DE SOFTWARE', totalSw],
    ['TOTAL DE SERVICIOS DEL MES', totalGeneral]
  ]
  resumen.forEach((item, i) => {
    const row = ws.getRow(resumenInicio + i)
    ws.mergeCells(`C${resumenInicio + i}:F${resumenInicio + i}`)
    row.getCell(3).value = item[0]
    row.getCell(3).font = { bold: true, size: 10 }
    row.getCell(3).alignment = { horizontal: 'right' }
    row.getCell(7).value = item[1]
    row.getCell(7).font = { bold: true, size: 10 }
    row.getCell(7).border = BORDER
    row.getCell(7).alignment = { horizontal: 'center' }
  })

  return workbook.xlsx.writeBuffer()
}
