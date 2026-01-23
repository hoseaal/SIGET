/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */
/* eslint-disable camelcase */

import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const API_BASE_URL = 'http://localhost:5001'

function formatCurrentDateTime () {
  const now = new Date()
  const day = now.getDate()
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]
  const month = monthNames[now.getMonth()]
  const mes = now.getMonth() + 1
  const year = now.getFullYear()
  const yearInWords = numberToWords(year)

  const fechacorta = `${day}/${mes}/${year}`
  return {
    day,
    month,
    yearInWords,
    fechacorta
  }
}

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
        if (response.status === 404) return []
        throw new Error(`Error en la petición a ${url}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error al hacer fetch a ${url}:`, error)
    return [] 
  }
}

function formatFullDate (isoString) {
  if (!isoString) return ''
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
  return texto.replace(/\s+/g, ' ').trim()
}

// --- FUNCIÓN PARA ORDENAR IDs ---
function obtenerIdsOrdenados(listaBienes) {
  if (!listaBienes || listaBienes.length === 0) return '';
  
  return listaBienes
    .map(b => b.bim_ide)
    .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }))
    .join(', ');
}

export const generarActaVerificacionService = (datosPost, accessToken) => {
  return new Promise(async (resolve, reject) => {
    const { dep_ide, departamento_nombre } = datosPost
    const departamentoNombreUpper = toUpperCase(departamento_nombre)

    if (!dep_ide) {
      return reject(new Error("El 'dep_ide' es requerido en datosPost."))
    }

    try {
      // 1. Obtener datos
      const promises = [
        fetchApiData(`/api/bienes/all?dep=${dep_ide}&inc=1`, accessToken),
        fetchApiData(`/api/prestamos/almacen?dep_origen_id=${dep_ide}`, accessToken),
        fetchApiData(`/api/prestamos/normales?dep_origen_id=${dep_ide}`, accessToken),
        fetchApiData(`/api/prestamos/normales?dep_destino_id=${dep_ide}`, accessToken),
        fetchApiData(`/api/bienes/all?dep=${dep_ide}&inc=1&con=4`, accessToken)
      ];

      // --- CAMBIO: Si es Almacén (9 u 11), buscar bienes de terceros resguardados aquí ---
      const esAlmacenPiso4 = Number(dep_ide) === 9;
      const esAlmacenPiso3 = Number(dep_ide) === 11;
      const esDepartamentoAlmacen = esAlmacenPiso4 || esAlmacenPiso3;

      if (esDepartamentoAlmacen) {
        // Agregamos la petición para buscar bienes donde el destino sea ESTE departamento y sea tipo Almacén
        promises.push(fetchApiData(`/api/prestamos/almacen?dep_destino_id=${dep_ide}`, accessToken));
      }

      const results = await Promise.all(promises);

      const [
        bienesData,
        bienesEnAlmacenData,  
        prestadosAOtroData,   
        prestadosDeOtroData,  
        bienesMalEstadoEnDepartamentoData,
        tercerosEnMiAlmacenData // Este será undefined si no es departamento almacén
      ] = results;

      const todosLosBienes = Array.isArray(bienesData) ? bienesData : (bienesData?.data || [])
      
      const bienesFaltantes = todosLosBienes.filter(b => b.est_ide === 3)
      const bienesSinEtiqueta = todosLosBienes.filter(b => b.est_ide === 1)
      const bienesMalEstadoEnDepartamento = bienesMalEstadoEnDepartamentoData || []

      const extraerBienesPrestamo = (data) => {
        return (data || []).flatMap(prestamo => {
          try {
            const detalles = typeof prestamo.bienes_detalles === 'string' 
                ? JSON.parse(prestamo.bienes_detalles) 
                : (prestamo.bienes_detalles || [])
            
            const bienesArray = Array.isArray(detalles) ? detalles : [detalles]

            return bienesArray.map(bien => ({
              ...prestamo,
              ...bien,
              bim_des: limpiarTexto(bien.bim_des),
              departamento_origen_nombre: toUpperCase(prestamo.departamento_origen_nombre),
              departamento_destino_nombre: toUpperCase(prestamo.departamento_destino_nombre)
            }))
          } catch (e) {
            console.warn('Error al decodificar bienes_detalles:', e)
            return []
          }
        })
      }

      // Procesar listas normales
      const bienesEnviadosAlmacen = extraerBienesPrestamo(bienesEnAlmacenData)
      const bienesPrestadosAOtro = extraerBienesPrestamo(prestadosAOtroData)
      const bienesPrestadosDeOtro = extraerBienesPrestamo(prestadosDeOtroData)
      
      // Procesar lista especial de Terceros en Almacén (si aplica)
      const bienesTercerosEnMiAlmacen = esDepartamentoAlmacen 
        ? extraerBienesPrestamo(tercerosEnMiAlmacenData) 
        : [];

      // Filtrar bienes rotos LOCALES (excluyendo los que ya se enviaron a almacén)
      const bienesMalEstadoSoloEnDepartamento = bienesMalEstadoEnDepartamento.filter(b =>
        !bienesEnviadosAlmacen.some(m => m.bim_ide === b.bim_ide)
      )

      // --- CÁLCULO DE TOTALES ---
      const countFaltantes = bienesFaltantes.length
      
      // SUMA ESPECIAL PARA MAL ESTADO:
      // 1. Enviados a otro almacén (si este dep fuera normal)
      // 2. Rotos locales
      // 3. (NUEVO) Bienes de terceros resguardados aquí (si este dep es almacén)
      const countMalEstado = bienesEnviadosAlmacen.length + bienesMalEstadoSoloEnDepartamento.length + bienesTercerosEnMiAlmacen.length
      
      const countPrestadosAOtro = bienesPrestadosAOtro.length
      const countPrestadosDeOtro = bienesPrestadosDeOtro.length
      
      const countEnServicio = todosLosBienes.length - countFaltantes - countPrestadosAOtro - (bienesEnviadosAlmacen.length + bienesMalEstadoSoloEnDepartamento.length)

      // Total Global (Nota: bienesTercerosEnMiAlmacen se suman al total de la tabla física)
      const totalBienesTabla = countEnServicio + countFaltantes + countMalEstado + countPrestadosAOtro + countPrestadosDeOtro

      const { day, month, yearInWords, fechacorta } = formatCurrentDateTime()

      // --- CREAR PDF ---
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

      // Párrafo
      doc.font('Helvetica').fontSize(12)
      const parrafo = `En la ciudad de San Cristóbal a los ${day} días del mes de ${month} del año ${yearInWords} reunidos en la dirección de ${departamentoNombreUpper} los Ciudadanos: ${datosPost.director_nombre || 'N/A'}, titular de la cédula de identidad N° ${datosPost.director_cedula || 'N/A'} (${datosPost.director_cargo || 'N/A'}) y Lcda. ${datosPost.analista_nombre || 'N/A'}, titular de la cédula de identidad N° ${datosPost.analista_cedula || 'N/A'} (Analista de Bienes e Inventarios I), para dejar constancia de la verificación por percepción directa del inventario físico al ${fechacorta}, fecha del reporte BM1 bienes adscritos a la Unidad antes mencionada, los cuales ascienden a un total de ${totalBienesTabla} bienes, según la relación de bienes muebles formulario BM-1.`
      doc.text(parrafo, { align: 'justify' })
      doc.moveDown(2)

      // --- TABLA DE RESUMEN ---
      
      const tableData = [
        {
          label: 'Bienes en Servicio en la dirección:',
          total: countEnServicio,
          obs: '' 
        },
        {
          label: 'Bienes Faltantes:',
          total: countFaltantes,
          obs: obtenerIdsOrdenados(bienesFaltantes) 
        },
        {
          label: 'Bienes en Mal Estado:',
          total: countMalEstado, 
          // CONCATENAMOS: Almacen Saliente + Locales + (Terceros en mi Almacén si soy 9/11)
          obs: obtenerIdsOrdenados([...bienesEnviadosAlmacen, ...bienesMalEstadoSoloEnDepartamento, ...bienesTercerosEnMiAlmacen]) 
        },
        {
          label: 'Bienes en Préstamo a otras direcciones:',
          total: countPrestadosAOtro,
          obs: obtenerIdsOrdenados(bienesPrestadosAOtro) 
        },
        {
          label: 'Bienes en préstamo de otras direcciones a esta dirección:',
          total: countPrestadosDeOtro,
          obs: obtenerIdsOrdenados(bienesPrestadosDeOtro) 
        }
      ]

      drawTable(doc, tableData, totalBienesTabla)
      doc.moveDown(2)

      // --- SECCIONES DE DETALLES ---
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
          
          items
            .sort((a, b) => String(a.bim_ide).localeCompare(String(b.bim_ide), undefined, { numeric: true }))
            .forEach(item => doc.text(formatter(item), {
              indent: 15,
              paragraphGap: 4,
              align: 'left',
              x: doc.page.margins.left
            }))
          doc.moveDown()
        }
      }

      // 1. Bienes prestados de otras direcciones (Entrantes normales)
      drawSection(
        'Observación: Los siguientes bienes se prestan de otras direcciones:',
        bienesPrestadosDeOtro,
        b => `EL BIEN Nº${b.bim_ide}: ${b.bim_des} SE DIO EN CALIDAD DE PRÉSTAMO DESDE ${b.departamento_origen_nombre} SEGÚN ${b.pre_tip} ${b.pre_ndo || ''}${b.pre_fec ? ` FECHA ${formatFullDate(b.pre_fec)}` : ''}.`
      )

      // 2. Bienes que YO envié a almacén
      const bienesPiso3 = bienesEnviadosAlmacen.filter(b => b.dep_ide === 11);
      const bienesPiso4 = bienesEnviadosAlmacen.filter(b => b.dep_ide === 9);

      if (bienesPiso3.length > 0) {
        drawSection(
          'BIENES EN MAL ESTADO QUE FUERON TRASLADADOS A ALMACEN DE PISO 3 PARA SU RESGUARDO, POR SERVICIOS GENERALES, SEGURIDAD Y TRANSPORTE:',
          bienesPiso3,
          b => `${b.bim_ide}: ${b.bim_des}`
        );
      }

      if (bienesPiso4.length > 0) {
        drawSection(
          'BIENES EN MAL ESTADO QUE FUERON TRASLADADOS A ALMACEN DE PISO 4 PARA SU RESGUARDO:',
          bienesPiso4,
          b => `${b.bim_ide}: ${b.bim_des}`
        );
      }

      // 3. Bienes en mal estado locales (Míos, rotos, aquí)
      drawSection(
        `BIENES EN MAL ESTADO DENTRO DE ${departamentoNombreUpper}:`,
        bienesMalEstadoSoloEnDepartamento,
        b => `${b.bim_ide}: ${b.bim_des}`
      )

      // --- SECCIÓN NUEVA: Bienes de TERCEROS en MI Almacén (Solo para dep 9 y 11) ---
      if (esDepartamentoAlmacen && bienesTercerosEnMiAlmacen.length > 0) {
        const pisoTexto = esAlmacenPiso3 ? '3' : '4';
        drawSection(
          `BIENES PERTENECIENTES A OTRAS DIRECCIONES PERO ESTÁN RESGUARDADOS EN ALMACÉN PISO ${pisoTexto}:`,
          bienesTercerosEnMiAlmacen,
          // Formato personalizado solicitado
          b => `${b.bim_ide}: ${b.bim_des} (PERTENECE A: ${b.departamento_origen_nombre})`
        );
      }

      // 4. Bienes prestados a otros
      if (bienesPrestadosAOtro.length > 0) {
        const prestamosAgrupados = {}
        bienesPrestadosAOtro.forEach(b => {
          const key = `${b.pre_ndo}_${b.pre_fec}`
          if (!prestamosAgrupados[key]) {
            prestamosAgrupados[key] = {
              ndo: b.pre_ndo,
              fecha: formatFullDate(b.pre_fec) || null ,
              destino: b.departamento_destino_nombre,
              tipo: b.pre_tip,
              bienes: []
            }
          }
          prestamosAgrupados[key].bienes.push(b)
        })

        Object.values(prestamosAgrupados).forEach(grupo => {
          doc.font('Helvetica-Bold').fontSize(11)
            .text(`BIENES EN PRÉSTAMO PARA LA ${grupo.destino} SEGÚN ${grupo.tipo} N°${grupo.ndo} ${grupo.fecha ? `DE FECHA ${grupo.fecha}` : ''}:`, {
              align: 'left',
              x: doc.page.margins.left
            })

          doc.moveDown(0.5)
          doc.font('Helvetica').fontSize(10)

          // Ordenamos también los bienes dentro del detalle de oficio
          grupo.bienes
            .sort((a, b) => String(a.bim_ide).localeCompare(String(b.bim_ide), undefined, { numeric: true }))
            .forEach(b => {
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

      // 5. Sin etiqueta
      drawSection(
        `BIENES QUE SE ENCUENTRAN SIN ETIQUETA EN ${departamentoNombreUpper}:`,
        bienesSinEtiqueta,
        b => `${b.bim_ide}: ${b.bim_des}`
      )

      // 6. Faltantes
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
    const obsText = row.obs || ' '
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