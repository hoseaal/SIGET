// services/pdf/generarReporteBM4.js

import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

// Helper functions (re-used from previous implementations for consistency)
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
      return ten + (unit ? ' y ' + unit : '')
    }
    if (n === 100) return 'cien'
    const hundred = hundreds[Math.floor(n / 100)]
    const rest = convertLessThanOneThousand(n % 100)
    return hundred + (rest ? ' ' + rest : '')
  }

  if (num < 1000) return convertLessThanOneThousand(num)
  const thousands = Math.floor(num / 1000)
  const remainder = num % 1000

  let result = ''
  if (thousands === 1) {
    result += 'mil'
  } else {
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
    year, // Return numeric year as well
    yearInWords,
    time: `${hours}:${strMinutes} ${ampm}`
  }
}

/**
 * Formats a number to Venezuelan currency format.
 * @param {number|string} value
 * @returns {string}
 */
function formatCurrencyBs (value) {
  const numValue = parseFloat(value)
  if (typeof numValue !== 'number' || isNaN(numValue)) {
    return '0,00'
  }
  return numValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const generarReporteBM4 = (datos) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true })

    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    const outputPath = path.join(tempDir, `reporte_BM4_${Date.now()}.pdf`)

    const stream = fs.createWriteStream(outputPath)
    doc.pipe(stream)

    const { month, year } = formatCurrentDateTime()

    // Data from inputs (with fallbacks and formatting)
    const existenciaAnterior = formatCurrencyBs(datos.existenciaAnterior)
    const incorporacionesMesActual = formatCurrencyBs(datos.incorporacionesMesActual)
    const desincorporacionesMesActual = formatCurrencyBs(datos.desincorporacionesMesActual)
    const excepcionFaltantes = formatCurrencyBs(datos.excepcionFaltantes)
    const faltantesPorInvestigar = formatCurrencyBs(datos.faltantesPorInvestigar)
    const existenciaFinal = formatCurrencyBs(datos.existenciaFinal)

    const rightAlignColX = doc.page.width - doc.page.margins.right

    const drawFinancialLine = (label, value) => {
      doc.font('Helvetica').fontSize(10)
      const currentY = doc.y

      // Convertir el valor a string y asegurar 2 decimales
      const formattedValue = (value !== undefined && value !== null)
        ? parseFloat(value).toFixed(2)
        : '0.00' // Valor por defecto si es nulo/indefinido

      // Calcular anchos de la etiqueta y el valor formateado
      const labelWidth = doc.widthOfString(label)
      const valueWidth = doc.widthOfString(formattedValue)

      // Posiciones X
      const labelX = doc.page.margins.left
      const valueX = rightAlignColX - valueWidth // Alinear el valor a la derecha

      // Pequeños espacios de separación
      const gapBetweenLabelAndDots = 5
      const gapBetweenDotsAndValue = 5

      // Imprimir la etiqueta
      doc.text(label, labelX, currentY)

      // Calcular y dibujar los puntos
      const dotsStartX = labelX + labelWidth + gapBetweenLabelAndDots
      const dotsEndX = valueX - gapBetweenDotsAndValue

      if (dotsEndX > dotsStartX) {
        const dotsLength = dotsEndX - dotsStartX
        const dotWidth = doc.widthOfString('.')
        const numDots = Math.floor(dotsLength / dotWidth)

        if (numDots > 0) {
          doc.text('.'.repeat(numDots), dotsStartX, currentY)
        }
      }

      // Imprimir el valor numérico
      doc.text(formattedValue, valueX, currentY)

      doc.moveDown(0.5) // Mover el cursor para la siguiente línea
    }

    // --- DRAW HEADER ---
    const logoPath = path.join(process.cwd(), 'public', 'img', 'logo-contraloria-home1.png')
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.margins.left, doc.page.margins.top, { width: 70 })
    } else {
      console.warn(`Logo no encontrado en ${logoPath}. Saltando logo.`)
    }

    doc.moveDown(2) // Space after logo

    // FORMULARIO BM-4 and HOJA N°: 01 (right-aligned)
    doc.font('Helvetica-Bold').fontSize(10)
    doc.text('FORMULARIO BM-4', { align: 'right' })
    doc.text('HOJA N°: 01', { align: 'right' })
    doc.moveDown(0.5)

    // RESUMEN DE LA CUENTA DE BIENES MUEBLES (centered and bold)
    doc.font('Helvetica-Bold').fontSize(12)
    doc.text('RESUMEN DE LA CUENTA DE BIENES MUEBLES', { align: 'center' })
    doc.text('DE LA UNIDAD: Contraloría del Estado Táchira', { align: 'center' })
    doc.moveDown(1)

    // Location and month/year (justified)
    doc.font('Helvetica').fontSize(10)
    doc.text(`ESTADO: Táchira MUNICIPIO: San Cristóbal PARROQUIA: La Concordia
CORRESPONDIENTE AL MES DE: ${month.toUpperCase()} de ${year} (Cifras Convencionales)`, {
      align: 'justify'
    })
    doc.moveDown(1.5)

    // Function to draw a label, dots, and a value

    drawFinancialLine('Existencia anterior: ', existenciaAnterior)
    drawFinancialLine('Incorporaciones en el mes de la cuenta: ', incorporacionesMesActual)
    drawFinancialLine('Desincorporaciones en el mes de la cuenta por todos los conceptos: ', desincorporacionesMesActual)
    drawFinancialLine('Con excepción del 60, “Faltantes de Bienes por investigar”: ', excepcionFaltantes)
    drawFinancialLine('Desincorporaciones en el mes de la cuenta por el concepto 60, “Faltante de Bienes por Investigar”: ', faltantesPorInvestigar)
    drawFinancialLine('Existencia Final: ', existenciaFinal)

    doc.moveDown(3)

    // --- SIGNATURES ---
    const signatureLineYOffset = 15 // Space for the line below text

    const drawSignatureBlockLeft = (label, name) => {
      doc.font('Helvetica').fontSize(10)
      doc.text(label, doc.page.margins.left)
      doc.moveDown(0.2) // Small gap before line
      const lineY = doc.y
      doc.text(name, doc.page.margins.left, lineY + 5, { width: 250, align: 'center' }) // Centered below line
      doc.moveDown(signatureLineYOffset / 12)
      doc.y += signatureLineYOffset // Advance for next block
    }

    drawSignatureBlockLeft('FIRMA DEL DIRECTOR DE LA UNIDAD DE TRABAJO: _____________________')
    doc.moveDown(1)
    drawSignatureBlockLeft('FIRMA DEL JEFE DE DIVISION DE COMPRAS BIENES E INVENTARIOS: _____________________')
    doc.moveDown(1)
    drawSignatureBlockLeft('FIRMA DEL ANALISTA DE BIENES E INVENTARIOS: _____________________')
    doc.moveDown(1)
    drawSignatureBlockLeft('FIRMA DEL ASISTENTE DE BIENES E INVENTARIO: _____________________')

    doc.moveDown(2)

    // --- FOOTER ---
    doc.font('Helvetica').fontSize(10)
    doc.text('ORIGINAL: Departamento de Compras Bienes e Inventario', doc.page.margins.left)

    // --- FINAL DOCUMENT ---
    doc.end()

    stream.on('finish', () => resolve(outputPath))
    stream.on('error', (err) => reject(err))
  })
}
