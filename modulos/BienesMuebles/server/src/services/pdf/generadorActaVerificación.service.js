/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */
/* eslint-disable camelcase */

import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const API_BASE_URL = 'http://localhost:5001'

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

function formatFullDate (isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

function toUpperCase (str) {
  return str ? str.toUpperCase() : 'N/A'
}

function limpiarTexto (texto) {
  if (!texto) return ''
  // Reemplazar saltos de línea y múltiples espacios por un solo espacio
  return texto.replace(/\s+/g, ' ').trim()
}

export const generarActaVerificacionService = (datosPost, accessToken) => {
  return new Promise(async (resolve, reject) => {
    const { dep_ide, departamento_nombre } = datosPost
    const departamentoNombreUpper = toUpperCase(departamento_nombre)

    if (!dep_ide) {
      return reject(new Error("El 'dep_ide' es requerido en datosPost."))
    }

    try {
      const [
        bienesData,
        malEstadoData,
        prestadosAOtroData,
        prestadosDeOtroData,
        bienesMalEstadoEnDepartamentoData
      ] = await Promise.all([
        fetchApiData(`/api/bienes/all?dep=${dep_ide}&inc=1`, accessToken),
        fetchApiData(`/api/prestamos/almacen?dep_origen_id=${dep_ide}`, accessToken),
        fetchApiData(`/api/prestamos/normales?dep_origen_id=${dep_ide}`, accessToken),
        fetchApiData(`/api/prestamos/normales?dep_destino_id=${dep_ide}`, accessToken),
        fetchApiData(`/api/bienes/all?dep=${dep_ide}&inc=1&con=4`, accessToken)
      ])

      if (!bienesData) {
        return reject(new Error('Error crítico: no se pudieron obtener los datos principales de los bienes.'))
      }

      // Procesar datos
      const todosLosBienes = bienesData || []
      const bienesFaltantes = todosLosBienes.filter(b => b.est_ide === 3)
      const bienesSinEtiqueta = todosLosBienes.filter(b => b.est_ide === 1)
      const bienesMalEstadoEnDepartamento = bienesMalEstadoEnDepartamentoData?.data || []

      const extraerBienesPrestamo = (data) => (data || []).map(p => {
        try {
          const detalles = JSON.parse(p.bienes_detalles)
          return {
            ...p,
            ...detalles,
            bim_des: limpiarTexto(detalles.bim_des),
            departamento_origen_nombre: toUpperCase(p.departamento_origen_nombre),
            departamento_destino_nombre: toUpperCase(p.departamento_destino_nombre)
          }
        } catch (e) {
          console.warn(`Advertencia: No se pudo decodificar bienes_detalles: ${p.bienes_detalles}`)
          return null
        }
      }).filter(Boolean)

      const bienesMalEstadoAlmacen = extraerBienesPrestamo(malEstadoData)
      const bienesPrestadosAOtro = extraerBienesPrestamo(prestadosAOtroData)
      const bienesPrestadosDeOtro = extraerBienesPrestamo(prestadosDeOtroData)

      // Filtrar bienes en mal estado que no están en almacén
      const bienesMalEstadoSoloEnDepartamento = bienesMalEstadoEnDepartamento.filter(b =>
        !bienesMalEstadoAlmacen.some(m => m.bim_ide === b.bim_ide)
      )
      // Calcular totales
      const countFaltantes = bienesFaltantes.length
      const countMalEstado = bienesMalEstadoAlmacen.length + bienesMalEstadoSoloEnDepartamento.length
      const countPrestadosAOtro = bienesPrestadosAOtro.length
      const countPrestadosDeOtro = bienesPrestadosDeOtro.length
      const countEnServicio = todosLosBienes.length - countFaltantes - countPrestadosAOtro - countMalEstado

      // Calcular TOTAL como suma de las filas (excepto préstamos de otros)
      const totalBienesTabla = countEnServicio + countFaltantes + countMalEstado + countPrestadosAOtro + countPrestadosDeOtro

      // Crear PDF
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true })
      const tempDir = path.join(process.cwd(), 'temp')
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

      const outputPath = path.join(tempDir, `acta_verificacion_${dep_ide}_${Date.now()}.pdf`)
      const stream = fs.createWriteStream(outputPath)
      doc.pipe(stream)

      // Encabezado
      const logoPath = path.join(process.cwd(), 'public', 'img', 'logo-contraloria-home1.png')
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.margins.left, doc.page.margins.top, { width: 70 })
      }

      doc.font('Helvetica-Bold').fontSize(12).text('DIVISION DE COMPRAS, BIENES E INVENTARIOS', { align: 'center' })
      doc.moveDown(2)

      // Título
      doc.fontSize(14).text('ACTA DE VERIFICACION DEL INVENTARIO DE BIENES MUEBLES', { align: 'center' })
      doc.moveDown(2)

      // Párrafo introductorio
      const fechaLarga = '15 días del mes de junio de 2025'
      const fechaCorta = '15/06/2025'

      doc.font('Helvetica').fontSize(12)
      const parrafo = `En San Cristóbal a los ${fechaLarga} reunidos en el ${departamentoNombreUpper} los Ciudadanos: ${datosPost.director_nombre || 'N/A'}, titular de la cédula de identidad N° ${datosPost.director_cedula || 'N/A'} (${datosPost.director_cargo || 'N/A'}) y Lcda. ${datosPost.analista_nombre || 'N/A'}, titular de la cédula de identidad N° ${datosPost.analista_cedula || 'N/A'} (Analista de Bienes e Inventarios I), para dejar constancia de la verificación por percepción directa del inventario físico al ${fechaCorta}, fecha del reporte BM1 bienes adscritos a la Unidad antes mencionada, los cuales ascienden a un total de ${totalBienesTabla} bienes, según la relación de bienes muebles formulario BM-1.`
      doc.text(parrafo, { align: 'justify' })
      doc.moveDown(2)

      // Tabla de resumen
      const bienesEnServicio = todosLosBienes.filter(b =>
        b.est_ide !== 3 &&
        !bienesPrestadosAOtro.some(p => p.bim_ide === b.bim_ide) &&
        !bienesMalEstadoAlmacen.some(m => m.bim_ide === b.bim_ide) &&
        !bienesMalEstadoSoloEnDepartamento.some(m => m.bim_ide === b.bim_ide)
      )

      const tableData = [
        {
          label: 'Bienes en Servicio en la dirección:',
          total: countEnServicio,
          obs: bienesEnServicio.map(b => b.bim_ide).join(', ')
        },
        {
          label: 'Bienes Faltantes:',
          total: countFaltantes,
          obs: bienesFaltantes.map(b => b.bim_ide).join(', ')
        },
        {
          label: 'Bienes en Mal Estado:',
          total: countMalEstado,
          obs: [...bienesMalEstadoAlmacen, ...bienesMalEstadoSoloEnDepartamento].map(b => b.bim_ide).join(', ')
        },
        {
          label: 'Bienes en Préstamo a otras direcciones:',
          total: countPrestadosAOtro,
          obs: bienesPrestadosAOtro.map(b => b.bim_ide).join(', ')
        },
        {
          label: 'Bienes en préstamo de otras direcciones a esta dirección:',
          total: countPrestadosDeOtro,
          obs: bienesPrestadosDeOtro.map(b => b.bim_ide).join(', ')
        }
      ]

      drawTable(doc, tableData, totalBienesTabla)
      doc.moveDown(2)

      // Secciones de detalles
      doc.x = doc.page.margins.left
      doc.font('Helvetica-Bold').fontSize(12).text('OBSERVACION:', {
        align: 'left',
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right
      })
      doc.moveDown()

      const drawSection = (title, items, formatter) => {
        if (items && items.length > 0) {
          doc.font('Helvetica-Bold').fontSize(11).text(title, {
            align: 'center',
            x: doc.page.margins.left
          })
          doc.moveDown(0.5)
          doc.font('Helvetica').fontSize(10)
          items.forEach(item => doc.text(formatter(item), {
            indent: 15,
            paragraphGap: 4,
            align: 'left',
            x: doc.page.margins.left
          }))
          doc.moveDown()
        }
      }

      // 1. Bienes prestados de otras direcciones
      drawSection(
        'Los siguientes bienes se prestan:',
        bienesPrestadosDeOtro,
        b => `EL BIEN Nº${b.bim_ide}: ${b.bim_des} SE DIO EN CALIDAD DE PRÉSTAMO DESDE ${b.departamento_origen_nombre} SEGÚN TRANSFERENCIA DE OFICIO ${b.pre_ndo} EN FECHA ${formatFullDate(b.pre_fec)}`
      )

      // 2. Bienes en mal estado en almacén
      drawSection(
        'BIENES EN MAL ESTADO QUE FUERON TRASLADADOS A PISO 3 PARA SU RESGUARDO:',
        bienesMalEstadoAlmacen,
        b => `${b.bim_ide}: ${b.bim_des}`
      )

      // 3. Bienes en mal estado en el departamento
      drawSection(
        `BIENES EN MAL ESTADO DENTRO DE ${departamentoNombreUpper}:`,
        bienesMalEstadoSoloEnDepartamento,
        b => `${b.bim_ide}: ${b.bim_des}`
      )

      // 4. Bienes prestados a otras direcciones (agrupados por oficio)
      if (bienesPrestadosAOtro.length > 0) {
        const prestamosAgrupados = {}
        bienesPrestadosAOtro.forEach(b => {
          const key = `${b.pre_ndo}_${b.pre_fec}`
          if (!prestamosAgrupados[key]) {
            prestamosAgrupados[key] = {
              ndo: b.pre_ndo,
              fecha: formatFullDate(b.pre_fec),
              destino: b.departamento_destino_nombre,
              bienes: []
            }
          }
          prestamosAgrupados[key].bienes.push(b)
        })

        Object.values(prestamosAgrupados).forEach(grupo => {
          doc.font('Helvetica-Bold').fontSize(11)
            .text(`BIENES EN PRÉSTAMO PARA LA ${grupo.destino} SEGÚN OFICIO ${grupo.ndo} DE FECHA ${grupo.fecha}:`, {
              align: 'left',
              x: doc.page.margins.left
            })

          doc.moveDown(0.5)
          doc.font('Helvetica').fontSize(10)

          grupo.bienes.forEach(b => {
            doc.text(`${b.bim_ide}: ${b.bim_des}`, {
              indent: 15,
              paragraphGap: 4,
              align: 'left',
              x: doc.page.margins.left
            })
          })

          doc.moveDown()
        })
      }

      // 5. Bienes sin etiqueta
      drawSection(
        `BIENES QUE SE ENCUENTRAN SIN ETIQUETA EN ${departamentoNombreUpper}:`,
        bienesSinEtiqueta,
        b => `${b.bim_ide}: ${b.bim_des}`
      )

      // 6. Bienes faltantes
      drawSection(
        'REPORTE DE BIENES FALTANTES:',
        bienesFaltantes,
        b => `${b.bim_ide}: ${b.bim_des}`
      )

      // Firmas
      let finalY = doc.y
      if (finalY > 600) {
        doc.addPage()
        finalY = doc.y
      }
      const signatureY = finalY > doc.page.height - 200 ? finalY + 50 : doc.page.height - 150

      const drawSignature = (name, cargo, x, width) => {
        doc.moveTo(x, signatureY).lineTo(x + width, signatureY).stroke()
        doc.font('Helvetica-Bold').text(name, x, signatureY + 8, { width, align: 'center' })
        doc.font('Helvetica').text(cargo, x, doc.y, { width, align: 'center' })
      }

      drawSignature(`Lcda. ${datosPost.analista_nombre || 'N/A'}`, 'Analista de Bienes e Inventarios I', doc.page.margins.left, 250)
      drawSignature(`${datosPost.director_nombre || 'N/A'}`, datosPost.director_cargo || 'N/A', doc.page.width - 250 - doc.page.margins.right, 250)

      doc.end()

      stream.on('finish', () => resolve(outputPath))
      stream.on('error', (err) => reject(err))
    } catch (error) {
      reject(error)
    }
  })
}

function drawTable (doc, data, totalBienesTabla) {
  const startY = doc.y
  const startX = doc.page.margins.left
  const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
  const col1Width = tableWidth * 0.35
  const col2Width = tableWidth * 0.15
  const col3Width = tableWidth * 0.50

  // Línea superior
  doc.moveTo(startX, startY).lineTo(startX + tableWidth, startY).stroke()

  // Cabecera
  doc.font('Helvetica-Bold').fontSize(10)
  const headers = ['Estatus del Bien Mueble', 'Total', 'Observaciones (Códigos)']
  const headerHeight = doc.heightOfString(headers[0], { width: col1Width })

  doc.text(headers[0], startX, startY, { width: col1Width, align: 'center' })
  doc.text(headers[1], startX + col1Width, startY, { width: col2Width, align: 'center' })
  doc.text(headers[2], startX + col1Width + col2Width, startY, { width: col3Width, align: 'center' })

  const currentY = startY + headerHeight + 5
  doc.moveTo(startX, currentY).lineTo(startX + tableWidth, currentY).stroke()
  doc.y = currentY

  // Filas
  doc.font('Helvetica').fontSize(9)
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
  })

  // Total
  const totalY = doc.y + 5
  doc.font('Helvetica-Bold').fontSize(10)
  doc.text('TOTAL:', startX + 5, totalY, { width: col1Width - 10, align: 'right' })
  doc.text(totalBienesTabla.toString(), startX + col1Width, totalY, { width: col2Width, align: 'center' })
  doc.y = totalY + doc.heightOfString('TOTAL:') + 5
  doc.moveTo(startX, doc.y).lineTo(startX + tableWidth, doc.y).stroke()

  // Bordes verticales
  const tableBottomY = doc.y
  doc.moveTo(startX, startY).lineTo(startX, tableBottomY).stroke()
  doc.moveTo(startX + col1Width, startY).lineTo(startX + col1Width, tableBottomY).stroke()
  doc.moveTo(startX + col1Width + col2Width, startY).lineTo(startX + col1Width + col2Width, tableBottomY).stroke()
  doc.moveTo(startX + tableWidth, startY).lineTo(startX + tableWidth, tableBottomY).stroke()
  doc.y = tableBottomY
}
