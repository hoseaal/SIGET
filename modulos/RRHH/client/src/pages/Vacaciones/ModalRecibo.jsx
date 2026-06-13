import React from 'react'
import { Modal, Button, Spinner } from 'react-bootstrap'
import { formatDate, formatCurrency } from './utils/vacacionesUtils'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export const ModalRecibo = ({ empleadoId, reciboData, loading, onHide }) => {
  const show = empleadoId !== null

  const downloadExcel = async () => {
    if (!reciboData) return
    const e = reciboData.empleado
    const l = reciboData.lineas_recibo

    const wb = new ExcelJS.Workbook()
    wb.creator = 'SIGET-RRHH'
    const ws = wb.addWorksheet('Recibo Vacacional', {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
    })

    // ── Anchos de columnas (A=col1 … G=col7) ──────────────────────────────
    ws.columns = [
      { width: 3 },   // A  margen
      { width: 30 },  // B  etiqueta izq
      { width: 26 },  // C  valor izq
      { width: 12 },  // D  separador
      { width: 30 },  // E  etiqueta der
      { width: 26 },  // F  valor der
      { width: 3 },   // G  margen
    ]

    // ── Helpers de estilos ─────────────────────────────────────────────────
    const thin = { style: 'thin', color: { argb: 'FF999999' } }
    const medium = { style: 'medium', color: { argb: 'FF333333' } }
    const allBorder = { top: thin, left: thin, bottom: thin, right: thin }
    const outerBorder = { top: medium, left: medium, bottom: medium, right: medium }

    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } }
    const subHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } }
    const labelFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }
    const totalFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }
    const bonoFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
    const signFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }

    const bold14White = { name: 'Arial', bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
    const bold11White = { name: 'Arial', bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
    const bold10 = { name: 'Arial', bold: true, size: 10 }
    const bold10Dark = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF1F3864' } }
    const norm10 = { name: 'Arial', size: 10 }
    const norm9 = { name: 'Arial', size: 9 }
    const italic9 = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF595959' } }

    const center = { horizontal: 'center', vertical: 'middle', wrapText: true }
    const left = { horizontal: 'left', vertical: 'middle', wrapText: true }
    const right = { horizontal: 'right', vertical: 'middle' }

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

    // ── Fila 1 — Título institucional ──────────────────────────────────────
    ws.getRow(1).height = 30
    mergeFill(1, 2, 6,
      'CONTRALORÍA DEL ESTADO TÁCHIRA — DIRECCIÓN DE RECURSOS HUMANOS',
      headerFill, bold14White, center, outerBorder)

    // ── Fila 2 — Subtítulo ─────────────────────────────────────────────────
    ws.getRow(2).height = 18
    mergeFill(2, 2, 6,
      'RECIBO DE BONO VACACIONAL',
      subHeaderFill, bold11White, center, { bottom: medium })

    // ── Fila 3 — espacio ──────────────────────────────────────────────────
    ws.getRow(3).height = 6

    // ── Filas 4-5: Fecha y Ascenso(s) / Cargo ─────────────────────────────
    ws.getRow(4).height = 18
    setCell(4, 2, 'Fecha de Emisión:', labelFill, bold10, left, allBorder)
    setCell(4, 3, formatDate(new Date().toISOString()), null, norm10, left, allBorder)
    setCell(4, 5, 'Ascenso(s):', labelFill, bold10, left, allBorder)
    setCell(4, 6, '', null, norm10, left, allBorder)

    ws.getRow(5).height = 18
    setCell(5, 2, 'Cargo:', labelFill, bold10, left, allBorder)
    setCell(5, 3, e.cargo_cet || e.cargo_onapre || '-', null, norm10, left, allBorder)
    setCell(5, 5, 'Bono Vacacional:', labelFill, bold10, left, allBorder)
    const diasDesc = `${l.dias_bono_vacacional ? `${l.dias_bono_vacacional} Días` : '-'}`
    setCell(5, 6, diasDesc, null, norm10, left, allBorder)

    // ── Fila 6: Vacaciones Vencidas / Período Solicitado ──────────────────
    ws.getRow(6).height = 18
    setCell(6, 2, 'Vacaciones Vencidas:', labelFill, bold10, left, allBorder)
    setCell(6, 3, '', null, norm10, left, allBorder)
    setCell(6, 5, 'Período Solicitado:', labelFill, bold10, left, allBorder)
    setCell(6, 6, '', null, norm10, left, allBorder)

    // ── Fila 7: Años en Administración Pública ────────────────────────────
    ws.getRow(7).height = 28
    setCell(7, 2, 'Años en Adm. Pública:', labelFill, bold10, left, allBorder)
    setCell(7, 3, `Contraloría: ${e.anios_antiguedad ?? ''} año(s)`, null, norm9, left, allBorder)
    setCell(7, 4, 'Otros Org.:', labelFill, bold10, center, allBorder)
    setCell(7, 5, 'año(s) mes(es)', null, norm9, left, allBorder)
    setCell(7, 6, `Total: ${e.anios_antiguedad ?? ''} año(s)`, null, { ...norm9, bold: true }, left, allBorder)

    // ── Fila 8: Días Hábiles ──────────────────────────────────────────────
    ws.getRow(8).height = 18
    setCell(8, 2, 'Días Hábiles de Disfrute:', labelFill, bold10, left, allBorder)
    mergeFill(8, 3, 6,
      `${l.dias_bono_vacacional ? `${l.dias_bono_vacacional} días hábiles del período vacacional` : ''}`,
      null, norm10, left, allBorder)

    // ── Fila 9: Disfrute desde/hasta ──────────────────────────────────────
    ws.getRow(9).height = 22
    setCell(9, 2, 'Disfrute desde:', labelFill, bold10, left, allBorder)
    setCell(9, 3, '', null, norm10, left, allBorder)
    setCell(9, 4, 'hasta:', labelFill, bold10, center, allBorder)
    setCell(9, 5, '', null, norm10, left, allBorder)
    setCell(9, 6, 'Reincorporándose a las 08:00:00 am', null, italic9, left, allBorder)

    // ── Fila 10 — espacio ─────────────────────────────────────────────────
    ws.getRow(10).height = 8

    // ── Fila 11 — DATOS DEL EMPLEADO ─────────────────────────────────────
    ws.getRow(11).height = 16
    mergeFill(11, 2, 6, 'DATOS DEL EMPLEADO', subHeaderFill, bold11White, center, outerBorder)

    const dataRows = [
      ['Cédula de Identidad:', e.cedula || '-', 'Nombres y Apellidos:', `${e.nombres || ''} ${e.apellidos || ''}`],
      ['Fecha de Ingreso:', formatDate(e.fecha_ingreso), 'Antigüedad:', `${e.anios_antiguedad ?? '-'} años`],
      ['Cuenta Bancaria:', e.nro_cuenta_bancaria || '-', 'Cargo ONAPRE:', e.cargo_onapre || '-'],
    ]

    let r = 12
    for (const [l1, v1, l2, v2] of dataRows) {
      ws.getRow(r).height = 16
      setCell(r, 2, l1, labelFill, bold10, left, allBorder)
      setCell(r, 3, v1, null, norm10, left, allBorder)
      setCell(r, 5, l2, labelFill, bold10, left, allBorder)
      setCell(r, 6, v2, null, norm10, left, allBorder)
      r++
    }

    // ── Espacio ────────────────────────────────────────────────────────────
    ws.getRow(r).height = 8; r++

    // ── Título CÁLCULO DE BONO VACACIONAL ─────────────────────────────────
    ws.getRow(r).height = 20
    mergeFill(r, 2, 6, 'CÁLCULO DE BONO VACACIONAL', subHeaderFill, bold11White, center, outerBorder)
    r++

    // ── Cabecera tabla conceptos ───────────────────────────────────────────
    ws.getRow(r).height = 16
    setCell(r, 2, 'N°', headerFill, { ...bold10, color: { argb: 'FFFFFFFF' } }, center, allBorder)
    mergeFill(r, 3, 5, 'CONCEPTO', headerFill, { ...bold10, color: { argb: 'FFFFFFFF' } }, center, allBorder)
    setCell(r, 6, 'MONTO (Bs.)', headerFill, { ...bold10, color: { argb: 'FFFFFFFF' } }, center, allBorder)
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
      ws.getRow(r).height = 15
      setCell(r, 2, num, labelFill, { ...norm10, bold: true }, center, allBorder)
      mergeFill(r, 3, 5, nombre, null, norm10, left, allBorder)
      const montoCell = setCell(r, 6,
        monto != null ? Number(monto) : null,
        null, norm10, right, allBorder)
      montoCell.numFmt = '#,##0.00'
      r++
    }

    // ── Total Sueldo Mensual ───────────────────────────────────────────────
    ws.getRow(r).height = 18
    mergeFill(r, 2, 5, 'TOTAL SUELDO MENSUAL PARA CÁLCULO',
      totalFill, { ...bold10Dark }, left,
      { top: medium, left: medium, bottom: medium, right: medium })
    const totalCell = setCell(r, 6, Number(l.total_sueldo_mensual || 0),
      totalFill, { name: 'Arial', bold: true, size: 10, color: { argb: 'FF1F3864' } },
      right, { top: medium, left: medium, bottom: medium, right: medium })
    totalCell.numFmt = '#,##0.00'
    r++

    // ── Espacio ────────────────────────────────────────────────────────────
    ws.getRow(r).height = 8; r++

    // ── Sueldo Diario / Días Bono / Bono Vacacional ───────────────────────
    ws.getRow(r).height = 24
    setCell(r, 2, 'Sueldo Diario (Bs.):', labelFill, bold10, left, allBorder)
    const sdCell = setCell(r, 3, Number(l.sueldo_diario || 0), null, norm10, right, allBorder)
    sdCell.numFmt = '#,##0.00'
    setCell(r, 4, 'Días Bono Vacacional:', labelFill, bold10, center, allBorder)
    setCell(r, 5, l.dias_bono_vacacional || 0, null, norm10, center, allBorder)
    setCell(r, 6, 'Bono Vacacional (Bs.):', labelFill, bold10, left, allBorder)
    r++

    // ── Bono total ────────────────────────────────────────────────────────
    ws.getRow(r).height = 28
    mergeFill(r, 2, 5, 'TOTAL A PAGAR Bs.:',
      bonoFill, { name: 'Arial', bold: true, size: 11, color: { argb: 'FF375623' } },
      right, { top: medium, left: medium, bottom: medium, right: medium })
    const bonoCell = setCell(r, 6, Number(l.bono_vacacional || 0),
      bonoFill, { name: 'Arial', bold: true, size: 12, color: { argb: 'FF375623' } },
      right, { top: medium, left: medium, bottom: medium, right: medium })
    bonoCell.numFmt = '#,##0.00'
    r++

    // ── Espacio ────────────────────────────────────────────────────────────
    ws.getRow(r).height = 10; r++

    // ── Firmas ────────────────────────────────────────────────────────────
    const firmas = [
      'Analista de Personal',
      'Jefe de Remuneraciones',
      'Jefe de División',
      'Director(a) de RRHH'
    ]
    // Línea de firma (vacía)
    ws.getRow(r).height = 35
    setCell(r, 2, '', signFill, norm10, center, { bottom: medium, left: thin, right: thin })
    setCell(r, 3, '', signFill, norm10, center, { bottom: medium, left: thin, right: thin })
    setCell(r, 4, '', signFill, norm10, center, { bottom: medium, left: thin, right: thin })
    setCell(r, 5, '', signFill, norm10, center, { bottom: medium, left: thin, right: thin })
    setCell(r, 6, '', signFill, norm10, center, { bottom: medium, left: thin, right: thin })
    r++

    // Etiquetas de firmas
    ws.getRow(r).height = 22
    setCell(r, 2, firmas[0], signFill, italic9, center, allBorder)
    setCell(r, 3, firmas[1], signFill, italic9, center, allBorder)
    setCell(r, 4, firmas[2], signFill, italic9, center, allBorder)
    setCell(r, 5, firmas[3], signFill, italic9, center, allBorder)

    r++

    // ── Espacio ────────────────────────────────────────────────────────────
    ws.getRow(r).height = 10; r++

    // ── Recibí conforme ───────────────────────────────────────────────────
    ws.getRow(r).height = 16
    mergeFill(r, 2, 6, 'Recibí conforme:', labelFill, bold10Dark, center, outerBorder)
    r++

    ws.getRow(r).height = 28
    mergeFill(r, 2, 6, '', null, norm10, center,
      { bottom: medium, left: medium, right: medium })
    r++

    ws.getRow(r).height = 18
    setCell(r, 2, 'C.I. N°:', labelFill, bold10, left, allBorder)
    mergeFill(r, 3, 4, e.cedula || '', null, norm10, left, allBorder)
    setCell(r, 5, 'Fecha:', labelFill, bold10, left, allBorder)
    mergeFill(r, 6, 6, '', null, norm10, left, allBorder)
    r++

    // ── Guardar ────────────────────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    saveAs(blob, `Recibo_Bono_Vacacional_${e.cedula}.xlsx`)
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title><i className="bx bx-receipt me-2"></i>Recibo de Vacaciones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : reciboData ? (
          <div className="row">
            <div className="col-md-6">
              <h6 className="fw-bold border-bottom pb-2 mb-3">Datos del Empleado</h6>
              <table className="table table-sm">
                <tbody>
                  <tr><td className="fw-semibold bg-light" style={{ width: '40%' }}>Cédula</td><td>{reciboData.empleado.cedula}</td></tr>
                  <tr><td className="fw-semibold bg-light">Nombres</td><td>{reciboData.empleado.nombres} {reciboData.empleado.apellidos}</td></tr>
                  <tr><td className="fw-semibold bg-light">Cargo CET</td><td>{reciboData.empleado.cargo_cet || '-'}</td></tr>
                  <tr><td className="fw-semibold bg-light">F. Ingreso</td><td>{formatDate(reciboData.empleado.fecha_ingreso)}</td></tr>
                  <tr><td className="fw-semibold bg-light">Antigüedad</td><td>{reciboData.empleado.anios_antiguedad} años</td></tr>
                  <tr><td className="fw-semibold bg-light">Cuenta Bancaria</td><td>{reciboData.empleado.nro_cuenta_bancaria || '-'}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h6 className="fw-bold border-bottom pb-2 mb-3">Bono Vacacional</h6>
              <table className="table table-sm">
                <tbody>
                  <tr><td className="fw-semibold bg-light" style={{ width: '50%' }}>Sueldo Básico</td><td>{formatCurrency(reciboData.lineas_recibo.sueldo_basico)}</td></tr>
                  <tr><td className="fw-semibold bg-light">Prima Antigüedad</td><td>{formatCurrency(reciboData.lineas_recibo.prima_antiguedad)}</td></tr>
                  <tr><td className="fw-semibold bg-light">Prima Profesionalización</td><td>{formatCurrency(reciboData.lineas_recibo.prima_profesionalizacion)}</td></tr>
                  <tr><td className="fw-semibold bg-light">Prima Transporte</td><td>{formatCurrency(reciboData.lineas_recibo.prima_transporte)}</td></tr>
                  <tr><td className="fw-semibold bg-light">Prima Hogares</td><td>{formatCurrency(reciboData.lineas_recibo.prima_hogares)}</td></tr>
                  <tr><td className="fw-semibold bg-light border-top fw-bold">Total Mensual</td><td className="border-top fw-bold">{formatCurrency(reciboData.lineas_recibo.total_sueldo_mensual)}</td></tr>
                  <tr><td className="fw-semibold bg-light">Días Bono Vac.</td><td>{reciboData.lineas_recibo.dias_bono_vacacional}</td></tr>
                  <tr><td className="fw-semibold bg-light text-success">Bono Vacacional</td><td className="text-success fw-bold">{formatCurrency(reciboData.lineas_recibo.bono_vacacional)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-muted text-center py-4">No se encontraron datos del recibo.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        {reciboData && (
          <Button variant="success" onClick={downloadExcel}>
            <i className="bx bx-spreadsheet me-1"></i> Descargar Excel
          </Button>
        )}
        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalRecibo
