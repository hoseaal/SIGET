import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import logoCet from '../../../assets/logo-cet.png'
import { getBase64FromUrl } from '../../../utils/imageUtils'
import { formatDate } from './vacacionesUtils'

export async function downloadReciboExcel(reciboData) {
  if (!reciboData) return
  const e = reciboData.empleado
  const l = reciboData.lineas_recibo
  const v = reciboData.vacacion || {}
  const firmantes = reciboData.firmantes || []

  const wb = new ExcelJS.Workbook()
  wb.creator = 'SIGET-RRHH'
  const ws = wb.addWorksheet('Recibo Vacacional', {
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  })

  // ── Anchos de columnas (A=col1 … H=col8) ──────────────────────────────
  ws.columns = [
    { width: 15 },  // A
    { width: 17 },  // B
    { width: 20 },  // C
    { width: 20 },  // D
    { width: 15 },  // E
    { width: 17 },  // F
    { width: 20 },  // G
    { width: 17 },  // H
  ]

  // ── Helpers de estilos ─────────────────────────────────────────────────
  const thin = { style: 'thin', color: { argb: 'FF999999' } }
  const medium = { style: 'medium', color: { argb: 'FF333333' } }
  const allBorder = { top: thin, left: thin, bottom: thin, right: thin }
  const outerBorder = { top: medium, left: medium, bottom: medium, right: medium }

  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } }
  const labelFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }
  const totalFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }
  const bonoFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
  const signFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }

  const bold14 = { name: 'Arial', bold: true, size: 14, color: { argb: 'FF000000' } }
  const bold11 = { name: 'Arial', bold: true, size: 11, color: { argb: 'FF000000' } }
  const bold10 = { name: 'Arial', bold: true, size: 10 }
  const bold10Dark = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF1F3864' } }
  const norm10 = { name: 'Arial', size: 10 }
  const norm9 = { name: 'Arial', size: 9 }
  const italic9 = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF595959' } }

  const center = { horizontal: 'center', vertical: 'middle', wrapText: true }
  const left = { horizontal: 'left', vertical: 'middle', wrapText: true }
  const right = { horizontal: 'right', vertical: 'middle' }

  const C = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8 }

  const mergeFill = (row, sc, ec, value, fill, font, alignment, border) => {
    ws.mergeCells(row, sc, row, ec)
    const cell = ws.getCell(row, sc)
    cell.value = value
    if (fill) cell.fill = fill
    if (font) cell.font = font
    if (alignment) cell.alignment = alignment
    if (border) cell.border = border
    return cell
  }

  const setCell = (row, col, value, fill, font, alignment, border) => {
    const cell = ws.getCell(row, col)
    cell.value = value
    if (fill) cell.fill = fill
    if (font) cell.font = font
    if (alignment) cell.alignment = alignment
    if (border) cell.border = border
    return cell
  }

  const findFirmante = (cargoFirma) => {
    const f = firmantes.find(fm => fm.cargo_firma === cargoFirma)
    return f ? f.nombre_completo : ''
  }

  // ══════════════════════════════════════════════════════════════════════
  //  FILAS 1 a 3 — Logo, Título Institucional y RIF
  // ══════════════════════════════════════════════════════════════════════
  ws.getRow(1).height = 20
  ws.getRow(2).height = 20
  ws.getRow(3).height = 15

  // Título central
  ws.mergeCells(1, C.C, 2, C.H)
  const titleCell = ws.getCell(1, C.C)
  titleCell.value = 'RECIBO DE BONO VACACIONAL'
  titleCell.font = bold14
  titleCell.alignment = center

  // RIF debajo del logo
  setCell(3, C.B, 'RIF: G-20000523-8', null, norm9, center, null)

  // Logo centrado en la columna B (que es la índice 1), sobre las filas 1 y 2
  try {
    const logoData = await getBase64FromUrl(logoCet)
    const clean = logoData.includes('base64,') ? logoData.split('base64,')[1] : logoData
    const imageId = wb.addImage({ base64: clean, extension: 'png' })
    ws.addImage(imageId, { tl: { col: 1.1, row: 0.2 }, ext: { width: 120, height: 40 } })
  } catch (err) { console.error('Error al agregar logo:', err) }

  // ══════════════════════════════════════════════════════════════════════
  //  FILA 4 — Subtítulo
  // ══════════════════════════════════════════════════════════════════════
  ws.getRow(4).height = 22
  mergeFill(4, C.A, C.H, 'SOLO PARA USO DE LA DIRECCIÓN DE RECURSOS HUMANOS', null, bold11, left, null)

  // ══════════════════════════════════════════════════════════════════════
  //  FILA 5: Fecha de Emisión / Adscripción
  // ══════════════════════════════════════════════════════════════════════
  ws.getRow(5).height = 22
  mergeFill(5, C.A, C.B, 'Fecha de Emisión:', labelFill, bold10, left, allBorder)
  setCell(5, C.C, formatDate(new Date().toISOString()), null, norm10, left, allBorder)
  setCell(5, C.D, 'Adscripción:', labelFill, bold10, center, allBorder)
  mergeFill(5, C.E, C.H, 'Dirección de Recursos Humanos', null, norm10, left, allBorder)

  // ══════════════════════════════════════════════════════════════════════
  //  FILA 6: Cargo / Bono Vacacional
  // ══════════════════════════════════════════════════════════════════════
  ws.getRow(6).height = 22
  mergeFill(6, C.A, C.B, 'Cargo:', labelFill, bold10, left, allBorder)
  setCell(6, C.C, e.cargo_cet || '-', null, norm10, left, allBorder)
  setCell(6, C.D, 'Bono Vacacional:', labelFill, bold10, center, allBorder)
  const diasDesc = `${l.dias_bono_vacacional ? `${l.dias_bono_vacacional} Días` : '-'}`
  mergeFill(6, C.E, C.H, diasDesc, null, norm10, left, allBorder)

  // ══════════════════════════════════════════════════════════════════════
  //  FILA 7: Vacaciones Vencidas / Período
  // ══════════════════════════════════════════════════════════════════════
  ws.getRow(7).height = 22
  mergeFill(7, C.A, C.B, 'Vacaciones Vencidas:', labelFill, bold10, left, allBorder)
  setCell(7, C.C, `${v.saldo_anterior || 0} día(s)`, null, norm10, left, allBorder)
  setCell(7, C.D, 'Período:', labelFill, bold10, center, allBorder)
  mergeFill(7, C.E, C.H, v.periodo || '', null, norm10, left, allBorder)

  // ══════════════════════════════════════════════════════════════════════
  //  FILA 8: Años en Administración Pública
  // ══════════════════════════════════════════════════════════════════════
  ws.getRow(8).height = 30
  mergeFill(8, C.A, C.B, 'Años en Adm. Pública:', labelFill, bold10, left, allBorder)
  setCell(8, C.C, `Contraloría: ${e.antiguedad_anios ?? e.anios_antiguedad ?? 0} año(s)`, null, norm9, left, allBorder)
  setCell(8, C.D, 'Otros organismos:', labelFill, bold10, center, allBorder)
  mergeFill(8, C.E, C.F, `Otros Org.: ${e.otros_anios ?? 0} año(s) ${e.otros_meses ?? 0} mes(es) ${e.otros_dias ?? 0} día(s)`, null, norm9, left, allBorder)
  mergeFill(8, C.G, C.H, `Total Años: ${e.antiguedad_anios ?? e.anios_antiguedad ?? 0} años`, null, { ...norm9, bold: true }, left, allBorder)

  // ══════════════════════════════════════════════════════════════════════
  //  FILA 9: Días Hábiles de Disfrute
  // ══════════════════════════════════════════════════════════════════════
  ws.getRow(9).height = 22
  mergeFill(9, C.A, C.B, 'Días Hábiles de Disfrute:', labelFill, bold10, left, allBorder)
  setCell(9, C.C, `${v.dias_habiles || l.dias_bono_vacacional || ''} día(s)`, null, norm10, left, allBorder)
  setCell(9, C.D, 'Observación', labelFill, bold10, center, allBorder)
  mergeFill(9, C.E, C.H, v.observaciones || v.observacion || '', null, norm10, left, allBorder)

  // ══════════════════════════════════════════════════════════════════════
  //  FILA 10: Disfrute desde / Reincorporación
  // ══════════════════════════════════════════════════════════════════════
  ws.getRow(10).height = 26
  mergeFill(10, C.A, C.B, 'Disfrute desde:', labelFill, bold10, left, allBorder)
  setCell(10, C.C, `${formatDate(v.fecha_inicio)} hasta ${formatDate(v.fecha_fin_real || v.fecha_fin)}`, null, norm10, left, allBorder)
  setCell(10, C.D, 'Reincorporándose', labelFill, bold10, center, allBorder)
  mergeFill(10, C.E, C.H, `El ${formatDate(v.fecha_reincorporacion) || '-'} a las 08:00:00 am`, null, italic9, center, allBorder)

  // ══════════════════════════════════════════════════════════════════════
  //  FILA 11 — espacio
  // ══════════════════════════════════════════════════════════════════════
  ws.getRow(11).height = 8

  // ══════════════════════════════════════════════════════════════════════
  //  FILA 12 — CÁLCULO DE BONO VACACIONAL
  // ══════════════════════════════════════════════════════════════════════
  let r = 12
  ws.getRow(r).height = 22
  mergeFill(r, C.A, C.H, 'CÁLCULO DE BONO VACACIONAL', null, bold11, center, null)
  r++

  // ══════════════════════════════════════════════════════════════════════
  //  Cabecera tabla conceptos
  // ══════════════════════════════════════════════════════════════════════
  ws.getRow(r).height = 20
  setCell(r, C.A, 'N°', headerFill, { ...bold10, color: { argb: 'FFFFFFFF' } }, center, allBorder)
  mergeFill(r, C.B, C.F, 'CONCEPTO', headerFill, { ...bold10, color: { argb: 'FFFFFFFF' } }, center, allBorder)
  mergeFill(r, C.G, C.H, 'MONTO (Bs.)', headerFill, { ...bold10, color: { argb: 'FFFFFFFF' } }, center, allBorder)
  r++

  // ── Conceptos salariales ───────────────────────────────────────────────
  const conceptos = [
    ['001', 'Sueldo Básico', l.sueldo_basico],
    ['002', 'Prima de Antigüedad', l.prima_antiguedad],
    ['003', 'Prima de Nivelación de Profesionalización', l.prima_profesionalizacion],
    ['004', 'Prima de Jerarquía', null],
    ['005', 'Prima de Transporte', l.prima_transporte],
    ['006', 'Prima de Reconocimiento', null],
    ['007', 'Prima de Hogares', l.prima_hogares],
    ['008', 'Prima Complemento de Alimentación', null],
    ['009', 'Prima de Hijos', null],
    ['010', 'Diferencia de Sueldo Básico', null],
    ['011', 'Diferencia de Antigüedad', null],
    ['012', 'Diferencia de Profesionalización', null],
    ['013', 'Diferencia de Jerarquía', null],
  ]

  for (const [num, nombre, monto] of conceptos) {
    ws.getRow(r).height = 18
    setCell(r, C.A, num, labelFill, { ...norm10, bold: true }, center, allBorder)
    mergeFill(r, C.B, C.F, nombre, null, norm10, left, allBorder)
    const montoCell = mergeFill(r, C.G, C.H,
      monto != null ? Number(monto) : null,
      null, norm10, right, allBorder)
    montoCell.numFmt = '#,##0.00'
    r++
  }

  // ── Total Sueldo Mensual ───────────────────────────────────────────────
  ws.getRow(r).height = 22
  mergeFill(r, C.A, C.F, 'TOTAL SUELDO MENSUAL PARA CÁLCULO',
    totalFill, { ...bold10Dark }, left,
    { top: medium, left: medium, bottom: medium, right: medium })
  const totalCell = mergeFill(r, C.G, C.H, Number(l.total_sueldo_mensual || 0),
    totalFill, { name: 'Arial', bold: true, size: 10, color: { argb: 'FF1F3864' } },
    right, { top: medium, left: thin, bottom: medium, right: medium })
  totalCell.numFmt = '#,##0.00'
  r++

  // ── Espacio ────────────────────────────────────────────────────────────
  ws.getRow(r).height = 8; r++

  // ══════════════════════════════════════════════════════════════════════
  //  Sueldo Diario / Días Bono / Bono Vacacional
  // ══════════════════════════════════════════════════════════════════════
  ws.getRow(r).height = 28
  mergeFill(r, C.A, C.B, 'Sueldo Diario (Bs.):', labelFill, bold10, left, allBorder)
  const sdCell = setCell(r, C.C, Number(l.sueldo_diario || 0), null, norm10, right, allBorder)
  sdCell.numFmt = '#,##0.00'
  mergeFill(r, C.D, C.E, 'Días Bono Vacacional:', labelFill, bold10, center, allBorder)
  setCell(r, C.F, l.dias_bono_vacacional || 0, null, norm10, center, allBorder)
  setCell(r, C.G, 'Bono Vacacional (Bs.):', labelFill, bold10, left, allBorder)
  const bvCell = setCell(r, C.H, Number(l.bono_vacacional || 0), null, norm10, right, allBorder)
  bvCell.numFmt = '#,##0.00'
  r++

  // ══════════════════════════════════════════════════════════════════════
  //  TOTAL A PAGAR
  // ══════════════════════════════════════════════════════════════════════
  ws.getRow(r).height = 32
  mergeFill(r, C.A, C.F, 'TOTAL A PAGAR Bs.:',
    bonoFill, { name: 'Arial', bold: true, size: 11, color: { argb: 'FF375623' } },
    right, { top: medium, left: medium, bottom: medium, right: medium })
  const bonoCell = mergeFill(r, C.G, C.H, Number(l.bono_vacacional || 0),
    bonoFill, { name: 'Arial', bold: true, size: 12, color: { argb: 'FF375623' } },
    right, { top: medium, left: thin, bottom: medium, right: medium })
  bonoCell.numFmt = '#,##0.00'
  r++

  // ── Espacio ────────────────────────────────────────────────────────────
  ws.getRow(r).height = 10; r++

  // ══════════════════════════════════════════════════════════════════════
  //  BLOQUE DE FIRMAS (simétrico, 4 bloques de 2 columnas)
  // ══════════════════════════════════════════════════════════════════════
  const nomElaborado = findFirmante('ASISTENTE ADMINISTRATIVO') || findFirmante('ANALISTA DE PERSONAL')
  const nomRevisado = findFirmante('JEFE DE DIVISIÓN DE REMUNERACIONES')
  const nomVerificado = findFirmante('JEFE DE DIVISIÓN GENERAL DE RECURSOS HUMANOS') || findFirmante('DIRECTOR(A) GENERAL DE RECURSOS HUMANOS')
  const nomDirector = findFirmante('DIRECTOR(A) DE RECURSOS HUMANOS') || findFirmante('DIRECTOR GENERAL DE RECURSOS HUMANOS')

  // ── Fila Líneas de firma ─────────────────────────────────────────────
  ws.getRow(r).height = 35
  mergeFill(r, C.A, C.B, '', signFill, null, center, { bottom: medium, left: thin, right: thin, top: thin })
  mergeFill(r, C.C, C.D, '', signFill, null, center, { bottom: medium, left: thin, right: thin, top: thin })
  mergeFill(r, C.E, C.F, '', signFill, null, center, { bottom: medium, left: thin, right: thin, top: thin })
  mergeFill(r, C.G, C.H, '', signFill, null, center, { bottom: medium, left: thin, right: thin, top: thin })
  r++

  // ── Fila Leyendas de acción ──────────────────────────────────────────
  ws.getRow(r).height = 22
  mergeFill(r, C.A, C.B, '', signFill, italic9, center, allBorder)
  mergeFill(r, C.C, C.D, '', signFill, italic9, center, allBorder)
  mergeFill(r, C.E, C.F, '', signFill, italic9, center, allBorder)
  mergeFill(r, C.G, C.H, '', signFill, italic9, center, allBorder)
  r++

  // ── Fila Cargos institucionales ──────────────────────────────────────
  ws.getRow(r).height = 28
  mergeFill(r, C.A, C.B, 'Analista de Personal', signFill, italic9, center, allBorder)
  mergeFill(r, C.C, C.D, 'Jefe de División de Remuneraciones', signFill, italic9, center, allBorder)
  mergeFill(r, C.E, C.F, 'Jefe de División Gral. de Recursos Humanos', signFill, italic9, center, allBorder)
  mergeFill(r, C.G, C.H, 'Director(a) de Recursos Humanos', signFill, bold10, center, allBorder)
  r++

  // ── Fila Nombres dinámicos ──────────────────────────────────────────
  ws.getRow(r).height = 24
  mergeFill(r, C.A, C.B, nomElaborado, signFill, norm10, center, allBorder)
  mergeFill(r, C.C, C.D, nomRevisado, signFill, norm10, center, allBorder)
  mergeFill(r, C.E, C.F, nomVerificado, signFill, norm10, center, allBorder)
  mergeFill(r, C.G, C.H, nomDirector, signFill, norm10, center, allBorder)
  r++

  // ── espacio ──────────────────────────────────────────────────────────
  ws.getRow(r).height = 10; r++

  // ══════════════════════════════════════════════════════════════════════
  //  RECIBÍ CONFORME
  // ══════════════════════════════════════════════════════════════════════
  // ── Fila Título ──────────────────────────────────────────────────
  ws.getRow(r).height = 20
  mergeFill(r, C.A, C.H, 'Recibí conforme:', labelFill, bold10Dark, center, outerBorder)
  r++

  // ── Fila Espacio para firma ───────────────────────────────────
  ws.getRow(r).height = 35
  mergeFill(r, C.A, C.B, 'Nombre y Apellido:', null, bold10, left, allBorder)
  setCell(r, C.C, `${e.nombres} ${e.apellidos}`, null, norm10, left, allBorder)
  mergeFill(r, C.D, C.E, 'Cédula de identidad:', null, bold10, left, allBorder)
  setCell(r, C.F, e.cedula || '', null, norm10, left, allBorder)
  setCell(r, C.G, 'Fecha:', null, bold10, left, allBorder)
  setCell(r, C.H, '', null, norm10, left, allBorder)
  r++

  // ══════════════════════════════════════════════════════════════════════
  //  Hoja de Solicitud (Nueva pestaña)
  // ══════════════════════════════════════════════════════════════════════
  const { addSolicitudSheet } = await import('./solicitudExcel.js')
  await addSolicitudSheet(wb, reciboData, logoCet)

  // ══════════════════════════════════════════════════════════════════════
  //  Guardar
  // ══════════════════════════════════════════════════════════════════════
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  saveAs(blob, `Recibo_Bono_Vacacional_${e.cedula}.xlsx`)
}
