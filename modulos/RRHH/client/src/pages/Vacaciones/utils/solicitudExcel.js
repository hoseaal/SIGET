import { getBase64FromUrl } from '../../../utils/imageUtils'
import { formatDate } from './vacacionesUtils'

export const addSolicitudSheet = async (wb, reciboData, logoCet) => {
  const e = reciboData.empleado
  const v = reciboData.vacacion || {}

  const ws = wb.addWorksheet('Solicitud', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  })

  // ── Anchos de columnas (A=1 … J=10) ──────────────────────────────
  ws.columns = [
    { width: 5 },   // A
    { width: 5 },   // B
    { width: 10 },  // C
    { width: 15 },  // D
    { width: 15 },  // E
    { width: 15 },  // F
    { width: 15 },  // G
    { width: 15 },  // H
    { width: 15 },  // I
    { width: 15 }   // J
  ]

  // ── Helpers de estilos ─────────────────────────────────────────────────
  const thin = { style: 'thin', color: { argb: 'FF000000' } }
  const allBorder = { top: thin, left: thin, bottom: thin, right: thin }
  const borderTopSide = { top: thin, left: thin, right: thin }
  const borderBottomSide = { bottom: thin, left: thin, right: thin }

  const bold16 = { name: 'Arial', bold: true, size: 16 }
  const bold14 = { name: 'Arial', bold: true, size: 14 }
  const bold12 = { name: 'Arial', bold: true, size: 12 }
  const norm10 = { name: 'Arial', size: 10 }
  const norm8 = { name: 'Arial', size: 8 }

  const center = { horizontal: 'center', vertical: 'middle', wrapText: true }
  const left = { horizontal: 'left', vertical: 'middle', wrapText: true }
  const leftTop = { horizontal: 'left', vertical: 'top', wrapText: true }
  const right = { horizontal: 'right', vertical: 'middle' }

  const C = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 10 }

  const mergeFill = (row, sc, ec, value, font, alignment, border) => {
    ws.mergeCells(row, sc, row, ec)
    const cell = ws.getCell(row, sc)
    cell.value = value
    if (font) cell.font = font
    if (alignment) cell.alignment = alignment
    if (border) cell.border = border
    return cell
  }

  // ── Encabezado ────────────────────────────────────────────────────────
  ws.getRow(1).height = 12
  mergeFill(1, C.A, C.D, 'República Bolivariana de Venezuela', norm8, center, null)
  
  // Fila 2, 3, 4 para el logo (espacio vacío)
  ws.getRow(2).height = 15
  ws.getRow(3).height = 15
  ws.getRow(4).height = 15

  try {
    const logoData = await getBase64FromUrl(logoCet)
    const clean = logoData.includes('base64,') ? logoData.split('base64,')[1] : logoData
    const imageId = wb.addImage({ base64: clean, extension: 'png' })
    // Posicionamos el logo centrado sobre los textos de la izquierda
    ws.addImage(imageId, { tl: { col: 1.1, row: 1.1 }, ext: { width: 140, height: 45 } })
  } catch (err) { console.error('Error al agregar logo en solicitud:', err) }

  ws.getRow(5).height = 12
  mergeFill(5, C.A, C.D, 'RIF: G-20000523-8', norm8, center, null)
  ws.getRow(6).height = 12
  mergeFill(6, C.A, C.D, 'Dirección de Recursos Humanos', norm8, center, null)

  // Título central
  ws.mergeCells(1, C.E, 6, C.H)
  const titleCell = ws.getCell(1, C.E)
  titleCell.value = 'SOLICITUD DE VACACIONES'
  titleCell.font = bold16
  titleCell.alignment = center

  // Año a la derecha
  ws.mergeCells(1, C.I, 6, C.J)
  const periodCell = ws.getCell(1, C.I)
  const periodoText = v.periodo ? v.periodo : '2025-2026'
  periodCell.value = periodoText
  periodCell.font = bold14
  periodCell.alignment = center

  // Espacio
  ws.getRow(7).height = 10

  // ── Fila 8: Etiquetas Apellidos y Nombres / Cédula ───────────────────
  ws.getRow(8).height = 18
  mergeFill(8, C.A, C.F, ' 1. Apellidos y Nombres', norm10, left, borderTopSide)
  mergeFill(8, C.G, C.J, ' 2. Cédula de Identidad Nº', norm10, left, borderTopSide)

  // ── Fila 9: Valores Apellidos y Nombres / Cédula ─────────────────────
  ws.getRow(9).height = 40
  mergeFill(9, C.A, C.F, `${e.apellidos} ${e.nombres}`.toUpperCase(), bold12, center, borderBottomSide)
  mergeFill(9, C.G, C.J, e.cedula || '', bold12, center, borderBottomSide)

  // ── Fila 10: Etiquetas Vacaciones / Firma / Autorización ──────────────
  ws.getRow(10).height = 18
  mergeFill(10, C.A, C.D, ' 3. Vacaciones solicitadas a partir del:', norm10, left, borderTopSide)
  mergeFill(10, C.E, C.F, ' 4. Firma del Solicitante', norm10, left, borderTopSide)
  mergeFill(10, C.G, C.J, ' 5. Autorización de Director(a)', norm10, left, borderTopSide)

  // ── Fila 11: Valores Vacaciones / Firma / Autorización ────────────────
  ws.getRow(11).height = 50
  const fechaInicioText = v.fecha_inicio ? formatDate(v.fecha_inicio) : ''
  mergeFill(11, C.A, C.D, fechaInicioText, bold12, center, borderBottomSide)
  mergeFill(11, C.E, C.F, '', norm10, center, borderBottomSide)
  mergeFill(11, C.G, C.J, '', norm10, center, borderBottomSide)

  // ── Fila 12: Recibido / Fecha / Aprobado ──────────────────────────────
  ws.getRow(12).height = 40
  mergeFill(12, C.A, C.D, ' Recibido en Dirección de Recursos Humanos:', norm10, leftTop, allBorder)
  mergeFill(12, C.E, C.F, ' Fecha:', norm10, leftTop, allBorder)
  mergeFill(12, C.G, C.J, ' Aprobado:', norm10, leftTop, allBorder)

}
