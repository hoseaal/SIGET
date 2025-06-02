import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export const generarActaIncorporacion = (datos) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    const outputPath = path.join(process.cwd(), 'temp', `acta_incorp_${Date.now()}.pdf`)

    // Crear directorio temp si no existe
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    }

    const stream = fs.createWriteStream(outputPath)
    doc.pipe(stream)

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
  })
}
