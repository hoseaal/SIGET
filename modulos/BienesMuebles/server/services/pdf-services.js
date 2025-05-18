import PDFDocument from 'pdfkit'
import fs from 'fs'

export function generarActaIncorporacion (datos) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' })
      const outputPath = `acta_incorporacion_${Date.now()}.pdf`
      const stream = fs.createWriteStream(outputPath)
      doc.pipe(stream)

      // Fuente base
      doc.font('Helvetica')

      // Encabezado
      doc.fontSize(11).text('MANUAL DE NORMAS Y PROCEDIMIENTOS', { align: 'center' })
      doc.text('DIVISIÓN DE COMPRAS, BIENES E INVENTARIOS', { align: 'center' })
      doc.text(`Fecha de Actualización: ${datos.fechaActualizacion || 'DICIEMBRE 2015'}`, { align: 'right' })

      doc.moveDown()
      doc.text('Código: DDA', { align: 'left' })
      doc.text('DIRECCIÓN DE ADMINISTRACIÓN', { align: 'center' })
      doc.text('Código: FDDA-DCBI/06', { align: 'right' })

      doc.moveDown()
      doc.text('ASUNTO: FORMATOS E INSTRUCTIVOS', { align: 'center' })
      doc.text('Página 1 de 3', { align: 'right' })

      // Títulos
      doc.moveDown(2)
      doc.fontSize(13).text('FIDA-DCBI/06 "ACTA DE INCORPORACIÓN DEL BIEN MUEBLE"', {
        align: 'center',
        underline: true
      })
      doc.moveDown(0.5)
      doc.fontSize(15).text('ACTA DE INCORPORACIÓN DEL BIEN MUEBLE', {
        align: 'center'
      })
      doc.moveDown(0.5)
      doc.fontSize(12).text(`No. ${datos.numeroActa || 'xxx-201X'}`, { align: 'center' })

      // Cuerpo
      doc.moveDown(1)
      doc.fontSize(11).text(`En la ciudad de ${datos.ciudad || 'San Cristóbal'} a los ${datos.dia || '___ (1)___'} días del mes de ${datos.mes || '___ (2)___'} del año dos mil ${datos.anio || '___ (3)___'} siendo las ${datos.hora || '___ (4)___'} reunidos en la sede de la Contraloría del Estado Táchira, Municipio San Cristóbal, Parroquia La Concordia, en la Dirección de Administración, los abajo firmantes: ${datos.nombreDirectorAdmin || '___ (5)___'} titular de la cédula de identidad No. V.${datos.ciDirectorAdmin || '___ (6)___'} Director(a) de Administración; ${datos.nombreDirectorAsignacion || '___ (7)___'} titular de la Cédula de Identidad No. V.${datos.ciDirectorAsignacion || '___ (8)___'} Director(a) "${datos.unidadAsignacion || 'donde se asignará el bien mueble'}", ${datos.nombreJefeCompras || '___ (9)___'} titular de la Cédula de Identidad No. V.${datos.ciJefeCompras || '___ (10)___'} Jefe de la División de Compras, Bienes e Inventarios, ${datos.nombreAnalistaBienes || '___ (11)___'} titular de la cédula de identidad N° V.${datos.ciAnalistaBienes || '___ (12)___'} Analista de Bienes e Inventarios IV, para dejar constancia por medio de la presente acta de la INCORPORACIÓN ${datos.descripcionIncorporacion || '___ (13)___'} del bien que se detalla a continuación:`)

      doc.moveDown()
      doc.text(`Código: ${datos.codigoBien || '___ (14)___'}`)
      doc.text(`Se incorpora el anterior bien a la ${datos.unidadDestino || '___ (15)___'} (Dirección ó Unidad Administrativa donde se asignará el bien mueble).`)

      doc.moveDown()
      doc.text('En fe de lo expuesto, se elaboran tres ejemplares a un solo tenor y un mismo efecto y en conformidad firman:')

      // Nombre del elaborador
      doc.moveDown(1)
      doc.text(`${datos.nombreFuncionarioElabora || '___ (16)___'}`, { align: 'left' })

      // Firmas en dos columnas
      const firmaY = doc.y + 20
      doc.moveDown(1)

      // Columna izquierda
      doc.text('Director(a) de Administración', 60, firmaY, { underline: true })
      doc.text('Jefe División de Compras, Bienes e Inventarios', 60, firmaY + 40, { underline: true })
      doc.text('Iniciales del funcionario que elabora el Acta.', 60, firmaY + 80, { underline: true })

      // Columna derecha
      doc.text('Director(a) ó Jefe de Oficina', 330, firmaY, { underline: true })
      doc.text('Analista de Bienes e Inventarios IV', 330, firmaY + 40, { underline: true })

      // Pie de revisores
      const pieY = firmaY + 140
      const colW = 130
      doc.fontSize(9)

      doc.text('Elaborado por:', 50, pieY, { underline: true })
      doc.text('Revisado por:', 50 + colW, pieY, { underline: true })
      doc.text('Revisado por:', 50 + colW * 2, pieY, { underline: true })
      doc.text('Aprobado por:', 50 + colW * 3, pieY, { underline: true })

      doc.text('Analista de Organización y Métodos', 50, pieY + 20)
      doc.text('Director(a) Técnico', 50 + colW, pieY + 20)
      doc.text('Director(a) de Administración', 50 + colW * 2, pieY + 20)
      doc.text('Contralor(a) del Estado Táchira', 50 + colW * 3, pieY + 20)

      doc.text('Resolución C.E.T. Nº 420', 50 + colW * 3, pieY + 40)
      doc.text('Fecha: 21/12/2015', 50 + colW * 3, pieY + 55)

      doc.end()

      stream.on('finish', () => resolve(outputPath))
      stream.on('error', reject)
    } catch (error) {
      reject(error)
    }
  })
}
