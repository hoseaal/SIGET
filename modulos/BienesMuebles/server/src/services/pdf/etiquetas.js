// services/pdf/etiquetas.js

import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

// Constantes para las dimensiones de la etiqueta en puntos (1 pulgada = 72 puntos, 1 cm ≈ 28.35 puntos)
const TAG_WIDTH = 12 * (72 / 2.54)
const TAG_HEIGHT = 7 * (72 / 2.54)

export function generarEtiquetasPDF (bienes) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'letter', // Tamaño de página: Carta (8.5 x 11 pulgadas = 612 x 792 puntos)
      margins: { top: 30, bottom: 30, left: 30, right: 30 } // Márgenes mínimos de la página
    })

    const tempFileName = `etiquetas_bienes_${Date.now()}.pdf`
    const tempDirPath = path.join(process.cwd(), 'temp')

    const logoPath = path.join(process.cwd(), 'public', 'img', 'logo-contraloria-home1.png')

    try {
      if (!fs.existsSync(tempDirPath)) {
        fs.mkdirSync(tempDirPath, { recursive: true })
      }
    } catch (mkdirErr) {
      return reject(new Error(`Fallo al crear directorio temporal: ${mkdirErr.message}`))
    }

    const tempFilePath = path.join(tempDirPath, tempFileName)

    const stream = fs.createWriteStream(tempFilePath)
    doc.pipe(stream)

    stream.on('error', (streamErr) => {
      reject(new Error(`Fallo en el stream de escritura: ${streamErr.message}`))
    })
    stream.on('finish', () => {
      resolve(tempFilePath) // <-- La Promesa se resuelve cuando el archivo está completamente escrito
    })

    doc.on('end', () => {
      // El documento PDF ha terminado de generar su contenido, pero el stream de archivo aún puede estar escribiendo.
      // La Promesa se resuelve en 'stream.on(finish)'.
    })
    doc.on('error', (docErr) => {
      reject(new Error(`Error de generación de PDF: ${docErr.message}`))
    })

    const pageLeftMargin = doc.page.margins.left
    const pageTopMargin = doc.page.margins.top
    const availablePageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
    const availablePageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom

    const tagsToFitVertically = Math.floor(availablePageHeight / TAG_HEIGHT)
    const verticalSpacing = (availablePageHeight - (tagsToFitVertically * TAG_HEIGHT)) / (tagsToFitVertically + 1)

    let currentY = pageTopMargin + verticalSpacing
    let currentX = pageLeftMargin + (availablePageWidth - TAG_WIDTH) / 2

    bienes.forEach((bien, index) => {
      if (index > 0 && index % tagsToFitVertically === 0) {
        doc.addPage()
        currentY = pageTopMargin + verticalSpacing
        currentX = pageLeftMargin + (availablePageWidth - TAG_WIDTH) / 2
      }

      doc.rect(currentX, currentY, TAG_WIDTH, TAG_HEIGHT).stroke()

      const tagContentPadding = 10
      const tagContentX = currentX + tagContentPadding
      const tagContentRightX = currentX + TAG_WIDTH - tagContentPadding
      let contentY = currentY + tagContentPadding

      // Logo
      const logoWidth = 60
      const logoHeight = 40
      try {
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, tagContentX, contentY, { width: logoWidth, height: logoHeight })
        }
      } catch (imageErr) {
        // En un entorno de producción, podrías querer registrar esto con una librería de logging
        // para no detener la generación de PDFs por un problema de imagen,
        // pero sin imprimir en consola directamente.
      }

      // Título centrado
      const titleText = 'Contraloría del Estado Táchira\nDirección de Administración'
      doc.font('Helvetica-Bold').fontSize(8)
      const titleHeight = doc.heightOfString(titleText, { width: TAG_WIDTH - (tagContentPadding * 2) })
      const titleX = currentX + (TAG_WIDTH - doc.widthOfString(titleText)) / 2
      const effectiveLogoHeight = 60
      doc.text(titleText, titleX, contentY + (effectiveLogoHeight / 2) - (titleHeight / 2), { align: 'center', width: TAG_WIDTH - (tagContentPadding * 2) })

      // Fecha actual (alineada a la derecha)
      const currentDate = new Date()
      const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`
      const dateText = `Fecha: ${formattedDate}`
      doc.font('Helvetica').fontSize(8)
      const dateWidth = doc.widthOfString(dateText)
      doc.text(dateText, tagContentRightX - dateWidth, contentY)

      // Información del bien (alineada a la izquierda)
      contentY = Math.max(contentY + effectiveLogoHeight, currentY + tagContentPadding + titleHeight + 5)
      doc.moveDown(0.5)
      doc.font('Helvetica').fontSize(9)
      doc.text(`Número del bien: ${bien.bim_ide}`, tagContentX, contentY)
      contentY += 14
      doc.text(`Ubicación: ${bien.departamento}`, tagContentX, contentY)
      contentY += 14
      doc.text(`Fecha de asignación: ${bien.bim_fec}`, tagContentX, contentY)

      currentY += TAG_HEIGHT + verticalSpacing
    })

    doc.end()
  })
}
