import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const THIN = { style: 'thin' }
const THIN_ALL = { top: THIN, left: THIN, bottom: THIN, right: THIN }

export function countBusinessDays(startDate, endDate) {
  if (!startDate || !endDate) return 0
  let count = 0
  const current = new Date(startDate)
  const end = new Date(endDate)
  while (current <= end) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

const DEFAULT_COLUMNS = [
  { header: 'Nombres y Apellidos', key: 'nombreCompleto', width: 32, align: 'left', type: 'string', bold: true },
  { header: 'Cédula de Identidad', key: 'cedula', width: 16, align: 'center', type: 'string' },
  { header: 'Cargo', key: 'cargo', width: 28, align: 'left', type: 'string' },
  { header: 'Fecha de Ingreso', key: 'fechaIngreso', width: 14, align: 'center', type: 'string' },
  { header: 'Años de Servicio', key: 'aniosServicio', width: 13, align: 'center', type: 'string' },
  { header: 'Salario Mensual', key: 'salarioMensual', width: 16, align: 'right', type: 'currency' },
  { header: 'Salario Diario', key: 'salarioDiario', width: 14, align: 'right', type: 'currency' },
  { header: 'Total Días a Disfrutar', key: 'totalDias', width: 12, align: 'center', type: 'number' },
  { header: 'Período de Disfrute', key: 'periodoDisfrute', width: 16, align: 'center', type: 'string' },
  { header: 'Fecha Desde', key: 'fechaDesde', width: 13, align: 'center', type: 'string' },
  { header: 'Fecha Hasta', key: 'fechaHasta', width: 13, align: 'center', type: 'string' },
  { header: 'Monto a Pagar', key: 'montoPagar', width: 16, align: 'right', type: 'currency' },
  { header: 'Firma Trabajador', key: 'firma', width: 22, align: 'center', type: 'string', italic: true, fixedWidth: true },
]

export async function exportVacacionesExcel({ data, mes, anio, periodo, fechaEmision, logoBase64, columns, title, sheetName, filename }) {
  if (!data || data.length === 0) return false

  const cols = columns || DEFAULT_COLUMNS

  const wb = new ExcelJS.Workbook()
  wb.creator = 'SIGET-RRHH'
  const ws = wb.addWorksheet((sheetName || 'Registro Vacaciones').slice(0, 31), {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  })

  if (logoBase64) {
    try {
      const clean = logoBase64.includes('base64,') ? logoBase64.split('base64,')[1] : logoBase64
      const imageId = wb.addImage({ base64: clean, extension: 'png' })
      ws.addImage(imageId, { tl: { col: 1.1, row: 0.5 }, ext: { width: 65, height: 65 } })
    } catch (e) {
      console.error('Error al agregar logo al Excel:', e)
    }
  }

  ws.columns = cols.map(c => ({ width: c.width }))

  const totalCols = cols.length

  // ─── Styles ──────────────────────────────────────────────────────────
  const darkBlue = 'FF1F3864'
  const headerBg = 'FFD9E1F2'

  const titleFont = { name: 'Arial', size: 13, bold: true, color: { argb: 'FF000000' } }
  const subtitleFont = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF000000' } }
  const headerFont = { name: 'Arial', size: 8, bold: true, color: { argb: 'FF000000' } }
  const dataFont = { name: 'Arial', size: 8 }
  const currencyFmt = '#,##0.00'

  const center = { horizontal: 'center', vertical: 'middle', wrapText: true }
  const left = { horizontal: 'left', vertical: 'middle', wrapText: true }
  const right = { horizontal: 'right', vertical: 'middle' }

  // ─── Header rows ─────────────────────────────────────────────────────
  ws.getRow(1).height = 6

  ws.mergeCells(2, 1, 2, totalCols)
  const cellTitle = ws.getCell(2, 1)
  cellTitle.value = 'CONTRALORÍA DEL ESTADO TÁCHIRA C.E.T.'
  cellTitle.font = titleFont
  cellTitle.alignment = center
  ws.getRow(2).height = 28

  ws.mergeCells(3, 1, 3, totalCols)
  const cellSub = ws.getCell(3, 1)
  cellSub.value = title || 'REGISTRO DE VACACIONES ART. 203'
  cellSub.font = subtitleFont
  cellSub.alignment = center
  ws.getRow(3).height = 22

  ws.mergeCells(4, 1, 4, totalCols)
  const cellPeriod = ws.getCell(4, 1)
  cellPeriod.value = `Período Vacacional: ${periodo || `${mes} ${anio}`}`
  cellPeriod.font = { name: 'Arial', size: 10, bold: true, color: { argb: darkBlue } }
  cellPeriod.alignment = center
  ws.getRow(4).height = 20

  ws.mergeCells(5, 1, 5, totalCols)
  const cellFecha = ws.getCell(5, 1)
  cellFecha.value = `Fecha y hora de emisión: ${fechaEmision || new Date().toLocaleString('es-VE')}`
  cellFecha.font = { name: 'Arial', size: 8, italic: true, color: { argb: 'FF666666' } }
  cellFecha.alignment = center
  ws.getRow(5).height = 16

  ws.getRow(6).height = 4

  // ─── Table header ────────────────────────────────────────────────────
  const headerRow = ws.getRow(7)
  headerRow.height = 26
  cols.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = col.header
    cell.font = headerFont
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBg } }
    cell.alignment = center
    cell.border = THIN_ALL
  })

  // ─── Data rows ───────────────────────────────────────────────────────
  data.forEach((row, idx) => {
    const excelRow = ws.getRow(8 + idx)
    excelRow.height = 18

    cols.forEach((col, i) => {
      const cell = excelRow.getCell(i + 1)
      const val = row[col.key] ?? ''
      cell.value = val
      cell.font = col.bold ? { ...dataFont, bold: true } : (col.italic ? { ...dataFont, italic: true, color: { argb: 'FF595959' } } : dataFont)
      cell.alignment = col.align === 'left' ? left : col.align === 'right' ? right : center
      cell.border = THIN_ALL
      if (col.type === 'currency' && typeof val === 'number') {
        cell.numFmt = currencyFmt
      }
    })
  })

  // ─── Auto-width ──────────────────────────────────────────────────────
  cols.forEach((col, i) => {
    if (col.fixedWidth) {
      ws.getColumn(i + 1).width = col.width
      return
    }
    const maxLen = Math.max(
      col.header.length,
      ...data.map(r => String(r[col.key] ?? '').length)
    )
    ws.getColumn(i + 1).width = Math.min(Math.max(maxLen + 2, 10), col.width)
  })

  // ─── Output ──────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const outName = filename || `Registro_Vacaciones_Art203_${mes}_${anio}.xlsx`
  saveAs(blob, outName)
  return true
}

export default exportVacacionesExcel
