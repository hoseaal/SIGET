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

      doc.fontSize(15).text('ACTA DE INCORPORACIÓN DEL BIEN MUEBLE', {
        align: 'center'
      })
      doc.moveDown(0.5)
      doc.fontSize(12).text(`No. ${datos.numeroActa || 'xxx-201X'}`, { align: 'center' })

      // Cuerpo
      doc.moveDown(1)
      doc.fontSize(11).text(`En la ciudad de ${datos.ciudad || 'San Cristóbal'} a los ${datos.dia || '___ (1)___'} días del mes de ${datos.mes || '___ (2)___'} del año dos mil ${datos.anio || '___ (3)___'} siendo las ${datos.hora || '___ (4)___'} reunidos en la sede de la Contraloría del Estado Táchira, Municipio San Cristóbal, Parroquia La Concordia, en la Dirección de Administración, los abajo firmantes: ${datos.nombreDirectorAdmin || '___ (5)___'} titular de la cédula de identidad No. V.${datos.ciDirectorAdmin || '___ (6)___'} Director(a) de Administración; ${datos.nombreDirectorAsignacion || '___ (7)___'} titular de la Cédula de Identidad No. V.${datos.ciDirectorAsignacion || '___ (8)___'} Director(a) "${datos.unidadAsignacion || 'donde se asignará el bien mueble'}", ${datos.nombreJefeCompras || '___ (9)___'} titular de la Cédula de Identidad No. V.${datos.ciJefeCompras || '___ (10)___'} Jefe de la División de Compras, Bienes e Inventarios, ${datos.nombreAnalistaBienes || '___ (11)___'} titular de la cédula de identidad N° V.${datos.ciAnalistaBienes || '___ (12)___'} Analista de Bienes e Inventarios IV, para dejar constancia por medio de la presente acta de la INCORPORACIÓN de ${datos.descripcionIncorporacion || '___ (13)___'} del bien que se detalla a continuación:`)

      doc.moveDown()
      doc.text(`Código: ${datos.codigoBien || '___ (14)___'}`)
      doc.text(`Se incorpora el anterior bien a la ${datos.unidadDestino || '___ (15)___'}.`)

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

      doc.end()

      stream.on('finish', () => resolve(outputPath))
      stream.on('error', reject)
    } catch (error) {
      reject(error)
    }
  })
}

export function generarActaCET (datos) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' })
      const outputPath = `acta_cet_${Date.now()}.pdf`
      const stream = fs.createWriteStream(outputPath)
      doc.pipe(stream)

      doc.font('Helvetica')

      doc.fontSize(15).text('ACTA C.E.T.', { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(12).text(`No. ${datos.numeroActa || 'xxx-20XX'}`, { align: 'center' })

      doc.moveDown(1)
      doc.fontSize(11).text(`En la ciudad de ${datos.ciudad || 'San Cristóbal'}, a los ${datos.dia || '___'} días del mes de ${datos.mes || '___'} de ${datos.anio || '____'}, siendo las ${datos.hora || '___'}, reunidos en la sede de la Contraloría del Estado Táchira, Municipio San Cristóbal, Parroquia la Concordia, en la Dirección de Administración, los Ciudadanos: ${datos.nombreDirectorAdmin || '___'} titular de la cédula de identidad Nº V-${datos.ciDirectorAdmin || '__________'}, ${datos.nombreJefeCompras || '___'}, titular de la cédula de identidad Nº V-${datos.ciJefeCompras || '__________'}, Jefe de División General Bienes Compras e Inventarios; y ${datos.nombreDirectorServicios || '___'}, titular de Cédula de Identidad Nº V-${datos.ciDirectorServicios || '__________'}, Director de Servicios Generales, Seguridad y Transporte, para dejar constancia por medio de la presente acta de la INCORPORACIÓN, BAJO EL CONCEPTO DE ${datos.conceptoMovimiento || 'COMPRA'} (Código 0${datos.cod_conceptoMov || '03'}), del bien que se detalla a continuación:`)

      doc.moveDown()
      doc.text(`Código: ${datos.codigoBien || '___'}`)

      doc.moveDown(0.5)
      doc.text(`${datos.descripcionIncorporacion || '___'}. Marca: ${datos.marca || '___'}, Modelo: ${datos.modelo || '___'}, Color: ${datos.color || '___'}.`)

      doc.moveDown(1)
      doc.text(`Se incorpora el anterior bien a la ${datos.unidadDestino || '___'}.`)

      doc.moveDown()
      doc.text('En fe de lo expuesto, se elaboran tres ejemplares a un solo tenor y un mismo efecto y en conformidad firman:')

      // Firmas
      doc.moveDown(2)
      const firmaY = doc.y

      doc.text(`${datos.nombreDirectorAdmin || '___'}`, 70, firmaY)
      doc.text('Directora de Administración', 70, firmaY + 15)

      doc.text(`${datos.nombreJefeCompras || '___'}`, 330, firmaY)
      doc.text('Jefe de Bienes Compras e Inventarios', 330, firmaY + 15)

      doc.moveDown(4)
      doc.text(`${datos.nombreDirectorServicios || '___'}`, { align: 'center' })
      doc.text('Director de Servicios Generales, Seguridad y Transporte', { align: 'center' })

      doc.end()

      stream.on('finish', () => resolve(outputPath))
      stream.on('error', reject)
    } catch (error) {
      reject(error)
    }
  })
}
