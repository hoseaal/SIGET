import ExcelJS from 'exceljs'
import path from 'path'
import fs from 'fs'

// --- Your provided fetchApiData function ---
const API_BASE_URL = 'http://localhost:5001' // Make sure this matches your backend URL

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
    return null // Return null or re-throw, depending on desired error handling chain
  }
}

function toUpperCase (str) {
  return str ? str.toUpperCase() : 'N/A'
}

const extraerBienesPrestamo = (data) => {
  if (!data) return []

  return data.flatMap(prestamo => {
    try {
      const detalles = JSON.parse(prestamo.bienes_detalles)
      // Si bienes_detalles es un objeto individual (no array)
      if (!Array.isArray(detalles)) {
        return {
          ...detalles,
          pre_ndo: prestamo.pre_ndo,
          pre_fec: prestamo.pre_fec,
          pre_est: prestamo.pre_est,
          pre_ide: prestamo.pre_ide,
          departamento_origen_nombre: toUpperCase(prestamo.departamento_origen_nombre),
          departamento_destino_nombre: toUpperCase(prestamo.departamento_destino_nombre)
        }
      }
      // Si bienes_detalles es un array de objetos
      return detalles.map(d => ({
        ...d,
        pre_ndo: prestamo.pre_ndo,
        pre_fec: prestamo.pre_fec,
        pre_est: prestamo.pre_est,
        pre_ide: prestamo.pre_ide,
        departamento_origen_nombre: toUpperCase(prestamo.departamento_origen_nombre),
        departamento_destino_nombre: toUpperCase(prestamo.departamento_destino_nombre)
      }))
    } catch (e) {
      console.warn('Error al parsear bienes_detalles:', e)
      return null
    }
  }).filter(Boolean)
}
export const generarActaVerificacionExcelService = async (datos, accessToken) => {
  try {
    const { dep_ide, departamento_nombre } = datos

    // --- Fetch Data ---
    const [bienesAllData, prestamosNormalesData] = await Promise.all([
      fetchApiData(`/api/bienes/all?dep=${dep_ide}&inc=1`, accessToken),
      fetchApiData(`/api/prestamos/normales?dep_destino_id=${dep_ide}`, accessToken)
    ])
    console.log(prestamosNormalesData)
    if (!bienesAllData && !prestamosNormalesData) {
      throw new Error('No se pudo obtener datos de bienes ni de préstamos para el departamento.')
    }

    // Process fetched data
    const allBienes = Object.values(bienesAllData || {}) // Convert object to array
    const prestamoBienes = extraerBienesPrestamo(prestamosNormalesData)
    console.log(prestamoBienes)
    // Create a set of bim_ide from prestamos for quick lookup
    const prestamoBimIds = new Set(prestamoBienes.map(b => b.bim_ide))

    // Consolidate data for Excel rows
    const excelRows = []
    let counter = 1

    // Add bienes from /api/prestamos/normales first, as they have specific observation logic

    // Add bienes from /api/bienes/all that are NOT already in prestamos
    allBienes.forEach(bien => {
      if (!prestamoBimIds.has(bien.bim_ide)) {
        excelRows.push({
          num: counter++,
          bim_ide: bien.bim_ide,
          bim_des: bien.bim_des,
          direccion: departamento_nombre, // Assuming this is the department for non-loaned items
          observacion: bien.bim_obs || '' // Use bim_obs if it exists
        })
      }
    })

    prestamoBienes.forEach(prestamoBien => {
      excelRows.push({
        num: counter++,
        bim_ide: prestamoBien.bim_ide,
        bim_des: prestamoBien.bim_des, // Use full description if available
        direccion: prestamoBien.departamento_origen_nombre, // Or departamento_destino_nombre from the main prestamo object
        observacion: `Bien prestado a ${prestamoBien.departamento_destino_nombre} por ${prestamoBien.departamento_origen_nombre}`
      })
    })

    // --- Create Workbook and Worksheet ---
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Contraloría del Estado Táchira'
    workbook.lastModifiedBy = 'Sistema de Bienes Nacionales'
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.properties.date1904 = false // Excel's default date system

    const worksheet = workbook.addWorksheet(`Verificación ${departamento_nombre}`)

    // --- Add Logo ---
    try {
      // Adjust this path if 'public/img' is not directly under your project root
      const logoPath = path.join(process.cwd(), 'public', 'img', 'logo-contraloria-home1.png')

      if (fs.existsSync(logoPath)) {
        const logo = workbook.addImage({
          buffer: fs.readFileSync(logoPath),
          extension: 'png'
        })
        // Posicionar el logo de A1 a A3 (ajustado para no fusionarse con el texto)
        worksheet.addImage(logo, 'A1:B3')
      } else {
        console.warn('Advertencia: El archivo del logo no se encontró en la ruta especificada:', logoPath)
      }
    } catch (logoError) {
      console.warn('Advertencia: No se pudo procesar el logo.', logoError.message)
    }

    // --- Main Header Text ---
    worksheet.mergeCells('C1:B7') // Fusión de celdas como lo pediste
    const headerCell = worksheet.getCell('C1') // Accedemos a la celda fusionada (B1 es el inicio de la fusión)
    headerCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    headerCell.font = { name: 'Arial', size: 12 }

    const today = new Date()
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`

    const headerText = [
      'REPORTE DE VERIFICACION DEL INVENTARIO DE BIENES MUEBLES',
      'UNIDAD EJECUTORA: CONTRALORÍA DEL ESTADO TACHIRA',
      'DIRECCION O UNIDAD ADMINISTRATIVA: DIRECCION DE ADMINISTRACION',
      `FECHA DEL REPORTE: ${formattedDate}`,
      `${departamento_nombre}` // Departamento actual enviado en el body
    ].join('\n')

    headerCell.value = headerText

    // Optional: Add borders to header cell
    headerCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }

    // --- Column Headers ---
    // Start column headers below the main header, e.g., row 9 (assuming header is B1:G7 and logo A1:A3)
    const columnHeaderRowNumber = 9 // Adjust this row number as needed based on header height
    worksheet.getRow(columnHeaderRowNumber).values = ['Nº', 'Nº DEL BIEN', 'DESCRIPCION', 'DIRECCION', 'OBSERVACION']

    // Apply styling to column headers
    worksheet.getRow(columnHeaderRowNumber).eachCell((cell) => {
      cell.font = { bold: true, size: 10, name: 'Arial' }
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } } // Light grey background
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    // --- Populate Rows ---
    const startDataRow = columnHeaderRowNumber + 1
    excelRows.forEach((rowData, index) => {
      const row = worksheet.getRow(startDataRow + index)
      row.values = [
        rowData.num,
        rowData.bim_ide,
        rowData.bim_des,
        rowData.direccion,
        rowData.observacion
      ]

      // Apply general row styling
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
        cell.font = { name: 'Arial', size: 10 }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    })

    // --- Adjust Column Widths ---
    worksheet.columns = [
      { key: 'num', width: 5 },
      { key: 'bim_ide', width: 15 },
      { key: 'bim_des', width: 50 },
      { key: 'direccion', width: 30 },
      { key: 'observacion', width: 40 }
    ]

    // --- Generate Excel Buffer ---
    const buffer = await workbook.xlsx.writeBuffer()

    // --- Define Filename ---
    const datePart = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const departmentNameClean = datos.departamento_nombre.replace(/[^a-zA-Z0-9]/g, '_')
    const excelFileName = `Acta_Verificacion_Bienes_${departmentNameClean}_${datePart}.xlsx`

    return {
      excel: buffer,
      excelFileName
    }
  } catch (error) {
    console.error('Error in generarActaVerificacionExcelService:', error)
    throw error // Re-throw to be caught by the controller
  }
}
