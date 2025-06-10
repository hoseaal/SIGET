/* eslint-disable quotes */
/* eslint-disable indent */
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export const generarActaCET = (datos) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' }) // Consistent margin for A4 size
        const outputPath = path.join(process.cwd(), 'temp', `acta_cet_${Date.now()}.pdf`)

        // Basic validation for critical data
        if (!datos.numeroActa) {
            reject(new Error('Faltan campos requeridos: numeroActa'))
            return
        }

        const stream = fs.createWriteStream(outputPath)
        doc.pipe(stream)

        try {
            // Get current date and time for dynamic content
            const currentDate = new Date()
            const day = currentDate.getDate()
            const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
            const month = monthNames[currentDate.getMonth()]
            const year = currentDate.getFullYear()
            const hours = currentDate.getHours()
            const minutes = currentDate.getMinutes()
            const ampm = hours >= 12 ? 'pm' : 'am'
            const formattedHours = hours % 12 || 12 // Convert to 12-hour format
            const time = `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`

            // --- Header Section ---
            doc.font('Helvetica-Bold')
                .fontSize(15)
                .text('ACTA C.E.T', { align: 'center' })
                .moveDown(0.5)
                .fontSize(12)
                .text(`Nº ${datos.numeroActa || '01'}-${year}`, { align: 'center' }) // Use current year for consistency
            doc.moveDown(1.5) // Add space after header

            // --- Main Justified Paragraph ---
            doc.font('Helvetica').fontSize(11)

            // Construct the main paragraph using the provided data and the current date/time
            const mainParagraph = `En la ciudad de San Cristóbal, a los ${day} días del mes de ${month} de ${year}, siendo las ${time}, ` +
                                  `reunidos en la sede de la Contraloría del Estado Táchira, Municipio San Cristóbal, ` +
                                  `Parroquia la Concordia, en la Dirección de Administración, los Ciudadanos: ` +
                                  `${datos.nombreDirectorAdmin || '___'} titular de la cédula de identidad Nº V-${datos.ciDirectorAdmin || '__________'}, ${datos.nombreJefeCompras || '___'}, titular de la cédula de identidad Nº V-${datos.ciJefeCompras || '__________'}, Jefe de División General Bienes Compras e Inventarios; y ${datos.nombreDirectorAsignacion || '___'}, titular de Cédula de Identidad Nº V-${datos.ciDirectorAsignacion || '__________'}, Director de ${datos.unidadDestino || '__________________'}, para dejar constancia ` +
                                  `por medio de la presente acta de la INCORPORACIÓN, BAJO EL CONCEPTO DE ` +
                                  `COMPRA (Código 03), del bien que se detalla a continuación: ` +
                                  `Nº${datos.codigoBien} ${datos.tipodeBien || '__________________'}, Marca: ${datos.marca || '__________________'}, ` +
                                  `Modelo: ${datos.modelo || '__________________'}, Color: ${datos.color || '__________________'} ` +
                                  `${datos.descripcionIncorporacion || '_____________________________________'} . Se incorpora el anterior bien a la ${datos.unidadDestino || '______________________________________'}. ` +
                                  `En fe de lo expuesto, se elaboran tres ejemplares a un solo tenor y un mismo efecto y en conformidad firman`

            doc.text(mainParagraph, {
                align: 'justify',
                lineGap: 5,
                indent: 20 // Optional: add a slight indent to the first line of the paragraph
            })
            doc.moveDown(3) // Space before signatures

            // --- Signatures Section ---
            const startYSignatures = doc.y
            const columnWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / 2
            const signatureLineHeight = 15 // Space between name and title

            // Left Column Signature: Dra. Ruth Ruby Apolinar Abbo
            doc.font('Helvetica-Bold').fontSize(10)
            doc.text(`${datos.nombreDirectorAdmin || '___'}`, doc.page.margins.left, startYSignatures, {
                width: columnWidth,
                align: 'left'
            })
            doc.font('Helvetica').fontSize(9)
            doc.text('Director de Administración', doc.page.margins.left, startYSignatures + signatureLineHeight, {
                width: columnWidth,
                align: 'left'
            })

            // Right Column Signature: Abg. Ender Mogollón
            doc.font('Helvetica-Bold').fontSize(10)
            doc.text(`${datos.nombreJefeCompras || '___'}`, doc.page.margins.left + columnWidth, startYSignatures, {
                width: columnWidth,
                align: 'right'
            })
            doc.font('Helvetica').fontSize(9)
            doc.text('Jefe de Bienes Compras e Inventarios', doc.page.margins.left + columnWidth, startYSignatures + signatureLineHeight, {
                width: columnWidth,
                align: 'right'
            })

            doc.moveDown(6) // Space for the signatures to breathe, then move to the center signature

            // Center Signature: Msc. John Camargo (aligned to the whole page)
            doc.font('Helvetica-Bold').fontSize(10)
            doc.text(`${datos.nombreDirectorAsignacion || '___'}`, doc.page.margins.left, doc.y, {
                width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
                align: 'center'
            })
            doc.font('Helvetica').fontSize(9)
            doc.text(`Jefe de, ${datos.unidadDestino || '__________________'}`, doc.page.margins.left, doc.y, {
                width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
                align: 'center'
            })

            doc.end()
        } catch (error) {
            reject(error)
        }

        stream.on('finish', () => resolve(outputPath))
        stream.on('error', reject)
    })
}
