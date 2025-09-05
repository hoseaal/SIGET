/* eslint-disable camelcase */
import ExcelJS from 'exceljs'
import path from 'path'
import fs from 'fs'

// --- Función para hacer fetch a la API (sin cambios) ---
const API_BASE_URL = 'http://localhost:5001' // Asegúrate que esta URL sea la correcta

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
      // Si la respuesta es un error 404, es posible que no haya datos, lo cual no es un error fatal.
      if (response.status === 404) {
        console.warn(`Advertencia: No se encontraron datos en ${url} (404). Se devolverá un array vacío.`)
        return []
      }
      throw new Error(`Error en la petición a ${url}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error al hacer fetch a ${url}:`, error)
    return [] // Devolver un array vacío en caso de error para no detener el proceso
  }
}

function toUpperCase (str) {
  return str ? str.toUpperCase() : 'N/A'
}

// --- Función para extraer y aplanar los bienes de los préstamos (sin cambios) ---
const extraerBienesPrestamo = (data) => {
  if (!data || !Array.isArray(data)) return []

  return data.flatMap(prestamo => {
    try {
      const detalles = JSON.parse(prestamo.bienes_detalles)
      const bienes = Array.isArray(detalles) ? detalles : [detalles]

      return bienes.map(d => ({
        ...d,
        pre_ndo: prestamo.pre_ndo,
        pre_fec: prestamo.pre_fec,
        pre_est: prestamo.pre_est,
        pre_ide: prestamo.pre_ide,
        departamento_origen_nombre: toUpperCase(prestamo.departamento_origen_nombre),
        dep_ide: prestamo.dep_ide,
        departamento_destino_nombre: toUpperCase(prestamo.departamento_destino_nombre)
      }))
    } catch (e) {
      console.warn('Error al parsear bienes_detalles:', e)
      return [] // <-- Corregido: Devuelve un array vacío en lugar de null
    }
  })
}

export const generarActaVerificacionExcelService = async (datos, accessToken) => {
  try {
    const { dep_ide, departamento_nombre } = datos

    // 1. --- OBTENER TODOS LOS DATOS DE FORMA CONCURRENTE ---
    const [
      bienesAllData,
      prestamosSalientesData, // Bienes de este dep prestados a otros
      prestamosEntrantesData, // Bienes de otros deps prestados a este
      bienesEnAlmacenData // Bienes de este dep en almacén
    ] = await Promise.all([
      fetchApiData(`/api/bienes/all?dep=${dep_ide}&inc=1`, accessToken),
      fetchApiData(`/api/prestamos/normales?dep_origen_id=${dep_ide}`, accessToken),
      fetchApiData(`/api/prestamos/normales?dep_destino_id=${dep_ide}`, accessToken),
      fetchApiData(`/api/prestamos/almacen?dep_origen_id=${dep_ide}`, accessToken)
    ])

    // 2. --- PROCESAR Y ESTRUCTURAR LOS DATOS ---
    const bienesDelDepartamento = Object.values(bienesAllData || {})
    const prestamosSalientes = extraerBienesPrestamo(prestamosSalientesData)
    const prestamosEntrantes = extraerBienesPrestamo(prestamosEntrantesData)
    const bienesEnAlmacen = extraerBienesPrestamo(bienesEnAlmacenData)

    const bienesPiso3 = bienesEnAlmacen.filter(b => b.dep_ide === 11);
    const bienesPiso4 = bienesEnAlmacen.filter(b => b.dep_ide === 9);

    // Crear Maps para una búsqueda rápida y eficiente por ID del bien (bim_ide)
    const salientesMap = new Map(prestamosSalientes.map(b => [b.bim_ide, b]))
    const almacenMap3 = new Map(bienesPiso3.map(b => [b.bim_ide, b]))
    const almacenMap4 = new Map(bienesPiso4.map(b => [b.bim_ide, b]))

     // 3. --- CONSOLIDAR LA LISTA DE BIENES Y ASIGNAR OBSERVACIONES ---
    const excelRows = []
    let counter = 1

    // Procesar la lista principal de bienes que pertenecen al departamento
    bienesDelDepartamento.forEach(bien => {
      let observacion = bien.bim_obs || '' // Observación por defecto
      const direccion = toUpperCase(departamento_nombre) // Dirección por defecto

      // JERARQUÍA DE OBSERVACIONES:
      // 1. ¿Está prestado a otro departamento? (Máxima prioridad)
      if (salientesMap.has(bien.bim_ide)) {
        const prestamo = salientesMap.get(bien.bim_ide)
        // La observación indica a dónde se fue el bien
        observacion = `Se encuentra en calidad de préstamo en ${prestamo.departamento_destino_nombre}`
      }
      // 2. Si no, ¿está en almacén?
      else if (almacenMap3.has(bien.bim_ide)) {
        observacion = 'Mal estado ubicado en Almacen Piso 3 para su resguardo'
      } else if (almacenMap4.has(bien.bim_ide)) { 
        observacion = 'Mal estado ubicado en Almacen Piso 4 para su resguardo'
      } 

      excelRows.push({
        num: counter++,
        bim_ide: bien.bim_ide,
        bim_des: bien.bim_des,
        direccion,
        observacion
      })
    })

    // Añadir los bienes que están prestados EN ESTE departamento (vienen de otros)
    prestamosEntrantes.forEach(prestamoBien => {
      excelRows.push({
        num: counter++,
        bim_ide: prestamoBien.bim_ide,
        bim_des: prestamoBien.bim_des,
        // La dirección es de dónde vino el bien
        direccion: toUpperCase(prestamoBien.departamento_origen_nombre),
        // La observación indica que está aquí temporalmente
        observacion: `Este bien pertenece a ${prestamoBien.departamento_origen_nombre} y se encuentra en calidad de préstamo en esta dirección.`
      })
    })

    if (dep_ide === 11) {
      const todosEnAlmacenData = await fetchApiData('/api/prestamos/almacen?dep_destino_id=11', accessToken)
      const bienesEnAlmacen = extraerBienesPrestamo(todosEnAlmacenData)

      bienesEnAlmacen.forEach(prestamoBien => {
        excelRows.push({
          num: counter++,
          bim_ide: prestamoBien.bim_ide,
          bim_des: prestamoBien.bim_des,
          direccion: prestamoBien.departamento_origen_nombre,
          observacion: `Bien perteneciente a ${prestamoBien.departamento_origen_nombre} pero se encuentra en almacén piso 3 para su resguardo`
        })
      })
    }

    if (dep_ide === 9) {
      const todosEnAlmacenData = await fetchApiData('/api/prestamos/almacen?dep_destino_id=9', accessToken)
      const bienesEnAlmacen = extraerBienesPrestamo(todosEnAlmacenData)

      bienesEnAlmacen.forEach(prestamoBien => {
        excelRows.push({
          num: counter++,
          bim_ide: prestamoBien.bim_ide,
          bim_des: prestamoBien.bim_des,
          direccion: prestamoBien.departamento_origen_nombre,
          observacion: `Bien perteneciente a ${prestamoBien.departamento_origen_nombre} pero se encuentra en almacén piso 4 para su resguardo`
        })
      })
    }

    // 4. --- CREACIÓN DEL DOCUMENTO EXCEL (CÓDIGO SIN CAMBIOS) ---
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Contraloría del Estado Táchira'
    workbook.lastModifiedBy = 'Sistema de Bienes Nacionales'
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.properties.date1904 = false

    const worksheet = workbook.addWorksheet(`Verificación ${departamento_nombre}`)

    // --- Añadir Logo ---
    try {
      const logoPath = path.join(process.cwd(), 'public', 'img', 'logo-contraloria-home1.png')
      if (fs.existsSync(logoPath)) {
        const logo = workbook.addImage({
          buffer: fs.readFileSync(logoPath),
          extension: 'png'
        })
        worksheet.addImage(logo, 'A1:B3')
      } else {
        console.warn('Advertencia: El archivo del logo no se encontró en:', logoPath)
      }
    } catch (logoError) {
      console.warn('Advertencia: No se pudo procesar el logo.', logoError.message)
    }

    // --- Encabezado principal ---
    worksheet.mergeCells('C1:E8')
    const headerCell = worksheet.getCell('C1')
    headerCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    headerCell.font = { name: 'Arial', size: 12 }

    const today = new Date()
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`

    const headerText = [
      'REPÚBLICA BOLIVARIANA DE VENEZUELA',
      'CONTRALORÍA DEL ESTADO TÁCHIRA',
      'DIRECCIÓN DE ADMINISTRACIÓN Y SERVICIOS',
      'COORDINACIÓN DE BIENES',
      `ACTA DE VERIFICACIÓN DE BIENES MUEBLES DE LA UNIDAD DE: ${toUpperCase(departamento_nombre)}`,
      `FECHA: ${formattedDate}`
    ].join('\n')

    headerCell.value = headerText
    headerCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }

    // --- Cabeceras de las columnas ---
    const columnHeaderRowNumber = 9
    worksheet.getRow(columnHeaderRowNumber).values = ['Nº', 'Nº DEL BIEN', 'DESCRIPCION', 'DIRECCION', 'OBSERVACION']

    worksheet.getRow(columnHeaderRowNumber).eachCell((cell) => {
      cell.font = { bold: true, size: 10, name: 'Arial' }
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    // --- Poblar las filas con los datos consolidados ---

    excelRows.sort((a, b) => {
      if (a.bim_ide < b.bim_ide) return -1;
      if (a.bim_ide > b.bim_ide) return 1;
      return 0;
    });

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
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
        cell.font = { name: 'Arial', size: 10 }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      })
    })

    // --- Ajustar anchos de columna ---
    worksheet.columns = [
      { key: 'num', width: 5 },
      { key: 'bim_ide', width: 15 },
      { key: 'bim_des', width: 50 },
      { key: 'direccion', width: 30 },
      { key: 'observacion', width: 45 }
    ]

    // --- Firmas al final del documento ---
    const lastRow = worksheet.lastRow.number
    const firmaRow1 = worksheet.getRow(lastRow + 4)
    worksheet.mergeCells(`B${firmaRow1.number}:C${firmaRow1.number}`)
    worksheet.mergeCells(`D${firmaRow1.number}:E${firmaRow1.number}`)

    const cellJefeUnidad = worksheet.getCell(`B${firmaRow1.number}`)
    cellJefeUnidad.value = 'JEFE DE LA UNIDAD'
    cellJefeUnidad.alignment = { horizontal: 'center' }
    cellJefeUnidad.font = { bold: true }
    worksheet.getCell(`B${firmaRow1.number - 1}`).border = { top: { style: 'thin' } }

    const cellAnalistaBienes = worksheet.getCell(`D${firmaRow1.number}`)
    cellAnalistaBienes.value = 'ANALISTA DE BIENES'
    cellAnalistaBienes.alignment = { horizontal: 'center' }
    cellAnalistaBienes.font = { bold: true }
    worksheet.getCell(`D${firmaRow1.number - 1}`).border = { top: { style: 'thin' } }

    // --- Generar Buffer ---
    const buffer = await workbook.xlsx.writeBuffer()

    // --- Nombre del archivo ---
    const datePart = new Date().toISOString().split('T')[0]
    const departmentNameClean = departamento_nombre.replace(/[^a-zA-Z0-9]/g, '_')
    const excelFileName = `Acta_Verificacion_Bienes_${departmentNameClean}_${datePart}.xlsx`

    return {
      excel: buffer,
      excelFileName
    }
  } catch (error) {
    console.error('Error en generarActaVerificacionExcelService:', error)
    throw error
  }
}
