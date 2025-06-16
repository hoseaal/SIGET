import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch' // O usa el fetch nativo si tu versión de Node.js lo soporta

// --- CONFIGURACIÓN ---
const API_BASE_URL = 'http://localhost:5001' // Reemplaza con la base de tu API

/**
 * Realiza una petición fetch a un endpoint de la API con el token de autenticación.
 * @param {string} endpoint - El endpoint de la API a consultar.
 * @param {string} token - El token de autenticación.
 * @returns {Promise<object|null>}
 */
async function fetchApiData (endpoint, token) {
  const url = `${API_BASE_URL}${endpoint}`
  const options = {
    headers: {
      Cookie: `access_token=${token}`
    }
  }
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`Error en la petición a ${url}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error al hacer fetch a ${url}:`, error)
    return null
  }
}

/**
 * Formatea una fecha ISO a un formato legible en español para las transferencias.
 * @param {string} isoString - La fecha en formato ISO (ej: "2025-06-05T04:00:00.000Z").
 * @returns {string} - La fecha formateada.
 */
function formatFullDate (isoString) {
  const date = new Date(isoString)
  // Usamos toLocaleDateString con las opciones adecuadas para obtener un formato consistente.
  return date.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC' // Importante para evitar corrimientos de día por la zona horaria del servidor
  })
}

/**
 * Genera el PDF del Acta de Verificación de Inventario.
 * @param {object} datosPost - Datos de la petición POST (nombres, cédulas, etc.).
 * @param {string} accessToken - Token de autenticación para la API.
 * @returns {Promise<string>} - Una promesa que resuelve con la ruta del archivo PDF generado.
 */
export const generarActaVerificacionService = (datosPost, accessToken) => {
  return new Promise(async (resolve, reject) => {
    const { dep_ide, departamento_nombre } = datosPost
    if (!dep_ide) {
      return reject(new Error("El 'dep_ide' es requerido en datosPost."))
    }

    // 1. OBTENER TODOS LOS DATOS DE LA API CONCURRENTEMENTE
    try {
      const [
        bienesData,
        malEstadoData,
        prestadosAOtroData,
        prestadosDeOtroData
      ] = await Promise.all([
        fetchApiData(`/api/bienes?dep=${dep_ide}&inc=1`, accessToken),
        fetchApiData(`/api/prestamos/almacen?dep_origen_id=${dep_ide}`, accessToken),
        fetchApiData(`/api/prestamos/normales?dep_origen_ide=${dep_ide}`, accessToken),
        fetchApiData(`/api/prestamos/normales?dep_destino_id=${dep_ide}`, accessToken)
      ])

      if (!bienesData) {
        return reject(new Error('Error crítico: no se pudieron obtener los datos principales de los bienes.'))
      }

      // 2. PROCESAR Y CLASIFICAR LOS DATOS
      const todosLosBienes = bienesData.data || []
      const totalBienesGeneral = bienesData.meta?.total || todosLosBienes.length

      const bienesFaltantes = todosLosBienes.filter(b => b.est_ide === 3)
      const bienesSinEtiqueta = todosLosBienes.filter(b => b.est_ide === 1)

      const extraerBienesPrestamo = (data) => (data || []).map(p => {
        try {
          const detalles = JSON.parse(p.bienes_detalles)
          return { ...p, ...detalles }
        } catch (e) {
          console.warn(`Advertencia: No se pudo decodificar bienes_detalles: ${p.bienes_detalles}`)
          return null
        }
      }).filter(Boolean)

      const bienesMalEstado = extraerBienesPrestamo(malEstadoData)
      const bienesPrestadosAOtro = extraerBienesPrestamo(prestadosAOtroData)
      const bienesPrestadosDeOtro = extraerBienesPrestamo(prestadosDeOtroData)

      const countFaltantes = bienesFaltantes.length
      const countMalEstado = bienesMalEstado.length
      const countPrestadosAOtro = bienesPrestadosAOtro.length
      const countPrestadosDeOtro = bienesPrestadosDeOtro.length
      const countEnServicio = totalBienesGeneral - countFaltantes - countPrestadosAOtro

      // 3. INICIAR LA CREACIÓN DEL PDF
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true })
      const tempDir = path.join(process.cwd(), 'temp')
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

      const outputPath = path.join(tempDir, `acta_verificacion_${dep_ide}_${Date.now()}.pdf`)
      const stream = fs.createWriteStream(outputPath)

      doc.pipe(stream)

      // --- DIBUJAR ENCABEZADO ---
      const logoPath = path.join(process.cwd(), 'public', 'img', 'logo-contraloria-home1.png')
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.margins.left, doc.page.margins.top, { width: 70 })
      } else {
        console.warn(`Logo no encontrado en ${logoPath}. Saltando logo.`)
      }

      doc.font('Helvetica-Bold').fontSize(12).text('DIVISION DE COMPRAS; BIENES E INVENTARIOS', { align: 'center' })
      doc.moveDown(2)

      // --- DIBUJAR TÍTULO ---
      doc.fontSize(14).text('ACTA DE VERIFICACION DEL INVENTARIO DE BIENES MUEBLES', { align: 'center' })
      doc.moveDown(2)

      // --- DIBUJAR PÁRRAFO INTRODUCTORIO CON FECHA ESPECÍFICA ---
      // Usando la fecha y hora proporcionadas: 15 de Junio de 2025.
      const fechaLarga = '15 días del mes de junio de 2025'
      const fechaCorta = '15/06/2025'

      doc.font('Helvetica').fontSize(12)
      const parrafo = `En San Cristóbal a los ${fechaLarga} reunidos en el ${departamento_nombre || 'N/A'} los Ciudadanos: ${datosPost.director_nombre || 'N/A'}, titular de la cédula de identidad N° ${datosPost.director_cedula || 'N/A'} (${datosPost.director_cargo || 'N/A'}) y Lcda. ${datosPost.analista_nombre || 'N/A'}, titular de la cédula de identidad N° ${datosPost.analista_cedula || 'N/A'} (Analista de Bienes e Inventarios I), para dejar constancia de la verificación por percepción directa del inventario físico al ${fechaCorta}, fecha del reporte BM1 bienes adscritos a la Unidad antes mencionada, los cuales ascienden a un total de ${totalBienesGeneral} bienes, según la relación de bienes muebles formulario BM-1.`
      doc.text(parrafo, { align: 'justify' })
      doc.moveDown(2)

      // --- DIBUJAR TABLA DE RESUMEN ---
      const ideEnServicio = todosLosBienes.filter(b => b.est_ide !== 3 && !bienesPrestadosAOtro.some(p => p.bim_ide === b.bim_ide)).map(b => b.bim_ide).join(', ')
      const tableData = [
        { label: 'Bienes en Servicio en la dirección:', total: countEnServicio, obs: ideEnServicio },
        { label: 'Bienes Faltantes:', total: countFaltantes, obs: bienesFaltantes.map(b => b.bim_ide).join(', ') },
        { label: 'Bienes en Mal Estado:', total: countMalEstado, obs: bienesMalEstado.map(b => b.bim_ide).join(', ') },
        { label: 'Bienes en Préstamo a otras direcciones:', total: countPrestadosAOtro, obs: bienesPrestadosAOtro.map(b => b.bim_ide).join(', ') },
        { label: 'Bienes en préstamo de otras direcciones a esta dirección:', total: countPrestadosDeOtro, obs: bienesPrestadosDeOtro.map(b => b.bim_ide).join(', ') }
      ]
      drawTable(doc, tableData)
      doc.moveDown(2)

      // --- SECCIONES DE DETALLES ---
      doc.font('Helvetica-Bold').fontSize(12).text('OBSERVACION: Los siguientes bienes muebles presentan:', { align: 'left' })
      doc.moveDown()

      const drawSection = (title, items, formatter) => {
        if (items && items.length > 0) {
          doc.font('Helvetica-Bold').fontSize(11).text(title, { underline: false })
          doc.moveDown(0.5)
          doc.font('Helvetica').fontSize(10)
          items.forEach(item => doc.text(formatter(item), { indent: 15, paragraphGap: 4 }))
          doc.moveDown()
        }
      }

      drawSection('OBSERVACION: Los siguientes bienes se prestan a:', bienesPrestadosAOtro, b => `EL BIEN N° ${b.bim_ide} ${b.bim_des}. SE DIO EN CALIDAD DE PRÉSTAMO A LA ${b.departamento_destino_nombre} SEGÚN TRANSFERENCIA DEL DÍA ${formatFullDate(b.pre_fec)}.`)
      drawSection('BIENES EN MAL ESTADO QUE FUERON TRASLADADOS A PISO 3 PARA SU RESGUARDO:', bienesMalEstado, b => `${b.bim_ide}: ${b.bim_des}`)
      drawSection(`BIENES EN PRÉSTAMO PARA LA ${departamento_nombre || 'N/A'}:`, bienesPrestadosDeOtro, b => `SEGÚN OFICIO ${b.pre_ndo} DE FECHA ${new Date(b.pre_fec).toLocaleDateString('es-VE', { timeZone: 'UTC' })}: ${b.bim_ide}: ${b.bim_des}`)
      drawSection(`BIENES QUE SE ENCUENTRAN SIN ETIQUETA EN ${departamento_nombre || 'N/A'}:`, bienesSinEtiqueta, b => `${b.bim_ide}: ${b.bim_des}`)
      drawSection('REPORTE DE BIENES FALTANTES:', bienesFaltantes, b => `${b.bim_ide}: ${b.bim_des}`)

      // --- BLOQUES DE FIRMAS ---
      // Se calcula una posición base para las firmas, pero si el contenido es muy largo, se asegura de que no quede fuera de la página.
      let finalY = doc.y
      if (finalY > 600) { // Si el contenido ya está muy abajo, agrega una nueva página para las firmas
        doc.addPage()
        finalY = doc.y
      }
      const signatureY = finalY > doc.page.height - 200 ? finalY + 50 : doc.page.height - 150

      const drawSignature = (name, cargo, x, width) => {
        const textWidth = doc.widthOfString(name)
        const textX = x + (width - textWidth) / 2

        doc.moveTo(x, signatureY).lineTo(x + width, signatureY).stroke()
        doc.font('Helvetica-Bold').text(name, x, signatureY + 8, { width, align: 'center' })
        doc.font('Helvetica').text(cargo, x, doc.y, { width, align: 'center' })
      }

      drawSignature(`Lcda. ${datosPost.analista_nombre || 'N/A'}`, 'Analista de Bienes e Inventarios I', doc.page.margins.left, 250)
      drawSignature(`${datosPost.director_nombre || 'N/A'}`, datosPost.director_cargo || 'N/A', doc.page.width - 250 - doc.page.margins.right, 250)

      // --- FINALIZAR DOCUMENTO ---
      doc.end()

      stream.on('finish', () => resolve(outputPath))
      stream.on('error', (err) => reject(err))
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Función auxiliar para dibujar una tabla en pdfkit.
 */
function drawTable (doc, data) {
  const startY = doc.y
  const startX = doc.page.margins.left
  const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
  const col1Width = tableWidth * 0.35
  const col2Width = tableWidth * 0.15
  const col3Width = tableWidth * 0.50

  const headers = ['Estatus del Bien Mueble', 'Total', 'Observaciones (Códigos)']
  let currentY = startY

  // Dibuja cabecera
  doc.font('Helvetica-Bold').fontSize(10)
  const headerHeight = doc.heightOfString(headers[0], { width: col1Width })
  const headerOptions = { lineBreak: false, height: headerHeight, align: 'center' }
  doc.text(headers[0], startX, currentY, { ...headerOptions, width: col1Width })
  doc.text(headers[1], startX + col1Width, currentY, { ...headerOptions, width: col2Width })
  doc.text(headers[2], startX + col1Width + col2Width, currentY, { ...headerOptions, width: col3Width })
  currentY += headerHeight + 5
  doc.moveTo(startX, currentY).lineTo(startX + tableWidth, currentY).stroke()
  doc.y = currentY

  // Dibuja filas
  doc.font('Helvetica').fontSize(9)
  let totalBienesSum = 0
  data.forEach(row => {
    const rowY = doc.y + 5
    const obsText = row.obs || 'N/A'
    const labelHeight = doc.heightOfString(row.label, { width: col1Width - 10 })
    const obsHeight = doc.heightOfString(obsText, { width: col3Width - 10 })
    const rowHeight = Math.max(labelHeight, obsHeight) + 10

    doc.text(row.label, startX + 5, rowY, { width: col1Width - 10 })
    doc.text(row.total.toString(), startX + col1Width, rowY, { width: col2Width, align: 'center' })
    doc.text(obsText, startX + col1Width + col2Width + 5, rowY, { width: col3Width - 10 })

    doc.y = rowY + rowHeight
    doc.moveTo(startX, doc.y).lineTo(startX + tableWidth, doc.y).stroke()
    totalBienesSum += row.total
  })

  // Fila de Total
  const totalY = doc.y + 5
  doc.font('Helvetica-Bold').fontSize(10)
  doc.text('TOTAL:', startX + 5, totalY, { width: col1Width - 10, align: 'right' })
  doc.text(totalBienesSum.toString(), startX + col1Width, totalY, { width: col2Width, align: 'center' })
  doc.y = totalY + doc.heightOfString('TOTAL:') + 5
  doc.moveTo(startX, doc.y).lineTo(startX + tableWidth, doc.y).stroke()

  // Dibuja bordes verticales
  const tableBottomY = doc.y
  doc.moveTo(startX, startY).lineTo(startX, tableBottomY).stroke()
  doc.moveTo(startX + col1Width, startY).lineTo(startX + col1Width, tableBottomY).stroke()
  doc.moveTo(startX + col1Width + col2Width, startY).lineTo(startX + col1Width + col2Width, tableBottomY).stroke()
  doc.moveTo(startX + tableWidth, startY).lineTo(startX + tableWidth, tableBottomY).stroke()
  doc.y = tableBottomY // Asegura que el cursor quede al final de la tabla
}
