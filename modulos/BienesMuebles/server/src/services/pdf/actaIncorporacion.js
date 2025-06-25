import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

// --- HELPER FUNCTIONS ---

// Function to convert numbers to words (for the year)
function numberToWords (num) {
  const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
  const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']
  const tens = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
  const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']

  if (num === 0) return 'cero'

  function convertLessThanOneThousand (n) {
    if (n < 10) return units[n]
    if (n < 20) return teens[n - 10]
    if (n < 100) {
      const ten = tens[Math.floor(n / 10)]
      const unit = units[n % 10]
      if (ten === 'veinte') {
        return unit ? 'veinti' + unit : 'veinte'
      } else {
        return ten + (unit ? ' y ' + unit : '')
      }
    }
    // For numbers like 100, 200...
    if (n === 100) return 'cien'
    const hundred = hundreds[Math.floor(n / 100)]
    const rest = convertLessThanOneThousand(n % 100)
    return hundred + (rest ? ' ' + rest : '')
  }

  if (num < 1000) return convertLessThanOneThousand(num)
  // For "dos mil veinticinco" (2025) format for years, we only need up to thousands
  const thousands = Math.floor(num / 1000)
  const remainder = num % 1000

  let result = ''
  if (thousands === 1) { // "mil"
    result += 'mil'
  } else { // "dos mil", "tres mil"
    result += units[thousands] + ' mil'
  }

  if (remainder > 0) {
    result += ' ' + convertLessThanOneThousand(remainder)
  }

  return result.trim()
}

function formatCurrentDateTime () {
  const now = new Date()
  const day = now.getDate()
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]
  const month = monthNames[now.getMonth()]
  const year = now.getFullYear()
  const yearInWords = numberToWords(year)

  let hours = now.getHours()
  const minutes = now.getMinutes()
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.'
  hours = hours % 12
  hours = hours || 12 // the hour '0' should be '12'
  const strMinutes = minutes < 10 ? '0' + minutes : minutes

  return {
    day,
    month,
    yearInWords,
    time: `${hours}:${strMinutes} ${ampm}`
  }
}

function toUpperCase (str) {
  return str ? String(str).toUpperCase() : 'N/A'
}

// --- PDF GENERATION SERVICE ---

export const generarActaIncorporacion = (datos) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true }) // Increased margin for consistency

    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    const outputPath = path.join(tempDir, `acta_incorporacion_${Date.now()}.pdf`)

    const stream = fs.createWriteStream(outputPath)
    doc.pipe(stream)

    // Current date and time for the document
    const { day, month, yearInWords, time } = formatCurrentDateTime()

    // Ensure all string variables are uppercase and cleaned
    const nombreDirectorAdmin = toUpperCase(datos.nombreDirectorAdmin)
    const ciDirectorAdmin = datos.ciDirectorAdmin || 'N/A'
    const nombreDirectorAsignacion = toUpperCase(datos.nombreDirectorAsignacion)
    const ciDirectorAsignacion = datos.ciDirectorAsignacion || 'N/A'
    const unidadAsignacion = toUpperCase(datos.unidadAsignacion)
    const nombreJefeCompras = toUpperCase(datos.nombreJefeCompras)
    const ciJefeCompras = datos.ciJefeCompras || 'N/A'
    const nombreAnalistaBienes = toUpperCase(datos.nombreAnalistaBienes)
    const ciAnalistaBienes = datos.ciAnalistaBienes || 'N/A'
    const codigoBien = datos.codigoBien || 'N/A'
    const unidadDestino = toUpperCase(datos.unidadDestino)
    const numeroActa = datos.numeroActa || 'N/A'
    const nombreFuncionarioElabora = toUpperCase(datos.nombreFuncionarioElabora)

    // --- DIBUJAR ENCABEZADO ---
    const logoPath = path.join(process.cwd(), 'public', 'img', 'logo-contraloria-home1.png') // Adjust path if necessary
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.margins.left, doc.page.margins.top, { width: 70 })
    } else {
      console.warn(`Logo no encontrado en ${logoPath}. Saltando logo.`)
    }

    doc.moveDown(2) // Space after logo/top content

    // --- TITULO DEL ACTA ---
    doc.font('Helvetica-Bold').fontSize(14).text('ACTA DE INCORPORACIÓN DEL BIEN MUEBLE', { align: 'center' })
    doc.fontSize(12).text(`No. ${numeroActa}`, { align: 'center' })
    doc.moveDown(2)

    // --- CUERPO DEL ACTA ---
    doc.font('Helvetica').fontSize(12) // Standard body font and size
    doc.x = doc.page.margins.left // Reset X to left margin

    const introText = `En la ciudad de San Cristóbal a los ${day} días del mes de ${month} del año ${yearInWords} siendo las ${time} reunidos en la sede de la Contraloría del Estado Táchira, Municipio San Cristóbal, Parroquia La Concordia, en la Dirección de Administración, los abajo firmantes: ${nombreDirectorAdmin} titular de la cédula de identidad No. ${ciDirectorAdmin} Director(a) de Administración; ${nombreDirectorAsignacion} titular de la Cédula de Identidad No. ${ciDirectorAsignacion} Director(a) de ${unidadAsignacion}, ${nombreJefeCompras} titular de la Cédula de Identidad No.${ciJefeCompras} Jefe de la División de Compras, Bienes e Inventarios, ${nombreAnalistaBienes} titular de la cédula de identidad N°${ciAnalistaBienes} Analista de Bienes e Inventarios IV, para dejar constancia por medio de la presente acta de la `

    doc.text(introText, { align: 'justify', continued: true }) // Use continued to flow into bold text
    doc.font('Helvetica-Bold').text('INCORPORACIÓN', { continued: true })
    doc.font('Helvetica').text(` del bien que se detalla a continuación: Código. ${codigoBien} Se incorpora el anterior bien a la ${unidadDestino}.`)
    doc.moveDown(1)
    doc.text('En fe de lo expuesto, se elaboran tres ejemplares a un solo tenor y un mismo efecto y en conformidad firman:')
    doc.moveDown(3) // Space before signatures

    // --- FIRMAS EN DOS COLUMNAS CON DOS FILAS CADA UNA ---
    const signatureLineHeight = 20 // Height of the line itself
    const signatureTextGap = 5 // Gap between line and name
    const textToTextGap = 15 // Gap between name and title
    const rowGap = 50 // Vertical space between signature rows

    const col1X = doc.page.margins.left
    const col2X = doc.page.width / 2 // Start of the second column
    const colWidth = (doc.page.width / 2) - doc.page.margins.right - 10 // Width of each signature column

    let currentSignatureY = doc.y

    const drawSignatureBlock = (name, title, startX, width, yPos) => {
      doc.font('Helvetica').fontSize(10) // Standard font for signature text
      // Draw the line first
      doc.moveTo(startX + 10, yPos).lineTo(startX + width - 10, yPos).stroke() // Adjust start/end for line width
      doc.text(name, startX, yPos + signatureTextGap, { width, align: 'center' })
      doc.text(title, startX, yPos + signatureTextGap + textToTextGap, { width, align: 'center' })
    }

    // Row 1: Director(a) de Administración & Director(a) ó Jefe de Oficina
    drawSignatureBlock(nombreDirectorAdmin, 'Director(a) de Administración', col1X, colWidth, currentSignatureY)
    drawSignatureBlock(nombreDirectorAsignacion, `Director(a) ${unidadAsignacion}`, col2X, colWidth, currentSignatureY)

    currentSignatureY += rowGap + (signatureLineHeight + signatureTextGap + textToTextGap) // Move down for next row

    // Row 2: Jefe División de Compras, Bienes e Inventarios & Analista de Bienes e Inventarios
    drawSignatureBlock(nombreJefeCompras, 'Jefe División de Compras, Bienes e Inventarios', col1X, colWidth, currentSignatureY)
    drawSignatureBlock(nombreAnalistaBienes, 'Analista de Bienes e Inventarios IV', col2X, colWidth, currentSignatureY)

    doc.y = currentSignatureY + rowGap // Move cursor past all signatures

    // --- INICIALES DEL FUNCIONARIO QUE ELABORA EL ACTA (RIGHT ALIGNED) ---
    doc.moveDown(2) // Add some space
    doc.x = doc.page.margins.left // Reset X to left before setting right alignment
    doc.font('Helvetica').fontSize(10).text(`Iniciales del funcionario que elabora el Acta: ${nombreFuncionarioElabora.split(' ').map(n => n.charAt(0)).join('')}`, { align: 'left' })

    // --- FINALIZAR DOCUMENTO ---
    doc.end()

    stream.on('finish', () => resolve(outputPath))
    stream.on('error', (err) => reject(err))
  })
}
