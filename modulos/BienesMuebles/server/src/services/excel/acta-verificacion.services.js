/* eslint-disable camelcase */
import ExcelJS from 'exceljs'
import path from 'path'
import fs from 'fs'

// --- Función para hacer fetch a la API ---
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
      if (response.status === 404) {
        return []
      }
      throw new Error(`Error en la petición a ${url}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error al hacer fetch a ${url}:`, error)
    return []
  }
}

function toUpperCase (str) {
  return str ? str.toUpperCase() : 'N/A'
}

// --- Función para extraer y aplanar los bienes de los préstamos ---
const extraerBienesPrestamo = (data) => {
  if (!data || !Array.isArray(data)) return []

  return data.flatMap(prestamo => {
    try {
      const detalles = typeof prestamo.bienes_detalles === 'string' 
        ? JSON.parse(prestamo.bienes_detalles) 
        : (prestamo.bienes_detalles || [])

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
      return [] 
    }
  })
}

export const generarActaVerificacionExcelService = async (datos, accessToken) => {
  try {
    const { dep_ide, departamento_nombre } = datos

    // 1. --- OBTENER TODOS LOS DATOS ---
    const [
      bienesAllData,
      prestamosSalientesData,
      prestamosEntrantesData,
      bienesEnAlmacenData    
    ] = await Promise.all([
      fetchApiData(`/api/bienes/all?dep=${dep_ide}&inc=1`, accessToken),
      fetchApiData(`/api/prestamos/normales?dep_origen_id=${dep_ide}`, accessToken),
      fetchApiData(`/api/prestamos/normales?dep_destino_id=${dep_ide}`, accessToken),
      fetchApiData(`/api/prestamos/almacen?dep_origen_id=${dep_ide}`, accessToken)
    ])

    // 2. --- PROCESAR Y ESTRUCTURAR LOS DATOS ---
    const bienesDelDepartamento = Array.isArray(bienesAllData) ? bienesAllData : (bienesAllData.data || [])
    
    const prestamosSalientes = extraerBienesPrestamo(prestamosSalientesData)
    const prestamosEntrantes = extraerBienesPrestamo(prestamosEntrantesData)
    const bienesEnAlmacen = extraerBienesPrestamo(bienesEnAlmacenData)

    const salientesMap = new Map(prestamosSalientes.map(b => [b.bim_ide, b]))
    const almacenMap = new Map(bienesEnAlmacen.map(b => [b.bim_ide, b])) 

    // 3. --- CONSOLIDAR LA LISTA DE BIENES Y ASIGNAR OBSERVACIONES ---
    const excelRows = []
    // ELIMINADO: let counter = 1 (Ya no lo usamos aquí para evitar el desorden)

    // A) Procesar la lista principal
    bienesDelDepartamento.forEach(bien => {
      let observacion = bien.bim_obs || '' 
      const direccion = toUpperCase(departamento_nombre) 

      if (salientesMap.has(bien.bim_ide)) {
        const prestamo = salientesMap.get(bien.bim_ide)
        observacion = `Se encuentra en calidad de préstamo en ${prestamo.departamento_destino_nombre}`
      }
      else if (almacenMap.has(bien.bim_ide)) {
        const itemAlmacen = almacenMap.get(bien.bim_ide)
        observacion = `Ubicado en ${itemAlmacen.departamento_destino_nombre} para su resguardo`
      }

      excelRows.push({
        // num: counter++, // <--- ELIMINADO AQUÍ. Esto causaba el error.
        bim_ide: bien.bim_ide,
        bim_des: bien.bim_des,
        direccion,
        observacion
      })
    })

    // B) Añadir los bienes prestados EN ESTE departamento
    prestamosEntrantes.forEach(prestamoBien => {
      excelRows.push({
        // num: counter++, // <--- ELIMINADO AQUÍ
        bim_ide: prestamoBien.bim_ide,
        bim_des: prestamoBien.bim_des,
        direccion: toUpperCase(prestamoBien.departamento_origen_nombre),
        observacion: `Este bien pertenece a ${prestamoBien.departamento_origen_nombre} y se encuentra en calidad de préstamo en esta dirección.`
      })
    })

    // C) Si es Almacén, listar resguardados
    if (dep_ide === 11 || dep_ide === 9) {
      const todosEnAlmacenData = await fetchApiData(`/api/prestamos/almacen?dep_destino_id=${dep_ide}`, accessToken)
      const bienesResguardados = extraerBienesPrestamo(todosEnAlmacenData)

      bienesResguardados.forEach(prestamoBien => {
        excelRows.push({
          // num: counter++, // <--- ELIMINADO AQUÍ
          bim_ide: prestamoBien.bim_ide,
          bim_des: prestamoBien.bim_des,
          direccion: prestamoBien.departamento_origen_nombre,
          observacion: `Bien perteneciente a ${prestamoBien.departamento_origen_nombre} se encuentra en ${prestamoBien.departamento_destino_nombre} para su resguardo`
        })
      })
    }

    // 4. --- CREACIÓN DEL DOCUMENTO EXCEL ---
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
      'REPORTE DE VERIFICACIÓN DEL INVENTARIO DE BIENES MUEBLES',
      'UNIDAD EJECUTORA: CONTRALORÍA DEL ESTADO TÁCHIRA',
      'DIRECCION O UNIDAD ADMINISTRATIVA: DIRECCIÓN DE ADMINISTRACIÓN',
      `FECHA DEL REPORTE: ${formattedDate}`,
      `${toUpperCase(departamento_nombre)}`,
      ' '
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

    // --- ORDENAR Y POBLAR LAS FILAS ---
    
    // 1. Ordenamos el array completo por ID del bien (bim_ide)
    // Usamos localeCompare con numeric: true para que ordene bien "2" antes de "10"
    excelRows.sort((a, b) => {
      return String(a.bim_ide).localeCompare(String(b.bim_ide), undefined, { numeric: true });
    });

    // 2. Ahora escribimos las filas y asignamos el número secuencial (index + 1)
    const startDataRow = columnHeaderRowNumber + 1
    
    excelRows.forEach((rowData, index) => {
      const row = worksheet.getRow(startDataRow + index)
      
      // AQUÍ ESTÁ LA SOLUCIÓN: Usamos (index + 1) como el número de lista.
      // Como 'excelRows' ya está ordenado, el índice 0 será el bien más bajo y tendrá el Nº 1.
      row.values = [
        index + 1, // <--- NÚMERO GENERADO AL FINAL
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