import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export const generarReporteBM2 = ({ datos, nombreJefe }) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    const outputPath = path.join(process.cwd(), 'temp', `reporte_BM2_${Date.now()}.pdf`)
    const stream = fs.createWriteStream(outputPath)
    doc.pipe(stream)

    try {
      // Configuración inicial
      doc.font('Helvetica')

      // Encabezado
      doc.fontSize(12)
        .text('FORMULARIO BM-2', { align: 'center', underline: true })
        .moveDown(0.5)
        .text('RELACIÓN DEL MOVIMIENTO DE BIENES MUEBLES', { align: 'center', bold: true })
        .moveDown()

      // Información institucional
      const infoInstitucional = [
        'ESTADO: Táchira',
        'MUNICIPIO: San Cristóbal',
        'PARROQUIA: La Concordia',
        'Dirección: Prolongación 5TA. Avenida, Edif. Cremco',
        'DEPENDENCIA: Contraloría del Estado Táchira',
        'SERVICIO: Dirección de Administración',
        'UNIDAD DE TRABAJO: Contraloría del Estado Táchira'
      ]

      infoInstitucional.forEach(line => doc.text(line))
      doc.moveDown()

      // Tabla de datos
      const headers = [
        { text: 'Grupo', x: 50 },
        { text: 'Subgrupo', x: 115 },
        { text: 'Concepto', x: 180 },
        { text: 'Cantidad', x: 245 },
        { text: 'ID', x: 310 },
        { text: 'Descripción', x: 375 },
        { text: 'Incorp. Bs.', x: 480 },
        { text: 'Desincorp. Bs.', x: 545 }
      ]

      // Cabecera de tabla
      doc.font('Helvetica-Bold')
      headers.forEach(header => doc.text(header.text, header.x, doc.y))
      doc.moveDown()

      // Filas de datos
      doc.font('Helvetica')
      datos.forEach(item => {
        const y = doc.y
        doc.text(item.grupo || '-', 50, y)
        doc.text(item.subgrupo || '-', 115, y)
        doc.text(item.com_ide || '-', 180, y)
        doc.text('01', 245, y) // Cantidad fija según formato
        doc.text(item.bim_ide || '-', 310, y)
        doc.text(item.bim_des || '-', 375, y, { width: 100, lineBreak: false })
        doc.text(item.bim_inc === 1 ? item.bim_val.toFixed(2) : '-', 480, y)
        doc.text(item.bim_inc === 0 ? item.bim_val.toFixed(2) : '-', 545, y)
        doc.moveDown()
      })

      // Totales
      const totalIncorp = datos.filter(i => i.bim_inc === 1).reduce((sum, i) => sum + (i.bim_val || 0), 0)
      const totalDesinc = datos.filter(i => i.bim_inc === 0).reduce((sum, i) => sum + (i.bim_val || 0), 0)

      doc.moveDown()
        .font('Helvetica-Bold')
        .text(`TOTAL INCORPORACIONES: ${totalIncorp.toFixed(2)} Bs.`, { align: 'right' })
        .text(`TOTAL DESINCORPORACIONES: ${totalDesinc.toFixed(2)} Bs.`, { align: 'right' })

      // Firma
      doc.moveDown(3)
        .text('FIRMA DEL JEFE DE LA UNIDAD DE TRABAJO: ______________________________', { align: 'left' })
        .text(`Lcda. ${nombreJefe || '________________'}`, { align: 'left', indent: 50 })

      doc.end()
    } catch (error) {
      reject(error)
    }

    stream.on('finish', () => resolve(outputPath))
    stream.on('error', reject)
  })
}
