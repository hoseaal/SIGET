import ExcelJS from 'exceljs'
import BienModel from '../../models/excelSUDEBIM.model.js'
import fs from 'fs'
import path from 'path'

class ExcelService {
  static async generateBM3Excel (departmentCode, req) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Inventario BM-3')

    // Establecer la fuente predeterminada para toda la hoja de trabajo
    worksheet.eachRow({ includeEmpty: true }, function (row) {
      row.eachCell({ includeEmpty: true }, function (cell) {
        cell.font = { name: 'Arial', size: 12 }
      })
    })

    // --- Encabezado Principal (Filas 1-7) ---

    // Fusionar celdas para el encabezado principal (C1:G7 para dejar espacio al logo)
    // El texto va de C1:G7 y el logo de A1:B3
    worksheet.mergeCells('B1:G7')
    const headerCell = worksheet.getCell('C1') // Accedemos a la celda fusionada
    headerCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    headerCell.font = { name: 'Arial', size: 12 }

    // Construir el texto del encabezado principal
    const today = new Date()
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`

    const headerText = [
      'Formulario BM-3',
      'INVENTARIO DE BIENES MUEBLES FALTANTES',
      '1. Entidad propietaria: EJECUTIVO DEL ESTADO TACHIRA   2. Servicio: CONTRALORÍA DEL ESTADO TACHIRA',
      '3. Unidad de trabajo o Dependencia: DIRECCION DE ADMINISTRACION',
      '4. Estado: TACHIRA 5. Municipio: SAN CRISTOBAL 6. Parroquia: LA CONCORDIA',
      '7. Direccion o Lugar: PROLONGACION 5TA AVENIDA, EDIFICIO CREMCO, LA CONCORDIA, SAN CRISTOBAL',
      `8. Fecha: ${formattedDate}`
    ].join('\n')

    headerCell.value = headerText

    // --- Añadir el Logo ---
    try {
      const logoPath = path.join(process.cwd(), 'public', 'img', 'logo-contraloria-home1.png')

      if (fs.existsSync(logoPath)) {
        const logo = workbook.addImage({
          buffer: fs.readFileSync(logoPath),
          extension: 'png'
        })
        // Posicionar el logo de A1 a B3
        worksheet.addImage(logo, 'A1:A3')
      } else {
        console.warn('Advertencia: El archivo del logo no se encontró en la ruta especificada:', logoPath)
      }
    } catch (logoError) {
      console.warn('Advertencia: No se pudo procesar el logo.', logoError.message)
    }

    // --- Fila 8: Clasificación (código) ---
    worksheet.mergeCells('A8:G8')
    const classificationCell = worksheet.getCell('A8')
    classificationCell.value = 'Clasificacion (codigo)'
    classificationCell.alignment = { horizontal: 'left', vertical: 'middle' }
    classificationCell.font = { name: 'Arial', size: 12 }
    classificationCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
    // Color gris solo para esta celda
    classificationCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } } // Gris claro

    const columnDefinitions = [
      { header: 'Grupo', key: 'categoria_general', width: 15 },
      { header: 'Sub-grupo', key: 'subcategoria', width: 15 },
      { header: 'Seccion', key: 'categoria_especifica', width: 15 },
      { header: 'Cantidad', key: 'cantidad', width: 15 },
      { header: 'Numero de identificacion', key: 'bim_ide', width: 30 },
      { header: 'Nombre y descripción de los elementos', key: 'bim_des', width: 70 },
      { header: 'Valor', key: 'bim_val', width: 20 }
    ]

    // Establecer las propiedades de las columnas (anchos y mapeo de keys)
    // NOTA IMPORTANTE: Esto NO imprime los headers en la hoja directamente.
    // Solo configura la estructura de las columnas para las filas de datos.
    worksheet.columns = columnDefinitions.map(col => ({
      key: col.key, // Solo la clave para mapear los datos
      width: col.width // El ancho
    }))

    // AHORA, AGREGAMOS LA FILA 9 EXPLICITAMENTE CON LOS HEADERS
    const headerValues = columnDefinitions.map(col => col.header)
    const headerRow = worksheet.getRow(9)
    headerRow.values = headerValues // Asignar los valores de los headers a la fila 9

    // Aplicar estilos a las celdas de la fila 9 (encabezados de la tabla)
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 10, bold: true }
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } } // Color gris
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    // --- Datos de la Base de Datos (a partir de la fila 10) ---
    const bienes = await BienModel.getBM3ForExcel()

    bienes.forEach(bien => {
      worksheet.addRow({
        categoria_general: bien.categoria_general,
        subcategoria: bien.subcategoria,
        categoria_especifica: bien.categoria_especifica,
        cantidad: '01', // Siempre '01'
        bim_ide: bien.bim_ide,
        bim_des: bien.bim_des,
        bim_val: bien.bim_val
      })
    })

    // Aplicar bordes a las celdas de datos y formatear el valor
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 9) { // Aplicar a partir de la fila 10 (después de los encabezados)
        row.height = 30
        row.eachCell((cell, colNumber) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          // Formatear la columna 'Valor' como moneda
          if (colNumber === columnDefinitions.findIndex(col => col.key === 'bim_val') + 1) {
            cell.numFmt = '#,##0.00' // Formato de número con dos decimales y separador de miles
          }
        })
      }
    })

    // Retornar el buffer del archivo Excel
    return await workbook.xlsx.writeBuffer()
  }

  catch (error) {
    console.error('Error crítico en generateBM1Excel:', error.message)
    throw error
  }
}

export default ExcelService
