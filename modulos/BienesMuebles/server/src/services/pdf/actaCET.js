/* eslint-disable indent */
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export const generarActaCET = (datos) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    const outputPath = path.join(process.cwd(), 'temp', `acta_cet_${Date.now()}.pdf`)

    // Validación básica
    if (!datos.numeroActa || !datos.ciudad) {
      reject(new Error('Faltan campos requeridos: numeroActa y ciudad'))
      return
    }

    const stream = fs.createWriteStream(outputPath)
    doc.pipe(stream)

    try {
      // Encabezado
      doc.font('Helvetica-Bold')
         .fontSize(15)
         .text('ACTA C.E.T.', { align: 'center' })
         .moveDown(0.5)
         .fontSize(12)
         .text(`No. ${datos.numeroActa}`, { align: 'center' })

      // Cuerpo
      doc.moveDown(1)
         .font('Helvetica')
         .fontSize(11)
         .text(
           `En la ciudad de ${datos.ciudad || 'San Cristóbal'}, a los ${datos.dia || '___'} días del mes de ${datos.mes || '___'} de ${datos.anio || '____'}, siendo las ${datos.hora || '___'}, reunidos en la sede de la Contraloría del Estado Táchira, Municipio San Cristóbal, Parroquia la Concordia, en la Dirección de Administración, los Ciudadanos: ${datos.nombreDirectorAdmin || '___'} titular de la cédula de identidad Nº V-${datos.ciDirectorAdmin || '__________'}, ${datos.nombreJefeCompras || '___'}, titular de la cédula de identidad Nº V-${datos.ciJefeCompras || '__________'}, Jefe de División General Bienes Compras e Inventarios; y ${datos.nombreDirectorServicios || '___'}, titular de Cédula de Identidad Nº V-${datos.ciDirectorServicios || '__________'}, Director de Servicios Generales, Seguridad y Transporte, para dejar constancia por medio de la presente acta de la INCORPORACIÓN, BAJO EL CONCEPTO DE ${datos.conceptoMovimiento || 'COMPRA'} (Código 0${datos.cod_conceptoMov || '03'}), del bien que se detalla a continuación:`,
           {
             align: 'justify',
             lineGap: 5
           }
         )

      // Detalles del bien (estructura clara)
      const detallesBien = [
        `Código: ${datos.codigoBien || '___'}`,
        `${datos.descripcionIncorporacion || '___'}.`,
        `Marca: ${datos.marca || '___'}`,
        `Modelo: ${datos.modelo || '___'}`,
        `Color: ${datos.color || '___'}`
      ]

      doc.moveDown()
         .text(detallesBien.join('\n'))

      // Firmas (estructura tabular)
      doc.moveDown(2)
      const startY = doc.y

      // Columna izquierda
      doc.text(datos.nombreDirectorAdmin || '________________', 70, startY)
         .fontSize(9)
         .text('Directora de Administración', 70, startY + 20)

      // Columna derecha
      doc.fontSize(11)
         .text(datos.nombreJefeCompras || '________________', 330, startY)
         .fontSize(9)
         .text('Jefe de Bienes Compras e Inventarios', 330, startY + 20)

      // Firma central inferior
      doc.moveDown(4)
         .fontSize(11)
         .text(datos.nombreDirectorServicios || '________________', { align: 'center' })
         .fontSize(9)
         .text('Director de Servicios Generales', { align: 'center' })

      doc.end()
} catch (error) {
      reject(error)
    }

    stream.on('finish', () => resolve(outputPath))
    stream.on('error', reject)
  })
}
