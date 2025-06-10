/* eslint-disable no-unused-vars */
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export const generarReporteBM2 = ({ datos, nombreJefe }) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50 // Set consistent margins as per previous discussion
    })

    const outputPath = path.join(process.cwd(), 'temp', `reporte_BM2_${Date.now()}.pdf`)
    const stream = fs.createWriteStream(outputPath)
    doc.pipe(stream)

    try {
      // --- Header Section ---

      // Company Logo (Top-Left)
      const logoPath = path.join(process.cwd(), 'public', 'img', 'logo-contraloria-home1.png')
      // Ensure the logo file exists before attempting to load it
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.margins.left, doc.page.margins.top, { width: 70 })
      } else {
        console.warn(`Logo not found at ${logoPath}. Skipping logo.`)
      }

      // FORMULARIO BM-2 & HOJA N° 01 (Top-Right)
      doc.font('Helvetica-Bold').fontSize(10)
      doc.text('FORMULARIO BM-2', { align: 'right' }) // [cite : 1]
      doc.text('HOJA N° 01', { align: 'right' })
      doc.moveDown(1.5) // Add some space after the header

      // --- Main Title ---
      doc.font('Helvetica-Bold').fontSize(14)
      doc.text('RELACIÓN DEL MOVIMIENTO DE BIENES MUEBLES', { align: 'center' })
      doc.moveDown(1) // Add some space after the title

      // --- Numbered Information Section ---
      doc.font('Helvetica').fontSize(10)
      const textIndent = doc.page.margins.left + 20 // Indent for the numbered list

      // These are fixed text from your document
      doc.text('8. ESTADO: Táchira', textIndent, doc.y)
      doc.text('9. MUNICIPIO: San Cristóbal', textIndent, doc.y)
      doc.text('10. PARROQUIA: La Concordia', textIndent, doc.y)
      doc.text('Dirección o Lugar: Prolongación 5TA. Avenida, Edif. Cremco, La Concordia, San Cristóbal.', textIndent, doc.y)
      doc.text('11. DEPENDENCIA O UNIDAD PRIMARIA: Contraloría del Estado Táchira', textIndent, doc.y)
      doc.text('12. SERVICIO: Dirección de Administración', textIndent, doc.y)
      doc.text('13. UNIDAD DE TRABAJO O DEPENDENCIA: Contraloría del Estado Táchira', textIndent, doc.y)
      doc.text('14. PERIODO DE LA CUENTA: (mes y año): SEPTIEMBRE 2023', textIndent, doc.y)
      doc.moveDown(1.5) // Add space before the table

      // --- Table Section ---
      const tableHeaders = [
        'GRUPO',
        'SUB GRUPO',
        'CONCEPTO DE MOVIMIENTO',
        'CANTIDAD',
        'NUMERO DE IDENTIFICACION',
        'NOMBRE Y DESCRIPCION DE LOS BIENES REFERENCIA DE LOS COMPROBANTES Y DE LOS PRECIOS UNITARIOS',
        'INCORPORACIONES Bs.',
        'DESINCORPORACIONES Bs.'
      ]

      const startX = doc.page.margins.left
      let startY = doc.y
      const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
      const rowHeight = 75 // Increased row height for better readability of vertical text and potentially multiline descriptions
      const padding = 5

      // Calculate column widths based on your desired proportions
      const columnWidths = [
        tableWidth * 0.05, // GRUPO
        tableWidth * 0.06, // SUB GRUPO
        tableWidth * 0.12, // CONCEPTO DE MOVIMIENTO
        tableWidth * 0.07, // CANTIDAD
        tableWidth * 0.12, // NUMERO DE IDENTIFICACION
        tableWidth * 0.35, // NOMBRE Y DESCRIPCION (widest)
        tableWidth * 0.115, // INCORPORACIONES Bs.
        tableWidth * 0.115 // DESINCORPORACIONES Bs.
      ]

      doc.font('Helvetica-Bold').fontSize(8)

      // Draw table headers
      let currentX = startX
      for (let i = 0; i < tableHeaders.length; i++) {
        const header = tableHeaders[i]
        const width = columnWidths[i]

        doc.rect(currentX, startY, width, rowHeight).stroke() // Draw cell border

        if (i === 5) { // Special handling for the horizontal header
          doc.text(header, currentX + padding, startY + (rowHeight / 2) - 4, {
            width: width - (2 * padding),
            align: 'center',
            valign: 'middle'
          })
        } else { // Vertical headers
          // Save current state to rotate text
          doc.save()
          doc.translate(currentX + width / 2, startY + rowHeight - padding)
          doc.rotate(-90)
          doc.text(header, 0, 0, {
            width: rowHeight - (2 * padding), // The text width is constrained by the cell's height when rotated
            align: 'center',
            valign: 'bottom' // Align text to bottom of the rotated space
          })
          doc.restore()
        }
        currentX += width
      }
      startY += rowHeight

      // Draw table rows
      doc.font('Helvetica').fontSize(8)
      let totalIncorporaciones = 0
      let totalDesincorporaciones = 0

      // Map your 'datos' array to the table structure
      datos.forEach(item => {
        const rowData = [
          item.grupo || '-',
          item.subgrupo || '-',
          item.com_ide || '-', // Assuming com_ide is 'CONCEPTO DE MOVIMIENTO'
          '01', // 'CANTIDAD' always 1 based on provided data structure for single items
          item.bim_ide || '-', // Assuming bim_ide is 'NUMERO DE IDENTIFICACION'
          item.bim_des || '-', // 'NOMBRE Y DESCRIPCION'
          item.bim_inc === 1 ? item.bim_val.toFixed(2) : '0.00', // INCORPORACIONES
          item.bim_inc === 0 ? item.bim_val.toFixed(2) : '0.00' // DESINCORPORACIONES
        ]

        // Calculate total values
        if (item.bim_inc === 1) {
          totalIncorporaciones += item.bim_val || 0
        } else {
          totalDesincorporaciones += item.bim_val || 0
        }

        currentX = startX
        let currentRowMaxHeight = rowHeight // Start with default row height

        // Check for multiline content to adjust row height
        const descriptionTextHeight = doc.heightOfString(rowData[5], { width: columnWidths[5] - (2 * padding) })
        currentRowMaxHeight = Math.max(rowHeight, descriptionTextHeight + (2 * padding))

        // Check if we need a new page before drawing the current row
        if (startY + currentRowMaxHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage()
          startY = doc.page.margins.top
          // Redraw headers on new page
          doc.font('Helvetica-Bold').fontSize(8)
          let headerX = startX
          for (let i = 0; i < tableHeaders.length; i++) {
            const header = tableHeaders[i]
            const width = columnWidths[i]
            doc.rect(headerX, startY, width, rowHeight).stroke()
            if (i === 5) {
              doc.text(header, headerX + padding, startY + (rowHeight / 2) - 4, {
                width: width - (2 * padding),
                align: 'center',
                valign: 'middle'
              })
            } else {
              doc.save()
              doc.translate(headerX + width / 2, startY + rowHeight - padding)
              doc.rotate(-90)
              doc.text(header, 0, 0, {
                width: rowHeight - (2 * padding),
                align: 'center',
                valign: 'bottom'
              })
              doc.restore()
            }
            headerX += width
          }
          startY += rowHeight
          doc.font('Helvetica').fontSize(8) // Revert to normal font for data
        }

        for (let i = 0; i < rowData.length; i++) {
          const cellData = rowData[i]
          const width = columnWidths[i]

          doc.rect(currentX, startY, width, currentRowMaxHeight).stroke() // Draw cell border with adjusted height

          // Calculate text height to center vertically
          const textHeight = doc.heightOfString(cellData, { width: width - (2 * padding) })
          const textY = startY + (currentRowMaxHeight / 2) - (textHeight / 2)

          doc.text(cellData, currentX + padding, textY, {
            width: width - (2 * padding),
            align: (i === 6 || i === 7) ? 'right' : 'left', // Align numeric columns to the right
            valign: 'middle'
          })
          currentX += width
        }
        startY += currentRowMaxHeight // Move to the next row, considering adjusted height
      })

      // Draw TOTAL row from source data
      currentX = startX
      const totalRowHeight = 20 // A fixed height for the total row
      // Empty cells until the 'TOTAL' text
      for (let i = 0; i < 5; i++) { // Skip the first 5 columns for the total text
        doc.rect(currentX, startY, columnWidths[i], totalRowHeight).stroke()

        currentX += columnWidths[i]
      }
      // TOTAL cell (spanning across 'NOMBRE Y DESCRIPCION' column)
      const totalTextWidth = columnWidths[5]
      doc.rect(currentX, startY, totalTextWidth, totalRowHeight).stroke()
      doc.text('TOTAL', currentX + padding, startY + (totalRowHeight / 2) - 4, {
        width: totalTextWidth - (2 * padding),
        align: 'center',
        valign: 'middle'
      })
      currentX += totalTextWidth

      // Total Incorporaciones (from calculated total)
      const totalIncorpWidth = columnWidths[6]
      doc.rect(currentX, startY, totalIncorpWidth, totalRowHeight).stroke()
      doc.text(totalIncorporaciones.toFixed(2), currentX + padding, startY + (totalRowHeight / 2) - 4, {
        width: totalIncorpWidth - (2 * padding),
        align: 'right',
        valign: 'middle'
      })
      currentX += totalIncorpWidth

      // Total Desincorporaciones (from calculated total)
      const totalDesincorpWidth = columnWidths[7]
      doc.rect(currentX, startY, totalDesincorpWidth, totalRowHeight).stroke()
      doc.text(totalDesincorporaciones.toFixed(2), currentX + padding, startY + (totalRowHeight / 2) - 4, {
        width: totalDesincorpWidth - (2 * padding),
        align: 'right',
        valign: 'middle'
      })
      currentX += totalDesincorpWidth
      startY += totalRowHeight

      // --- Footer Section ---
      // doc.y = startY + 30; // Move down after the table - Keep this line as is for spacing

      // Signature
      doc.font('Helvetica').fontSize(10)

      const pageCenterX = doc.page.width / 2
      const textWidthFIRMA = doc.widthOfString('FIRMA')
      const textWidthJEFE = doc.widthOfString('DEL JEFE DE LA UNIDAD DE TRABAJO: __________________________________')
      const textWidthNOMBRE = doc.widthOfString(`${nombreJefe || '________________'}`)

      doc.moveDown(2)
      // Calculate x to center based on the full page width

      doc.text('FIRMA DEL JEFE DE LA UNIDAD DE TRABAJO: __________________________________', doc.page.margins.left, doc.y, {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        align: 'center'
      })
      doc.text(`${nombreJefe || '________________'}`, doc.page.margins.left, doc.y, {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        align: 'center'
      })
      doc.moveDown(1)
      // Copies distribution
      doc.text('ORIGINAL: Oficina de Bienes', doc.page.margins.left)
      doc.text('DUPLICADO: Oficina de Bienes', doc.page.margins.left)
      doc.text('TRIPLICADO: Oficina de Origen (Contraloría del Estado Táchira)', doc.page.margins.left)

      // Finalize PDF file
      doc.end()
    } catch (error) {
      reject(error)
    }

    stream.on('finish', () => resolve(outputPath))
    stream.on('error', reject)
  })
}
